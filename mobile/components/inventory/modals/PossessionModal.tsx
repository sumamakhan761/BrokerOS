import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { authClient } from '@/lib/auth-client';
import { Picker } from '@react-native-picker/picker';

export type ConstructionStatus = 
  | 'NOT_STARTED'
  | 'EXCAVATION'
  | 'FOUNDATION'
  | 'SUPER_STRUCTURE'
  | 'BRICKWORK'
  | 'PLASTERING'
  | 'FINISHING'
  | 'READY_FOR_POSSESSION'
  | 'HANDOVER';

const statusLabels: Record<ConstructionStatus, string> = {
  NOT_STARTED: 'Not Started',
  EXCAVATION: 'Excavation',
  FOUNDATION: 'Foundation',
  SUPER_STRUCTURE: 'Super Structure',
  BRICKWORK: 'Brickwork',
  PLASTERING: 'Plastering',
  FINISHING: 'Finishing',
  READY_FOR_POSSESSION: 'Ready for Possession',
  HANDOVER: 'Handover'
};

interface PossessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'project' | 'tower' | 'unit';
  entityName: string;
  initialStatus?: ConstructionStatus;
  initialTimeline?: { value: number; unit: 'MONTHS' | 'YEARS' };
  onSuccess: () => void;
}

export default function PossessionModal({
  isOpen, onClose, entityId, entityType, entityName, initialStatus, initialTimeline, onSuccess
}: PossessionModalProps) {
  const [status, setStatus] = useState<ConstructionStatus>(initialStatus || 'NOT_STARTED');
  const [timeValue, setTimeValue] = useState(initialTimeline?.value?.toString() || '1');
  const [timeUnit, setTimeUnit] = useState<'MONTHS' | 'YEARS'>(initialTimeline?.unit || 'MONTHS');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      
      const endpoint = 
        entityType === 'project' ? `/api/inventory/projects/${entityId}/possession` :
        entityType === 'tower' ? `/api/inventory/towers/${entityId}/possession` :
        `/api/inventory/units/${entityId}/possession`;

      const res = await authClient.$fetch(`${baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          status,
          timeline: { value: parseInt(timeValue) || 0, unit: timeUnit }
        }
      });

      if (res.error) {
        throw new Error('Failed to update possession details');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 shadow-xl max-h-[90%]">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-xl font-bold text-gray-900">Set Possession</Text>
              <Text className="text-sm text-gray-500 font-medium mt-1">Updating <Text className="text-indigo-600 font-bold">{entityName}</Text></Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {entityType === 'project' || entityType === 'tower' ? (
            <View className="p-3 bg-amber-50 rounded-xl border border-amber-200 mt-4 flex-row items-start gap-2">
              <Feather name="alert-circle" size={16} color="#d97706" style={{ marginTop: 2 }} />
              <Text className="flex-1 text-sm text-amber-800">
                <Text className="font-bold">Warning:</Text> Updating this {entityType} will forcefully overwrite all custom timelines set on its {entityType === 'project' ? 'towers and units' : 'units'}.
              </Text>
            </View>
          ) : null}

          <View className="mt-6">
            <Text className="text-sm font-bold text-gray-700 mb-2">Construction Status</Text>
            <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <Picker
                selectedValue={status}
                onValueChange={(itemValue) => setStatus(itemValue as ConstructionStatus)}
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
          </View>

          <View className="mt-4 mb-8">
            <Text className="text-sm font-bold text-gray-700 mb-2">Timeline Remaining</Text>
            <View className="flex-row gap-3">
              <TextInput
                value={timeValue}
                onChangeText={setTimeValue}
                keyboardType="numeric"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 text-base h-[54px]"
              />
              <View className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-[54px] justify-center">
                <Picker
                  selectedValue={timeUnit}
                  onValueChange={(itemValue) => setTimeUnit(itemValue as 'MONTHS' | 'YEARS')}
                >
                  <Picker.Item label="Months" value="MONTHS" />
                  <Picker.Item label="Years" value="YEARS" />
                </Picker>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={onClose}
              className="flex-1 py-4 bg-gray-100 rounded-xl items-center justify-center"
            >
              <Text className="text-gray-700 font-bold text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={loading}
              className="flex-[2] py-4 bg-indigo-600 rounded-xl items-center justify-center flex-row gap-2"
            >
              {loading ? <ActivityIndicator color="white" /> : <Feather name="check" size={18} color="white" />}
              <Text className="text-white font-bold text-base">Save Timeline</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}
