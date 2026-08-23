import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import SiteVisitEditMode from './SiteVisitEditMode';

interface SiteVisitRowProps {
  sv: any;
  expandedId: string | null;
  toggleExpand: (id: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editForm: any;
  setEditForm: (form: any) => void;
  saving: boolean;
  startEdit: (sv: any) => void;
  saveEdit: (svId: string) => void;
}

export default function SiteVisitRow({
  sv,
  expandedId,
  toggleExpand,
  editingId,
  setEditingId,
  editForm,
  setEditForm,
  saving,
  startEdit,
  saveEdit
}: SiteVisitRowProps) {
  const isExpanded = expandedId === sv.id;
  const isEditing = editingId === sv.id;

  return (
    <View className="border border-gray-100 rounded-2xl overflow-hidden mb-3 bg-white shadow-sm">
      <TouchableOpacity
        className="flex-row items-center justify-between p-4"
        onPress={() => toggleExpand(sv.id)}
      >
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          <View className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
            <Feather name="map-pin" size={18} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>{sv.project?.name || 'Unknown Project'}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-xs font-medium text-gray-500">
                {new Date(sv.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {!isEditing && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                startEdit(sv);
              }}
              className="p-2 rounded-lg bg-emerald-50"
            >
              <Feather name="edit-2" size={14} color="#059669" />
            </TouchableOpacity>
          )}
          <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-50">
            <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#64748b" />
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && !isEditing && (
        <View className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
          <View className="flex-row flex-wrap gap-2">
            {sv.interestLevel && (
              <View className="bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Interest</Text>
                <Text className="text-xs font-semibold text-gray-900">{sv.interestLevel.replace('_', ' ')}</Text>
              </View>
            )}
            {sv.budgetConfirmed && (
              <View className="bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Budget</Text>
                <Text className="text-xs font-semibold text-gray-900">₹{Number(sv.budgetConfirmed).toLocaleString('en-IN')}</Text>
              </View>
            )}
            {sv.configInterest && (
              <View className="bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Config</Text>
                <Text className="text-xs font-semibold text-gray-900">{sv.configInterest}</Text>
              </View>
            )}
            {sv.closingProbability && (
              <View className="bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Probability</Text>
                <Text className="text-xs font-semibold text-gray-900">{sv.closingProbability.replace('_', ' ')}</Text>
              </View>
            )}
            {sv.customerReaction && (
              <View className="bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Reaction</Text>
                <Text className="text-xs font-semibold text-gray-900">{sv.customerReaction.replace('_', ' ')}</Text>
              </View>
            )}
            {sv.nextAction && (
              <View className="bg-white rounded-lg px-3 py-1.5 border border-gray-200 w-full mt-1">
                <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Next Action</Text>
                <Text className="text-xs font-semibold text-gray-900">{sv.nextAction}</Text>
              </View>
            )}
          </View>

          {sv.customerObjections && (
            <View className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="w-1.5 h-1.5 rounded-full bg-red-500"></View>
                <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Objections</Text>
              </View>
              <Text className="text-sm text-gray-700 leading-tight">{sv.customerObjections}</Text>
            </View>
          )}

          {sv.meetingNotes && (
            <View className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="w-1.5 h-1.5 rounded-full bg-blue-500"></View>
                <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Notes</Text>
              </View>
              <Text className="text-sm text-gray-700 leading-tight">{sv.meetingNotes}</Text>
            </View>
          )}
        </View>
      )}

      {isEditing && (
        <View className="border-t border-gray-100 p-4 bg-gray-50">
          <SiteVisitEditMode
            svId={sv.id}
            editForm={editForm}
            setEditForm={setEditForm}
            saving={saving}
            saveEdit={saveEdit}
            onCancel={() => setEditingId(null)}
          />
        </View>
      )}
    </View>
  );
}
