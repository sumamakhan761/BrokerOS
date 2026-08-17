import { Tabs } from 'expo-router';
import { authClient } from '../../lib/auth-client';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { setAuthTokenForBackground, startListening, stopListening } from '../../modules/auto-dialer';
import { useCallStatus } from '../../hooks/useCallStatus';
import * as Location from 'expo-location';
import { SocketContext } from '../../lib/SocketContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function DashboardLayout() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [roleCode, setRoleCode] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Register the native PhoneStateListener so onCallStarted/onCallEnded events fire
  useEffect(() => {
    startListening();
    return () => { stopListening(); };
  }, []);

  // Sync on-call status to backend whenever a call starts/ends (foreground path)
  useCallStatus();

  useEffect(() => {
    const user = session?.user as any;
    if (user?.roleId) {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      fetch(`${baseUrl}/roles`)
        .then(res => res.json())
        .then(roles => {
          const role = roles.find((r: any) => r.id === user.roleId);
          if (role) setRoleCode(role.code);
        })
        .catch(console.error);

      // Pass token to native module for background recording uploads
      if (session?.session?.token) {
        // Better Auth directly exposes the token in the session object in v1
        setAuthTokenForBackground(String(session.session.token), baseUrl);
      } else {
        // Fallback to reading the raw cookies
        SecureStore.getItemAsync('better-auth_cookie').then(cookieJson => {
          if (cookieJson) {
            try {
              const cookies = JSON.parse(cookieJson);
              let token = cookies['better-auth.session_token'];

              if (token) {
                // If it's an object for some reason (e.g. { value: "..." }), extract the value or stringify it
                if (typeof token === 'object' && token.value) {
                  token = token.value;
                } else if (typeof token === 'object') {
                  token = JSON.stringify(token); // Fallback so Kotlin doesn't crash
                }

                setAuthTokenForBackground(String(token), baseUrl);
              } else {
                console.log("No better-auth.session_token found in cookie JSON");
              }
            } catch (e) {
              console.error("Failed to parse better-auth_cookie", e);
            }
          }
        });
      }

      // Initialize Push Notifications and WebSockets
      registerForPushNotificationsAsync().then(token => {
        if (token && user?.id) {
          fetch(`${baseUrl}/api/users/${user.id}/push-token`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          }).catch(console.error);
        }
      });

      const newSocket = io(baseUrl, {
        query: { userId: user.id },
        transports: ['websocket'],
      });

      newSocket.on("new_notification", (notification) => {
        setUnreadCount(prev => prev + 1);
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isPending, session]);

  async function registerForPushNotificationsAsync() {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.log('Skipping Expo Push Token: No EAS projectId found. Run `eas init` to configure Push Notifications.');
        return null;
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
    } catch (e) {
      console.log('Push Token Error:', e);
    }
    return token;
  }

  useEffect(() => {
    Notifications.setNotificationCategoryAsync('site_visit_arrive', [
      {
        identifier: 'arrive',
        buttonTitle: 'Arrive',
        options: { opensAppToForeground: false }, // Process in background/foreground seamlessly
      },
    ]);

    const subscription = Notifications.addNotificationResponseReceivedListener(async response => {
      const actionIdentifier = response.actionIdentifier;
      const data = response.notification.request.content.data;

      if (actionIdentifier === 'arrive') {
        const siteVisitId = data.siteVisitId;
        if (siteVisitId) {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Error', 'Location permission is required to Arrive at a site visit.');
              return;
            }
            const location = await Location.getCurrentPositionAsync({});
            const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;

            // Note: backend ignores leadId for this specific endpoint, so 'direct' is used as placeholder
            const { error } = await authClient.$fetch(`/api/leads/direct/site-visits/${siteVisitId}/arrive`, {
              method: 'PATCH',
              baseURL: baseUrl,
              headers: { 'Content-Type': 'application/json' },
              body: { latitude: location.coords.latitude, longitude: location.coords.longitude }
            });

            if (!error) {
              Alert.alert('Success', 'Site Visit arrival confirmed!');
            } else {
              Alert.alert('Error', error.message || 'Failed to confirm arrival');
            }
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not fetch location');
          }
        }
        return; // Do not proceed to routing if it was an action button
      }

      let actionUrl = data.actionUrl;
      if (actionUrl && typeof actionUrl === 'string') {
        // Strip /dashboard/ prefix for mobile routes since (dashboard) is a route group
        if (actionUrl.startsWith('/dashboard/')) {
          actionUrl = actionUrl.replace('/dashboard/', '/');
        }
        router.push(actionUrl as any);
      }
    });

    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      if (data?.type === 'DAILY_PROGRESS' && data?.progressString) {
        // Schedule a sticky local notification
        Notifications.scheduleNotificationAsync({
          identifier: 'daily_progress_tracker',
          content: {
            title: "Today's Progress",
            body: data.progressString as string,
            sticky: true,
            autoDismiss: false,
            sound: false,
            // @ts-ignore
            channelId: 'daily-progress',
          },
          trigger: null,
        }).catch(console.error);
      }
    });

    return () => {
      subscription.remove();
      receivedSubscription.remove();
    };
  }, []);

  if (isPending || !session) {
    return (
      <View className="flex-1 bg-[#f8fafc] justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const userRole = roleCode || 'UNKNOWN';

  const allNavLinks = [
    { name: "pre-sales/index", title: "Pre-Sales", icon: "users", roles: ['PRE_SALES', 'PRE_SALES_MANAGER', 'DIRECTOR', 'ADMIN'] },
    { name: "sales/index", title: "Sales", icon: "briefcase", roles: ['SALES_EXECUTIVE', 'SALES_MANAGER', 'DIRECTOR', 'ADMIN'] },
    { name: "post-sales/index", title: "Post-Sales", icon: "clipboard", roles: ['POST_SALES', 'DIRECTOR', 'ADMIN'] },
    { name: "finance/index", title: "Finance", icon: "dollar-sign", roles: ['FINANCE', 'BUSINESS_MANAGER', 'DIRECTOR', 'ADMIN'] },
    { name: "business-manager/index", title: "Business Mgr", icon: "bar-chart-2", roles: ['BUSINESS_MANAGER', 'DIRECTOR', 'ADMIN'] },
    { name: "director/index", title: "Director", icon: "shield", roles: ['DIRECTOR', 'ADMIN'] },
    { name: "admin/index", title: "Admin", icon: "settings", roles: ['ADMIN'] },
    { name: "sourcing-manager/index", title: "Sourcing Mgr", icon: "search", roles: ['SOURCING_MANAGER', 'DIRECTOR', 'ADMIN'] },
    { name: "closing-manager/index", title: "Closing Mgr", icon: "check-circle", roles: ['CLOSING_MANAGER', 'DIRECTOR', 'ADMIN'] },
    { name: "channel-partner/index", title: "Channel Partner", icon: "link", roles: ['CHANNEL_PARTNER', 'DIRECTOR', 'ADMIN'] },
  ];

  const allPossibleScreens = [
    { name: "pre-sales/index", title: "Overview", icon: "layout", roles: ['PRE_SALES'] },
    { name: "pre-sales/lead-management", title: "Leads", icon: "list", roles: ['PRE_SALES'] },
    { name: "pre-sales/analytics", title: "Analytics", icon: "bar-chart-2", roles: ['PRE_SALES'] },
    { name: "pre-sales/settings", title: "Settings", icon: "settings", roles: ['PRE_SALES'] },
    { name: "pre-sales-manager/index", title: "Overview", icon: "layout", roles: ['PRE_SALES_MANAGER'] },
    { name: "pre-sales-manager/lead-management", title: "Leads", icon: "list", roles: ['PRE_SALES_MANAGER'] },
    { name: "pre-sales-manager/employees", title: "Employees", icon: "users", roles: ['PRE_SALES_MANAGER'] },
    { name: "pre-sales-manager/employees/[employeeId]", title: "Employee Details", icon: "user", roles: ['PRE_SALES_MANAGER'] },
    { name: "pre-sales-manager/new-leads", title: "New Leads", icon: "star", roles: ['PRE_SALES_MANAGER'] },
    { name: "pre-sales-manager/analytics", title: "Analytics", icon: "bar-chart-2", roles: ['PRE_SALES_MANAGER'] },
    { name: "pre-sales-manager/settings", title: "Settings", icon: "settings", roles: ['PRE_SALES_MANAGER'] },
    { name: "sales-executive/index", title: "Dashboard", icon: "layout", roles: ['SALES_EXECUTIVE'] },
    { name: "sales-executive/lead-management", title: "Leads", icon: "list", roles: ['SALES_EXECUTIVE'] },
    { name: "sales-executive/lead-management/[id]", title: "Lead Profile", icon: "user", roles: ['SALES_EXECUTIVE'] },
    { name: "sales-executive/approval/index", title: "Approval", icon: "check-circle", roles: ['SALES_EXECUTIVE'] },
    { name: "sales-executive/booking/index", title: "Booking", icon: "calendar", roles: ['SALES_EXECUTIVE'] },
    { name: "sales-executive/inventory/index", title: "Inventory", icon: "package", roles: ['SALES_EXECUTIVE'] },
    { name: "sales-executive/analytics/index", title: "Analytics", icon: "pie-chart", roles: ['SALES_EXECUTIVE'] },
    { name: "sales-executive/settings/index", title: "Settings", icon: "settings", roles: ['SALES_EXECUTIVE'] },
    { name: "sales-manager/index", title: "Overview", icon: "layout", roles: ['SALES_MANAGER'] },
    { name: "sales-manager/employees/index", title: "Employees", icon: "users", roles: ['SALES_MANAGER'] },
    { name: "sales-manager/employees/[employeeId]", title: "Employee Details", icon: "user", roles: ['SALES_MANAGER'] },
    { name: "sales-manager/lead-management/index", title: "Leads", icon: "list", roles: ['SALES_MANAGER'] },
    { name: "sales-manager/approval/index", title: "Approval", icon: "check-circle", roles: ['SALES_MANAGER'] },
    { name: "sales-manager/more/index", title: "More", icon: "menu", roles: ['SALES_MANAGER'] },
    { name: "sales-manager/inventory/index", title: "Inventory", icon: "package", roles: ['SALES_MANAGER'] },
    { name: "sales-manager/booking/index", title: "Booking", icon: "calendar", roles: ['SALES_MANAGER'] },
    { name: "sales-manager/analytics/index", title: "Analytics", icon: "pie-chart", roles: ['SALES_MANAGER'] },
    { name: "sales-manager/settings/index", title: "Settings", icon: "settings", roles: ['SALES_MANAGER'] },
    { name: "sales/index", title: "Sales", icon: "briefcase", roles: ['SALES_EXECUTIVE'] },
    { name: "post-sales/index", title: "Overview", icon: "layout", roles: ['POST_SALES'] },
    { name: "post-sales/lead-management", title: "Leads", icon: "list", roles: ['POST_SALES'] },
    { name: "post-sales/inventory/index", title: "Inventory", icon: "package", roles: ['POST_SALES'] },
    { name: "post-sales/commissions/index", title: "Commissions", icon: "credit-card", roles: ['POST_SALES'] },
    { name: "post-sales/handover", title: "Handover", icon: "clipboard", roles: ['POST_SALES'] },
    { name: "post-sales/analytics", title: "Analytics", icon: "pie-chart", roles: ['POST_SALES'] },
    { name: "post-sales/settings", title: "Settings", icon: "settings", roles: ['POST_SALES'] },
    { name: "finance/index", title: "Finance", icon: "dollar-sign", roles: ['FINANCE'] },
    { name: "business-manager/index", title: "Business Mgr", icon: "bar-chart-2", roles: ['BUSINESS_MANAGER'] },
    { name: "director/index", title: "Director", icon: "shield", roles: ['DIRECTOR'] },
    { name: "admin/index", title: "Admin", icon: "settings", roles: ['ADMIN'] },
    { name: "sourcing-manager/index", title: "Overview", icon: "layout", roles: ['SOURCING_MANAGER'] },
    { name: "sourcing-manager/broker-management/index", title: "Brokers", icon: "users", roles: ['SOURCING_MANAGER'] },
    { name: "sourcing-manager/commissions/index", title: "Commissions", icon: "dollar-sign", roles: ['SOURCING_MANAGER'] },
    { name: "sourcing-manager/inventory/index", title: "Inventory", icon: "package", roles: ['SOURCING_MANAGER'] },
    { name: "sourcing-manager/analytics/index", title: "Analytics", icon: "pie-chart", roles: ['SOURCING_MANAGER'] },
    { name: "sourcing-manager/settings/index", title: "Settings", icon: "settings", roles: ['SOURCING_MANAGER'] },
    { name: "closing-manager/index", title: "Overview", icon: "layout", roles: ['CLOSING_MANAGER'] },
    { name: "closing-manager/inventory/index", title: "Inventory", icon: "package", roles: ['CLOSING_MANAGER'] },
    { name: "closing-manager/lead-management/index", title: "Leads", icon: "list", roles: ['CLOSING_MANAGER'] },
    { name: "closing-manager/more/index", title: "More", icon: "menu", roles: ['CLOSING_MANAGER'] },
    { name: "closing-manager/broker-management/index", title: "Brokers", icon: "users", roles: ['CLOSING_MANAGER'] },
    { name: "closing-manager/handover/index", title: "Handover", icon: "clipboard", roles: ['CLOSING_MANAGER'] },
    { name: "closing-manager/analytics/index", title: "Analytics", icon: "pie-chart", roles: ['CLOSING_MANAGER'] },
    { name: "closing-manager/settings/index", title: "Settings", icon: "settings", roles: ['CLOSING_MANAGER'] },
    { name: "channel-partner/index", title: "Overview", icon: "layout", roles: ['CHANNEL_PARTNER'] },
    { name: "channel-partner/customer-management/index", title: "Customers", icon: "users", roles: ['CHANNEL_PARTNER'] },
    { name: "channel-partner/employees/index", title: "Employees", icon: "users", roles: ['CHANNEL_PARTNER'] },
    { name: "channel-partner/employees/[employeeId]", title: "Employee Details", icon: "user", roles: ['CHANNEL_PARTNER'] },
    { name: "channel-partner/more/index", title: "More", icon: "menu", roles: ['CHANNEL_PARTNER'] },
    { name: "channel-partner/inventory/index", title: "Inventory", icon: "package", roles: ['CHANNEL_PARTNER'] },
    { name: "channel-partner/broker-management/index", title: "Brokers", icon: "users", roles: ['CHANNEL_PARTNER'] },
    { name: "channel-partner/analytics/index", title: "Analytics", icon: "pie-chart", roles: ['CHANNEL_PARTNER'] },
    { name: "channel-partner/settings/index", title: "Settings", icon: "settings", roles: ['CHANNEL_PARTNER'] },
    { name: "index", title: "Dashboard", icon: "layout", roles: [] }, // implicitly created by expo router, must be explicitly hidden
    { name: "pre-sales", title: "Pre-Sales", icon: "layout", roles: [] },
    { name: "pre-sales-manager", title: "Pre-Sales Manager", icon: "layout", roles: [] },
    { name: "sales-executive", title: "Sales Executive", icon: "layout", roles: [] },
    { name: "sales", title: "Sales", icon: "layout", roles: [] },
    { name: "post-sales", title: "Post-Sales", icon: "layout", roles: [] },
    { name: "finance", title: "Finance", icon: "layout", roles: [] },
    { name: "business-manager", title: "Business Manager", icon: "layout", roles: [] },
    { name: "director", title: "Director", icon: "layout", roles: [] },
    { name: "admin", title: "Admin", icon: "layout", roles: [] },
    { name: "sourcing-manager", title: "Sourcing Manager", icon: "layout", roles: [] },
    { name: "closing-manager", title: "Closing Manager", icon: "layout", roles: [] },
    { name: "channel-partner", title: "Channel Partner", icon: "layout", roles: [] },
    { name: "notifications", title: "Notifications", icon: "bell", roles: [] },
    { name: "chat/index", title: "Messages", icon: "message-circle", roles: [] },
    { name: "chat/[id]", title: "Chat Room", icon: "message-circle", roles: [] }
  ];

  let navLinks = allNavLinks.filter(link => link.roles.includes('*') || link.roles.includes(userRole));

  if (userRole === 'PRE_SALES') {
    navLinks = [
      { name: "pre-sales/index", title: "Dashboard", icon: "layout", roles: ['PRE_SALES'] },
      { name: "pre-sales/lead-management", title: "Leads", icon: "list", roles: ['PRE_SALES'] },
      { name: "pre-sales/analytics", title: "Analytics", icon: "bar-chart-2", roles: ['PRE_SALES'] },
      { name: "pre-sales/settings", title: "Settings", icon: "settings", roles: ['PRE_SALES'] },
    ];
  } else if (userRole === 'PRE_SALES_MANAGER') {
    navLinks = [
      { name: "pre-sales-manager/index", title: "Overview", icon: "layout", roles: ['PRE_SALES_MANAGER'] },
      { name: "pre-sales-manager/lead-management", title: "Leads", icon: "list", roles: ['PRE_SALES_MANAGER'] },
      { name: "pre-sales-manager/employees", title: "Employees", icon: "users", roles: ['PRE_SALES_MANAGER'] },
      { name: "pre-sales-manager/new-leads", title: "New Leads", icon: "star", roles: ['PRE_SALES_MANAGER'] },
      { name: "pre-sales-manager/analytics", title: "Analytics", icon: "bar-chart-2", roles: ['PRE_SALES_MANAGER'] },
      { name: "pre-sales-manager/settings", title: "Settings", icon: "settings", roles: ['PRE_SALES_MANAGER'] },
    ];
  } else if (userRole === 'SALES_EXECUTIVE') {
    navLinks = [
      { name: "sales-executive/index", title: "Dashboard", icon: "layout", roles: ['SALES_EXECUTIVE'] },
      { name: "sales-executive/lead-management", title: "Leads", icon: "list", roles: ['SALES_EXECUTIVE'] },
      { name: "sales-executive/approval/index", title: "Approval", icon: "check-circle", roles: ['SALES_EXECUTIVE'] },
      { name: "sales-executive/booking/index", title: "Booking", icon: "calendar", roles: ['SALES_EXECUTIVE'] },
      { name: "sales-executive/inventory/index", title: "Inventory", icon: "package", roles: ['SALES_EXECUTIVE'] },
      { name: "sales-executive/analytics/index", title: "Analytics", icon: "pie-chart", roles: ['SALES_EXECUTIVE'] },
      { name: "sales-executive/settings/index", title: "Settings", icon: "settings", roles: ['SALES_EXECUTIVE'] },
    ];
  } else if (userRole === 'SALES_MANAGER') {
    navLinks = [
      { name: "sales-manager/index", title: "Dashboard", icon: "layout", roles: ['SALES_MANAGER'] },
      { name: "sales-manager/employees/index", title: "Employees", icon: "users", roles: ['SALES_MANAGER'] },
      { name: "sales-manager/lead-management/index", title: "Leads", icon: "list", roles: ['SALES_MANAGER'] },
      { name: "sales-manager/approval/index", title: "Approval", icon: "check-circle", roles: ['SALES_MANAGER'] },
      { name: "sales-manager/more/index", title: "More", icon: "menu", roles: ['SALES_MANAGER'] },
    ];
  } else if (userRole === 'POST_SALES') {
    navLinks = [
      { name: "post-sales/index", title: "Overview", icon: "layout", roles: ['POST_SALES'] },
      { name: "post-sales/lead-management", title: "Leads", icon: "list", roles: ['POST_SALES'] },
      { name: "post-sales/inventory/index", title: "Inventory", icon: "package", roles: ['POST_SALES'] },
      { name: "post-sales/handover", title: "Handover", icon: "clipboard", roles: ['POST_SALES'] },
      { name: "post-sales/commissions/index", title: "Commissions", icon: "credit-card", roles: ['POST_SALES'] },
      { name: "post-sales/analytics", title: "Analytics", icon: "pie-chart", roles: ['POST_SALES'] },
      { name: "post-sales/settings", title: "Settings", icon: "settings", roles: ['POST_SALES'] },
    ];
  } else if (userRole === 'SOURCING_MANAGER') {
    navLinks = [
      { name: "sourcing-manager/index", title: "Overview", icon: "layout", roles: ['SOURCING_MANAGER'] },
      { name: "sourcing-manager/broker-management/index", title: "Brokers", icon: "users", roles: ['SOURCING_MANAGER'] },
      { name: "sourcing-manager/commissions/index", title: "Commissions", icon: "dollar-sign", roles: ['SOURCING_MANAGER'] },
      { name: "sourcing-manager/inventory/index", title: "Inventory", icon: "package", roles: ['SOURCING_MANAGER'] },
      { name: "sourcing-manager/analytics/index", title: "Analytics", icon: "pie-chart", roles: ['SOURCING_MANAGER'] },
      { name: "sourcing-manager/settings/index", title: "Settings", icon: "settings", roles: ['SOURCING_MANAGER'] },
    ];
  } else if (userRole === 'CLOSING_MANAGER') {
    navLinks = [
      { name: "closing-manager/index", title: "Overview", icon: "layout", roles: ['CLOSING_MANAGER'] },
      { name: "closing-manager/inventory/index", title: "Inventory", icon: "package", roles: ['CLOSING_MANAGER'] },
      { name: "closing-manager/lead-management/index", title: "Leads", icon: "list", roles: ['CLOSING_MANAGER'] },
      { name: "closing-manager/more/index", title: "More", icon: "menu", roles: ['CLOSING_MANAGER'] },
    ];
  } else if (userRole === 'CHANNEL_PARTNER') {
    navLinks = [
      { name: "channel-partner/index", title: "Overview", icon: "layout", roles: ['CHANNEL_PARTNER'] },
      { name: "channel-partner/customer-management/index", title: "Customers", icon: "users", roles: ['CHANNEL_PARTNER'] },
      { name: "channel-partner/employees/index", title: "Employees", icon: "users", roles: ['CHANNEL_PARTNER'] },
      { name: "channel-partner/more/index", title: "More", icon: "menu", roles: ['CHANNEL_PARTNER'] },
    ];
  }

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SocketContext.Provider value={{ socket }}>
      <Tabs screenOptions={{
        headerStyle: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
        headerTintColor: '#0f172a',
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e2e8f0', elevation: 10, paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 10, paddingBottom: 4 },
        tabBarIconStyle: { marginTop: 4 },
        tabBarItemStyle: { display: 'none' }, // hide all implicitly generated tabs by default
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <Feather
              name="message-circle"
              size={22}
              color="#0f172a"
              style={{ marginRight: 20 }}
              onPress={() => {
                router.push('/(dashboard)/chat' as any);
              }}
            />
            <Feather
              name="bell"
              size={22}
              color="#0f172a"
              style={{ marginRight: 20 }}
              onPress={() => {
                setUnreadCount(0); // optimistic reset
                router.push('/(dashboard)/notifications');
              }}
            />
            {unreadCount > 0 && (
              <View style={{ position: 'absolute', right: 38, top: -5, backgroundColor: 'red', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{unreadCount}</Text>
              </View>
            )}
            <Feather
              name="log-out"
              size={22}
              color="#ef4444"
              onPress={handleSignOut}
            />
          </View>
        ),
      }}>
        {allPossibleScreens.map(link => {
          const isVisible = navLinks.some(nl => nl.name === link.name);
          return (
            <Tabs.Screen
              key={link.name}
              name={link.name}
              options={{
                title: link.title,
                tabBarLabel: link.title,
                href: isVisible ? undefined : null, // dynamically hides the tab from the bottom bar
                tabBarItemStyle: { display: isVisible ? 'flex' : 'none' }, // explicitly show the tab if visible
                tabBarIcon: ({ color, size }) => (
                  <Feather name={link.icon as any} size={size} color={color} />
                )
              }}
            />
          );
        })}
      </Tabs>
    </SocketContext.Provider>
  );
}
