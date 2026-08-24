import { Tabs } from 'expo-router';
import { authClient } from '../../lib/auth-client';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import {
  LayoutDashboard,
  ListFilter,
  Users,
  User,
  Sparkles,
  BarChart2,
  PieChart,
  Settings,
  CheckCircle2,
  Calendar,
  Building2,
  Briefcase,
  CreditCard,
  ClipboardCheck,
  IndianRupee,
  ShieldCheck,
  Search,
  Network,
  MoreHorizontal,
  Bell,
  MessageSquare,
  LogOut,
} from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { setAuthTokenForBackground, startListening, stopListening } from '../../modules/auto-dialer';
import { useCallStatus } from '../../hooks/useCallStatus';
import * as Location from 'expo-location';
import { SocketContext } from '../../lib/SocketContext';
import * as Haptics from 'expo-haptics';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function renderTabIcon(iconName: string, color: string, size: number) {
  switch (iconName) {
    case 'layout':
      return <LayoutDashboard size={20} color={color} strokeWidth={2} />;
    case 'list':
      return <ListFilter size={20} color={color} strokeWidth={2} />;
    case 'users':
      return <Users size={20} color={color} strokeWidth={2} />;
    case 'user':
      return <User size={20} color={color} strokeWidth={2} />;
    case 'star':
      return <Sparkles size={20} color={color} strokeWidth={2} />;
    case 'bar-chart-2':
      return <BarChart2 size={20} color={color} strokeWidth={2} />;
    case 'pie-chart':
      return <PieChart size={20} color={color} strokeWidth={2} />;
    case 'settings':
      return <Settings size={20} color={color} strokeWidth={2} />;
    case 'check-circle':
      return <CheckCircle2 size={20} color={color} strokeWidth={2} />;
    case 'calendar':
      return <Calendar size={20} color={color} strokeWidth={2} />;
    case 'package':
      return <Building2 size={20} color={color} strokeWidth={2} />;
    case 'briefcase':
      return <Briefcase size={20} color={color} strokeWidth={2} />;
    case 'credit-card':
      return <CreditCard size={20} color={color} strokeWidth={2} />;
    case 'clipboard':
      return <ClipboardCheck size={20} color={color} strokeWidth={2} />;
    case 'dollar-sign':
      return <IndianRupee size={20} color={color} strokeWidth={2} />;
    case 'shield':
      return <ShieldCheck size={20} color={color} strokeWidth={2} />;
    case 'search':
      return <Search size={20} color={color} strokeWidth={2} />;
    case 'link':
      return <Network size={20} color={color} strokeWidth={2} />;
    case 'menu':
      return <MoreHorizontal size={20} color={color} strokeWidth={2} />;
    case 'bell':
      return <Bell size={20} color={color} strokeWidth={2} />;
    case 'message-circle':
      return <MessageSquare size={20} color={color} strokeWidth={2} />;
    default:
      return <LayoutDashboard size={20} color={color} strokeWidth={2} />;
  }
}

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
        .then((res) => res.json())
        .then((roles) => {
          const role = roles.find((r: any) => r.id === user.roleId);
          if (role) setRoleCode(role.code);
        })
        .catch(console.error);

      // Pass token to native module for background recording uploads
      if (session?.session?.token) {
        setAuthTokenForBackground(String(session.session.token), baseUrl);
      } else {
        SecureStore.getItemAsync('better-auth_cookie').then((cookieJson) => {
          if (cookieJson) {
            try {
              const cookies = JSON.parse(cookieJson);
              let token = cookies['better-auth.session_token'];

              if (token) {
                if (typeof token === 'object' && token.value) {
                  token = token.value;
                } else if (typeof token === 'object') {
                  token = JSON.stringify(token);
                }
                setAuthTokenForBackground(String(token), baseUrl);
              }
            } catch (e) {
              console.error('Failed to parse better-auth_cookie', e);
            }
          }
        });
      }

      // Initialize Push Notifications and WebSockets
      registerForPushNotificationsAsync().then((token) => {
        if (token && user?.id) {
          fetch(`${baseUrl}/api/users/${user.id}/push-token`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }).catch(console.error);
        }
      });

      const newSocket = io(baseUrl, {
        query: { userId: user.id },
        transports: ['websocket'],
      });

      newSocket.on('new_notification', () => {
        setUnreadCount((prev) => prev + 1);
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
    try {
      Notifications.setNotificationCategoryAsync('site_visit_arrive', [
        {
          identifier: 'arrive',
          buttonTitle: 'Arrive',
          options: { opensAppToForeground: false },
        },
      ]).catch(() => { });
    } catch (e) {
      console.warn('[Notifications] setNotificationCategoryAsync unavailable:', e);
    }

    let subscription: any = null;
    let receivedSubscription: any = null;

    try {
      subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
        const actionIdentifier = response.actionIdentifier;
        const data = response.notification.request.content.data;

        if (actionIdentifier === 'arrive') {
          const siteVisitId = data.siteVisitId;
          if (siteVisitId) {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Toast.show({ type: 'error', text1: 'Error', text2: 'Location permission is required to Arrive at a site visit.' });
                return;
              }
              const location = await Location.getCurrentPositionAsync({});
              const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;

              const { error } = await authClient.$fetch(`/api/leads/direct/site-visits/${siteVisitId}/arrive`, {
                method: 'PATCH',
                baseURL: baseUrl,
                headers: { 'Content-Type': 'application/json' },
                body: { latitude: location.coords.latitude, longitude: location.coords.longitude },
              });

              if (!error) {
                Toast.show({ type: 'success', text1: 'Success', text2: 'Site Visit arrival confirmed!' });
              } else {
                Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to confirm arrival' });
              }
            } catch (e: any) {
              Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Could not fetch location' });
            }
          }
          return;
        }

        let actionUrl = data.actionUrl;
        if (actionUrl && typeof actionUrl === 'string') {
          if (actionUrl.startsWith('/dashboard/')) {
            actionUrl = actionUrl.replace('/dashboard/', '/');
          }
          router.push(actionUrl as any);
        }
      });
    } catch (e) {
      console.warn('[Notifications] addNotificationResponseReceivedListener unavailable:', e);
    }

    try {
      receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data;
        if (data?.type === 'DAILY_PROGRESS' && data?.progressString) {
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
    } catch (e) {
      console.warn('[Notifications] addNotificationReceivedListener unavailable:', e);
    }

    return () => {
      subscription?.remove?.();
      receivedSubscription?.remove?.();
    };
  }, []);

  if (isPending || !session) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const userRole = roleCode || 'UNKNOWN';

  const allPossibleScreens = [
    { name: 'pre-sales/index', title: 'Overview', icon: 'layout', roles: ['PRE_SALES'] },
    { name: 'pre-sales/lead-management', title: 'Leads', icon: 'list', roles: ['PRE_SALES'] },
    { name: 'pre-sales/analytics', title: 'Analytics', icon: 'bar-chart-2', roles: ['PRE_SALES'] },
    { name: 'pre-sales/settings', title: 'Settings', icon: 'settings', roles: ['PRE_SALES'] },
    { name: 'pre-sales-manager/index', title: 'Overview', icon: 'layout', roles: ['PRE_SALES_MANAGER'] },
    { name: 'pre-sales-manager/lead-management', title: 'Leads', icon: 'list', roles: ['PRE_SALES_MANAGER'] },
    { name: 'pre-sales-manager/employees', title: 'Employees', icon: 'users', roles: ['PRE_SALES_MANAGER'] },
    { name: 'pre-sales-manager/employees/[employeeId]', title: 'Employee Details', icon: 'user', roles: ['PRE_SALES_MANAGER'] },
    { name: 'pre-sales-manager/new-leads', title: 'New Leads', icon: 'star', roles: ['PRE_SALES_MANAGER'] },
    { name: 'pre-sales-manager/analytics', title: 'Analytics', icon: 'bar-chart-2', roles: ['PRE_SALES_MANAGER'] },
    { name: 'pre-sales-manager/settings', title: 'Settings', icon: 'settings', roles: ['PRE_SALES_MANAGER'] },
    { name: 'sales-executive/index', title: 'Dashboard', icon: 'layout', roles: ['SALES_EXECUTIVE'] },
    { name: 'sales-executive/lead-management', title: 'Leads', icon: 'list', roles: ['SALES_EXECUTIVE'] },
    { name: 'sales-executive/lead-management/[id]', title: 'Lead Profile', icon: 'user', roles: ['SALES_EXECUTIVE'] },
    { name: 'sales-executive/approval/index', title: 'Approval', icon: 'check-circle', roles: ['SALES_EXECUTIVE'] },
    { name: 'sales-executive/booking/index', title: 'Booking', icon: 'calendar', roles: ['SALES_EXECUTIVE'] },
    { name: 'sales-executive/more/index', title: 'More', icon: 'menu', roles: ['SALES_EXECUTIVE'] },
    { name: 'sales-executive/inventory/index', title: 'Inventory', icon: 'package', roles: ['SALES_EXECUTIVE'] },
    { name: 'sales-executive/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['SALES_EXECUTIVE'] },
    { name: 'sales-executive/analytics/index', title: 'Analytics', icon: 'pie-chart', roles: ['SALES_EXECUTIVE'] },
    { name: 'sales-executive/settings/index', title: 'Settings', icon: 'settings', roles: ['SALES_EXECUTIVE'] },
    { name: 'sales-manager/index', title: 'Overview', icon: 'layout', roles: ['SALES_MANAGER'] },
    { name: 'sales-manager/employees/index', title: 'Employees', icon: 'users', roles: ['SALES_MANAGER'] },
    { name: 'sales-manager/employees/[employeeId]', title: 'Employee Details', icon: 'user', roles: ['SALES_MANAGER'] },
    { name: 'sales-manager/lead-management/index', title: 'Leads', icon: 'list', roles: ['SALES_MANAGER'] },
    { name: 'sales-manager/approval/index', title: 'Approval', icon: 'check-circle', roles: ['SALES_MANAGER'] },
    { name: 'sales-manager/more/index', title: 'More', icon: 'menu', roles: ['SALES_MANAGER'] },
    { name: 'sales-manager/inventory/index', title: 'Inventory', icon: 'package', roles: ['SALES_MANAGER'] },
    { name: 'sales-manager/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['SALES_MANAGER'] },
    { name: 'sales-manager/booking/index', title: 'Booking', icon: 'calendar', roles: ['SALES_MANAGER'] },
    { name: 'sales-manager/analytics/index', title: 'Analytics', icon: 'pie-chart', roles: ['SALES_MANAGER'] },
    { name: 'sales-manager/settings/index', title: 'Settings', icon: 'settings', roles: ['SALES_MANAGER'] },
    { name: 'sales/index', title: 'Sales', icon: 'briefcase', roles: ['SALES_EXECUTIVE'] },
    { name: 'post-sales/index', title: 'Overview', icon: 'layout', roles: ['POST_SALES'] },
    { name: 'post-sales/lead-management', title: 'Leads', icon: 'list', roles: ['POST_SALES'] },
    { name: 'post-sales/inventory/index', title: 'Inventory', icon: 'package', roles: ['POST_SALES'] },
    { name: 'post-sales/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['POST_SALES'] },
    { name: 'post-sales/commissions/index', title: 'Commissions', icon: 'credit-card', roles: ['POST_SALES'] },
    { name: 'post-sales/more/index', title: 'More', icon: 'menu', roles: ['POST_SALES'] },
    { name: 'post-sales/handover', title: 'Handover', icon: 'clipboard', roles: ['POST_SALES'] },
    { name: 'post-sales/analytics', title: 'Analytics', icon: 'pie-chart', roles: ['POST_SALES'] },
    { name: 'post-sales/settings', title: 'Settings', icon: 'settings', roles: ['POST_SALES'] },
    { name: 'post-sales-manager/index', title: 'Overview', icon: 'layout', roles: ['POST_SALES_MANAGER'] },
    { name: 'post-sales-manager/employees/index', title: 'Employees', icon: 'users', roles: ['POST_SALES_MANAGER'] },
    { name: 'post-sales-manager/employees/[employeeId]', title: 'Employee Details', icon: 'user', roles: ['POST_SALES_MANAGER'] },
    { name: 'post-sales-manager/lead-management', title: 'Leads', icon: 'list', roles: ['POST_SALES_MANAGER'] },
    { name: 'post-sales-manager/inventory/index', title: 'Inventory', icon: 'package', roles: ['POST_SALES_MANAGER'] },
    { name: 'post-sales-manager/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['POST_SALES_MANAGER'] },
    { name: 'post-sales-manager/commissions/index', title: 'Commissions', icon: 'credit-card', roles: ['POST_SALES_MANAGER'] },
    { name: 'post-sales-manager/more/index', title: 'More', icon: 'menu', roles: ['POST_SALES_MANAGER'] },
    { name: 'post-sales-manager/handover', title: 'Handover', icon: 'clipboard', roles: ['POST_SALES_MANAGER'] },
    { name: 'post-sales-manager/analytics', title: 'Analytics', icon: 'pie-chart', roles: ['POST_SALES_MANAGER'] },
    { name: 'post-sales-manager/settings', title: 'Settings', icon: 'settings', roles: ['POST_SALES_MANAGER'] },
    { name: 'finance/index', title: 'Finance', icon: 'dollar-sign', roles: ['FINANCE'] },
    { name: 'business-manager/index', title: 'Business Mgr', icon: 'bar-chart-2', roles: ['BUSINESS_MANAGER'] },
    { name: 'director/index', title: 'Director', icon: 'shield', roles: ['DIRECTOR'] },
    { name: 'admin/index', title: 'Admin', icon: 'settings', roles: ['ADMIN'] },
    { name: 'sourcing-manager/index', title: 'Overview', icon: 'layout', roles: ['SOURCING_MANAGER'] },
    { name: 'sourcing-manager/broker-management/index', title: 'Brokers', icon: 'users', roles: ['SOURCING_MANAGER'] },
    { name: 'sourcing-manager/commissions/index', title: 'Commissions', icon: 'dollar-sign', roles: ['SOURCING_MANAGER'] },
    { name: 'sourcing-manager/inventory/index', title: 'Inventory', icon: 'package', roles: ['SOURCING_MANAGER'] },
    { name: 'sourcing-manager/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['SOURCING_MANAGER'] },
    { name: 'sourcing-manager/analytics/index', title: 'Analytics', icon: 'pie-chart', roles: ['SOURCING_MANAGER'] },
    { name: 'sourcing-manager/settings/index', title: 'Settings', icon: 'settings', roles: ['SOURCING_MANAGER'] },
    { name: 'closing-manager/index', title: 'Overview', icon: 'layout', roles: ['CLOSING_MANAGER'] },
    { name: 'closing-manager/inventory/index', title: 'Inventory', icon: 'package', roles: ['CLOSING_MANAGER'] },
    { name: 'closing-manager/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['CLOSING_MANAGER'] },
    { name: 'closing-manager/lead-management/index', title: 'Leads', icon: 'list', roles: ['CLOSING_MANAGER'] },
    { name: 'closing-manager/more/index', title: 'More', icon: 'menu', roles: ['CLOSING_MANAGER'] },
    { name: 'closing-manager/broker-management/index', title: 'Brokers', icon: 'users', roles: ['CLOSING_MANAGER'] },
    { name: 'closing-manager/handover/index', title: 'Handover', icon: 'clipboard', roles: ['CLOSING_MANAGER'] },
    { name: 'closing-manager/analytics/index', title: 'Analytics', icon: 'pie-chart', roles: ['CLOSING_MANAGER'] },
    { name: 'closing-manager/settings/index', title: 'Settings', icon: 'settings', roles: ['CLOSING_MANAGER'] },
    { name: 'channel-partner/index', title: 'Overview', icon: 'layout', roles: ['CHANNEL_PARTNER'] },
    { name: 'channel-partner/customer-management/index', title: 'Customers', icon: 'users', roles: ['CHANNEL_PARTNER'] },
    { name: 'channel-partner/employees/index', title: 'Employees', icon: 'users', roles: ['CHANNEL_PARTNER'] },
    { name: 'channel-partner/employees/[employeeId]', title: 'Employee Details', icon: 'user', roles: ['CHANNEL_PARTNER'] },
    { name: 'channel-partner/more/index', title: 'More', icon: 'menu', roles: ['CHANNEL_PARTNER'] },
    { name: 'channel-partner/inventory/index', title: 'Inventory', icon: 'package', roles: ['CHANNEL_PARTNER'] },
    { name: 'channel-partner/inventory/[projectId]', title: 'Project Details', icon: 'package', roles: ['CHANNEL_PARTNER'] },
    { name: 'channel-partner/broker-management/index', title: 'Brokers', icon: 'users', roles: ['CHANNEL_PARTNER'] },
    { name: 'channel-partner/analytics/index', title: 'Analytics', icon: 'pie-chart', roles: ['CHANNEL_PARTNER'] },
    { name: 'channel-partner/settings/index', title: 'Settings', icon: 'settings', roles: ['CHANNEL_PARTNER'] },
    { name: 'index', title: 'Dashboard', icon: 'layout', roles: [] },
    { name: 'notifications', title: 'Notifications', icon: 'bell', roles: [] },
    { name: 'chat/index', title: 'Messages', icon: 'message-circle', roles: [] },
    { name: 'chat/[id]', title: 'Chat Room', icon: 'message-circle', roles: [] },
  ];

  let navLinks: any[] = [];

  if (userRole === 'PRE_SALES') {
    navLinks = [
      { name: 'pre-sales/index', title: 'Dashboard', icon: 'layout' },
      { name: 'pre-sales/lead-management', title: 'Leads', icon: 'list' },
      { name: 'pre-sales/analytics', title: 'Analytics', icon: 'bar-chart-2' },
      { name: 'pre-sales/settings', title: 'Settings', icon: 'settings' },
    ];
  } else if (userRole === 'PRE_SALES_MANAGER') {
    navLinks = [
      { name: 'pre-sales-manager/index', title: 'Overview', icon: 'layout' },
      { name: 'pre-sales-manager/lead-management', title: 'Leads', icon: 'list' },
      { name: 'pre-sales-manager/employees', title: 'Employees', icon: 'users' },
      { name: 'pre-sales-manager/new-leads', title: 'New Leads', icon: 'star' },
      { name: 'pre-sales-manager/analytics', title: 'Analytics', icon: 'bar-chart-2' },
      { name: 'pre-sales-manager/settings', title: 'Settings', icon: 'settings' },
    ];
  } else if (userRole === 'SALES_EXECUTIVE') {
    navLinks = [
      { name: 'sales-executive/index', title: 'Dashboard', icon: 'layout' },
      { name: 'sales-executive/lead-management', title: 'Leads', icon: 'list' },
      { name: 'sales-executive/approval/index', title: 'Approval', icon: 'check-circle' },
      { name: 'sales-executive/booking/index', title: 'Booking', icon: 'calendar' },
      { name: 'sales-executive/more/index', title: 'More', icon: 'menu' },
    ];
  } else if (userRole === 'SALES_MANAGER') {
    navLinks = [
      { name: 'sales-manager/index', title: 'Dashboard', icon: 'layout' },
      { name: 'sales-manager/employees/index', title: 'Employees', icon: 'users' },
      { name: 'sales-manager/lead-management/index', title: 'Leads', icon: 'list' },
      { name: 'sales-manager/approval/index', title: 'Approval', icon: 'check-circle' },
      { name: 'sales-manager/more/index', title: 'More', icon: 'menu' },
    ];
  } else if (userRole === 'POST_SALES') {
    navLinks = [
      { name: 'post-sales/index', title: 'Overview', icon: 'layout' },
      { name: 'post-sales/lead-management', title: 'Leads', icon: 'list' },
      { name: 'post-sales/inventory/index', title: 'Inventory', icon: 'package' },
      { name: 'post-sales/commissions/index', title: 'Commissions', icon: 'credit-card' },
      { name: 'post-sales/more/index', title: 'More', icon: 'menu' },
    ];
  } else if (userRole === 'POST_SALES_MANAGER') {
    navLinks = [
      { name: 'post-sales-manager/index', title: 'Overview', icon: 'layout' },
      { name: 'post-sales-manager/employees/index', title: 'Employees', icon: 'users' },
      { name: 'post-sales-manager/lead-management', title: 'Leads', icon: 'list' },
      { name: 'post-sales-manager/inventory/index', title: 'Inventory', icon: 'package' },
      { name: 'post-sales-manager/more/index', title: 'More', icon: 'menu' },
    ];
  } else if (userRole === 'SOURCING_MANAGER') {
    navLinks = [
      { name: 'sourcing-manager/index', title: 'Overview', icon: 'layout' },
      { name: 'sourcing-manager/broker-management/index', title: 'Brokers', icon: 'users' },
      { name: 'sourcing-manager/commissions/index', title: 'Commissions', icon: 'dollar-sign' },
      { name: 'sourcing-manager/inventory/index', title: 'Inventory', icon: 'package' },
      { name: 'sourcing-manager/analytics/index', title: 'Analytics', icon: 'pie-chart' },
      { name: 'sourcing-manager/settings/index', title: 'Settings', icon: 'settings' },
    ];
  } else if (userRole === 'CLOSING_MANAGER') {
    navLinks = [
      { name: 'closing-manager/index', title: 'Overview', icon: 'layout' },
      { name: 'closing-manager/inventory/index', title: 'Inventory', icon: 'package' },
      { name: 'closing-manager/lead-management/index', title: 'Leads', icon: 'list' },
      { name: 'closing-manager/more/index', title: 'More', icon: 'menu' },
    ];
  } else if (userRole === 'CHANNEL_PARTNER') {
    navLinks = [
      { name: 'channel-partner/index', title: 'Overview', icon: 'layout' },
      { name: 'channel-partner/customer-management/index', title: 'Customers', icon: 'users' },
      { name: 'channel-partner/employees/index', title: 'Employees', icon: 'users' },
      { name: 'channel-partner/more/index', title: 'More', icon: 'menu' },
    ];
  }

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await authClient.signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SocketContext.Provider value={{ socket }}>
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 1,
            shadowColor: '#0f172a',
            shadowOpacity: 0.04,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
          },
          headerTintColor: '#0f172a',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 17,
          },
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e2e8f0',
            elevation: 10,
            paddingBottom: 6,
            height: 62,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            paddingBottom: 2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarItemStyle: { display: 'none' },
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(dashboard)/chat' as any);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="w-9 h-9 rounded-xl bg-slate-50 items-center justify-center border border-slate-200/80 mr-2.5 active:scale-95"
              >
                <MessageSquare size={18} color="#0f172a" />
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setUnreadCount(0);
                  router.push('/(dashboard)/notifications');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="w-9 h-9 rounded-xl bg-slate-50 items-center justify-center border border-slate-200/80 mr-2.5 active:scale-95 relative"
              >
                <Bell size={18} color="#0f172a" />
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 bg-rose-600 rounded-full min-w-[16px] h-4 px-1 items-center justify-center border border-white">
                    <Text className="text-[9px] font-black text-white">{unreadCount > 99 ? '99+' : unreadCount}</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={handleSignOut}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="w-9 h-9 rounded-xl bg-rose-50 items-center justify-center border border-rose-200/80 active:scale-95"
              >
                <LogOut size={17} color="#e11d48" />
              </Pressable>
            </View>
          ),
        }}
      >
        {allPossibleScreens.map((link) => {
          const isVisible = navLinks.some((nl) => nl.name === link.name);
          return (
            <Tabs.Screen
              key={link.name}
              name={link.name}
              options={{
                title: link.title,
                tabBarLabel: link.title,
                href: isVisible ? undefined : null,
                tabBarItemStyle: { display: isVisible ? 'flex' : 'none' },
                tabBarIcon: ({ color, size }) => renderTabIcon(link.icon, color, size),
              }}
              listeners={{
                tabPress: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                },
              }}
            />
          );
        })}
      </Tabs>
    </SocketContext.Provider>
  );
}
