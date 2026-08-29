import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserCheck, X, Search, Briefcase, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export type Role = { id: string; name: string; code: string };

export interface RolePickerModalProps {
  visible: boolean;
  onClose: () => void;
  roles: Role[];
  selectedRoleId: string;
  onSelectRole: (role: Role) => void;
}

export function RolePickerModal({
  visible,
  onClose,
  roles,
  selectedRoleId,
  onSelectRole,
}: RolePickerModalProps) {
  const insets = useSafeAreaInsets();
  const [roleSearch, setRoleSearch] = useState('');

  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return roles;
    const q = roleSearch.toLowerCase();
    return roles.filter(
      (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
    );
  }, [roles, roleSearch]);

  const handleSelect = (role: Role) => {
    Haptics.selectionAsync();
    onSelectRole(role);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <Pressable className="flex-1" onPress={onClose} />

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
              onPress={onClose}
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
              const isSelected = item.id === selectedRoleId;
              return (
                <Pressable
                  onPress={() => handleSelect(item)}
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
  );
}
