import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { authClient } from '../../lib/auth-client';
import {
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  Building2,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Check,
  Search,
  X,
  Briefcase,
  UserCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type Role = { id: string; name: string; code: string };

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');

  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');

  const router = useRouter();
  const { refetch } = authClient.useSession();

  useEffect(() => {
    async function fetchRoles() {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await fetch(`${baseUrl}/roles`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setRoles(data);
        }
      } catch (err) {
        console.error('Failed to load roles', err);
      }
    }
    fetchRoles();
  }, []);

  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === roleId);
  }, [roles, roleId]);

  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return roles;
    const q = roleSearch.toLowerCase();
    return roles.filter(
      (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
    );
  }, [roles, roleSearch]);

  const handleOpenRoleModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRoleSearch('');
    setRoleModalVisible(true);
  };

  const handleSelectRole = (role: Role) => {
    Haptics.selectionAsync();
    setRoleId(role.id);
    setRoleModalVisible(false);
  };

  const handleLogin = async () => {
    setError('');
    if (!email || !password || !phoneNumber || !roleId) {
      setError('Please provide all 4 identity verification factors.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        phoneNumber: phoneNumber.trim(),
        roleId,
      } as any);

      if (authError) {
        setError(authError.message || 'Invalid credentials or role mismatch.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
      } else if (data) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refetch();
        router.replace('/(dashboard)' as any);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication service unreachable.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLoading(false);
    }
  };

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 24,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View className="items-center mb-6 pt-2">
            <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center mb-3 border border-blue-200/80 shadow-xs">
              <ShieldCheck size={28} color="#2563eb" strokeWidth={2.2} />
            </View>
            <View className="flex-row items-center gap-1.5 mb-1.5 px-3 py-0.5 rounded-full bg-blue-50/80 border border-blue-200/60">
              <Building2 size={13} color="#1d4ed8" />
              <Text className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">
                BrokerOS Mobile Gateway
              </Text>
            </View>
            <Text className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
              Strict Access Verification
            </Text>
            <Text className="text-xs text-slate-500 mt-1.5 text-center font-medium max-w-xs leading-relaxed">
              Enter your enterprise role credentials to access your designated field portal.
            </Text>
          </View>

          {/* Error Alert */}
          {error ? (
            <View className="bg-rose-50 border border-rose-200/80 p-3.5 rounded-2xl mb-4 flex-row items-center gap-2.5">
              <AlertCircle size={18} color="#e11d48" className="shrink-0" />
              <Text className="text-xs font-bold text-rose-700 flex-1">{error}</Text>
            </View>
          ) : null}

          {/* Form Card */}
          <View className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm gap-3">
            {/* Email Field */}
            <View className="gap-1.25">
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-0.5">
                Work Email
              </Text>
              <View className="relative flex-row items-center">
                <View className="absolute z-10 left-3.5">
                  <Mail size={18} color="#94a3b8" />
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="agent@brokeros.com"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="w-full pl-11 pr-4 h-13 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-slate-900 text-base font-medium"
                />
              </View>
            </View>

            {/* Phone Number Field */}
            <View className="gap-1.25">
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-0.5">
                Registered Phone Number
              </Text>
              <View className="relative flex-row items-center">
                <View className="absolute z-10 left-3.5">
                  <Phone size={18} color="#94a3b8" />
                </View>
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  className="w-full pl-11 pr-4 h-13 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-slate-900 text-base font-medium"
                />
              </View>
            </View>

            {/* Role Identity Picker */}
            <View className="gap-1.25">
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-0.5">
                Assigned Role Identity
              </Text>
              <Pressable
                onPress={handleOpenRoleModal}
                accessibilityRole="button"
                accessibilityLabel="Select Assigned Role Identity"
                className="w-full pl-3.5 pr-4 h-13 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex-row items-center justify-between active:bg-slate-100 transition-colors"
              >
                <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                  <View className="w-8 h-8 rounded-xl bg-blue-50 items-center justify-center border border-blue-100">
                    <Briefcase size={16} color="#2563eb" />
                  </View>
                  {selectedRole ? (
                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-base font-bold text-slate-900 leading-tight"
                      >
                        {selectedRole.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="text-[10px] font-bold text-blue-600 uppercase tracking-wider"
                      >
                        {selectedRole.code}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-base font-medium text-slate-400">
                      Select your department role…
                    </Text>
                  )}
                </View>
                <ChevronDown size={18} color="#64748b" strokeWidth={2.2} />
              </Pressable>
            </View>

            {/* Password Field */}
            <View>
              <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-0.5">
                Security Password
              </Text>
              <View className="relative flex-row items-center">
                <View className="absolute z-10 left-3.5">
                  <Lock size={18} color="#94a3b8" />
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  className="w-full pl-11 pr-4 h-13 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-slate-900 text-base font-medium"
                />
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className={`w-full h-13 rounded-2xl my-2 flex-row justify-center items-center active:scale-[0.98] transition-transform shadow-sm ${loading ? 'bg-blue-400' : 'bg-blue-600'
                }`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text className="text-white font-extrabold text-base tracking-wide my-2">
                    Verify & Authenticate
                  </Text>
                  <ArrowRight size={18} color="#ffffff" strokeWidth={2.5} />
                </>
              )}
            </Pressable>
          </View>

          {/* Footer Note */}
          <View className="mt-6 items-center">
            <Text className="text-[11px] text-slate-400 text-center font-medium">
              BrokerOS Enterprise Real Estate Platform • Dual Channel Architecture
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Role Selection Modern Bottom Sheet Modal */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable
            className="flex-1"
            onPress={() => setRoleModalVisible(false)}
          />

          <View
            style={{
              maxHeight: '75%',
              paddingBottom: Math.max(insets.bottom, 16),
            }}
            className="bg-white rounded-t-3xl pt-3 px-5 shadow-2xl border-t border-slate-200"
          >
            {/* Top Drag Indicator */}
            <View className="w-12 h-1 bg-slate-300 rounded-full self-center mb-3" />

            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
              <View className="flex-row items-center gap-2.5">
                <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center border border-blue-200/80">
                  <UserCheck size={20} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-base font-extrabold text-slate-900">
                    Assigned Role Identity
                  </Text>
                  <Text className="text-xs text-slate-500 font-medium">
                    Choose your authorized enterprise access portal
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => setRoleModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
              >
                <X size={16} color="#64748b" strokeWidth={2.2} />
              </Pressable>
            </View>

            {/* Search Filter Input (if roles >= 5) */}
            {roles.length >= 5 && (
              <View className="mt-3 relative flex-row items-center">
                <View className="absolute z-10 left-3">
                  <Search size={16} color="#94a3b8" />
                </View>
                <TextInput
                  value={roleSearch}
                  onChangeText={setRoleSearch}
                  placeholder="Search role by name or code…"
                  placeholderTextColor="#94a3b8"
                  className="w-full pl-9 pr-3 h-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium"
                />
              </View>
            )}

            {/* Role List */}
            <FlatList
              data={filteredRoles}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 12, gap: 8 }}
              renderItem={({ item }) => {
                const isSelected = item.id === roleId;
                return (
                  <Pressable
                    onPress={() => handleSelectRole(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    className={`p-3.5 rounded-2xl border flex-row items-center justify-between active:scale-[0.99] transition-transform ${isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100'
                      }`}
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View
                        className={`w-9 h-9 rounded-xl items-center justify-center border ${isSelected
                          ? 'bg-blue-600 border-blue-700'
                          : 'bg-white border-slate-200'
                          }`}
                      >
                        <Briefcase
                          size={18}
                          color={isSelected ? '#ffffff' : '#64748b'}
                        />
                      </View>

                      <View className="flex-1">
                        <Text
                          className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'
                            }`}
                        >
                          {item.name}
                        </Text>
                        <Text
                          className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-500'
                            }`}
                        >
                          {item.code}
                        </Text>
                      </View>
                    </View>

                    {isSelected ? (
                      <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center">
                        <Check size={14} color="#ffffff" strokeWidth={3} />
                      </View>
                    ) : (
                      <View className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View className="py-8 items-center justify-center">
                  <Text className="text-sm font-medium text-slate-400">
                    No matching roles found
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}