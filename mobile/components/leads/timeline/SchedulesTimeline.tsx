import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import SiteVisitEditMode from '../misc/SiteVisitEditMode';
import { LeadProfileData } from '../misc/lead-profile-types';

interface SchedulesTimelineProps {
  siteVisits: LeadProfileData['siteVisits'];
  followUps: LeadProfileData['followUps'];
  onEditSiteVisit?: (siteVisit: NonNullable<LeadProfileData['siteVisits']>[0]) => void;
  onEditFollowUp?: (followUp: NonNullable<LeadProfileData['followUps']>[0]) => void;
  onArriveAtSiteVisit?: (siteVisitId: string) => void;
  onCompleteSiteVisit?: (siteVisitId: string, formData: any) => Promise<void>;
  onConfirmFollowUp?: (followUpId: string) => void;
}

export default function SchedulesTimeline({ siteVisits, followUps, onEditSiteVisit, onEditFollowUp, onArriveAtSiteVisit, onCompleteSiteVisit, onConfirmFollowUp }: SchedulesTimelineProps) {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    interestLevel: '',
    budgetConfirmed: '',
    configInterest: '',
    customerReaction: '',
    closingProbability: '',
    nextAction: '',
    customerObjections: '',
    meetingNotes: ''
  });

  const startComplete = (sv: any) => {
    setEditForm({
      interestLevel: sv.interestLevel || '',
      budgetConfirmed: sv.budgetConfirmed?.toString() || '',
      configInterest: sv.configInterest || '',
      customerReaction: sv.customerReaction || '',
      closingProbability: sv.closingProbability || '',
      nextAction: sv.nextAction || '',
      customerObjections: sv.customerObjections || '',
      meetingNotes: sv.meetingNotes || ''
    });
    setCompletingId(sv.id);
  };

  const handleSaveComplete = async (svId: string) => {
    if (!onCompleteSiteVisit) return;
    setSaving(true);
    try {
      await onCompleteSiteVisit(svId, editForm);
      setCompletingId(null);
    } finally {
      setSaving(false);
    }
  };

  const openMapUrl = (url: string) => {
    import('react-native').then(({ Linking }) => {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    });
  };
  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm">
      <Text className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Schedules</Text>

      <View className="mb-4">
        <Text className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Site Visits</Text>
        <View className="max-h-[160px] overflow-hidden rounded-lg border border-gray-100">
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true} className="p-2 bg-gray-50">
            {(!siteVisits || siteVisits.length === 0) ? (
              <Text className="text-xs text-gray-400 italic">No site visits scheduled.</Text>
            ) : (
              siteVisits.map((sv) => (
                <TouchableOpacity key={sv.id} className="bg-white p-3 rounded-lg border border-gray-200 mb-2 shadow-sm">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-2 flex-row items-center flex-wrap">
                      <Text className="font-bold text-gray-900 text-sm">{sv.project?.name || 'Unknown Project'}</Text>
                      {sv.destinationUrl && (
                        <TouchableOpacity onPress={() => openMapUrl(sv.destinationUrl!)} className="ml-2 bg-blue-50 p-1.5 rounded-full">
                          <Feather name="map-pin" size={14} color="#2563eb" />
                        </TouchableOpacity>
                      )}
                    </View>
                    {onEditSiteVisit && (
                      <TouchableOpacity onPress={() => onEditSiteVisit(sv)} className="p-1 rounded-full bg-blue-50">
                        <Feather name="edit-2" size={14} color="#2563eb" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text className="text-xs text-gray-500 mt-1 mb-1">
                    <Feather name="calendar" size={10} /> {new Date(sv.scheduledDate).toLocaleString()}
                  </Text>
                  {sv.arrivedAt && (
                    <View className="mt-1">
                      <View className="flex-row items-center">
                        <Feather name="check-circle" size={12} color="#059669" />
                        <Text className="text-xs text-emerald-700 ml-1 font-bold">Arrived: {new Date(sv.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                      {sv.arriveLatitude && sv.arriveLongitude && (
                        <TouchableOpacity onPress={() => openMapUrl(`https://maps.google.com/?q=${sv.arriveLatitude},${sv.arriveLongitude}`)}>
                          <Text className="text-[10px] text-emerald-500 font-semibold underline mt-1 ml-4">
                            View coordinates on Map
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  {sv.meetingNotes && (
                    <Text className="text-xs text-gray-600 mt-1 border-t border-gray-100 pt-1">{sv.meetingNotes}</Text>
                  )}
                  {onArriveAtSiteVisit && !sv.arrivedAt && !sv.completedAt && (
                    <TouchableOpacity onPress={() => onArriveAtSiteVisit(sv.id)} className="mt-3 bg-emerald-500 p-2 rounded-lg items-center flex-row justify-center">
                      <Feather name="navigation" size={14} color="white" />
                      <Text className="text-white font-bold text-xs ml-1">Arrive</Text>
                    </TouchableOpacity>
                  )}
                  {onCompleteSiteVisit && sv.arrivedAt && !sv.completedAt && (
                    <TouchableOpacity onPress={() => startComplete(sv)} className="mt-3 bg-blue-500 p-2 rounded-lg items-center flex-row justify-center">
                      <Feather name="check-square" size={14} color="white" />
                      <Text className="text-white font-bold text-xs ml-1">Complete</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      <View>
        <Text className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Follow-ups</Text>
        <View className="max-h-[160px] overflow-hidden rounded-lg border border-gray-100">
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true} className="p-2 bg-gray-50">
            {(!followUps || followUps.length === 0) ? (
              <Text className="text-xs text-gray-400 italic">No follow-ups scheduled.</Text>
            ) : (
              followUps.map((fu) => (
                <TouchableOpacity key={fu.id} className="bg-white p-3 rounded-lg border border-gray-200 mb-2 shadow-sm">
                  <View className="flex-row justify-between items-start">
                    <Text className="font-bold text-gray-900 text-sm flex-1 mr-2">{fu.type || 'Follow-up'}</Text>
                    {onEditFollowUp && (
                      <TouchableOpacity onPress={() => onEditFollowUp(fu)} className="p-1 rounded-full bg-blue-50">
                        <Feather name="edit-2" size={14} color="#2563eb" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text className="text-xs text-gray-500 mt-1 mb-1">
                    <Feather name="clock" size={10} /> {new Date(fu.scheduledDate).toLocaleString()}
                  </Text>
                  {fu.remarks && (
                    <Text className="text-xs text-gray-600 mt-1 border-t border-gray-100 pt-1">{fu.remarks}</Text>
                  )}
                  {onConfirmFollowUp && (fu.status === 'SCHEDULED' || fu.status === 'RESCHEDULED' || fu.status === 'MISSED') && (
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); onConfirmFollowUp(fu.id); }}
                      className="mt-3 bg-emerald-50 p-2 rounded-lg items-center flex-row justify-center"
                    >
                      <Feather name="check" size={14} color="#047857" />
                      <Text className="text-emerald-700 font-bold text-xs ml-1">Confirm</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
      <Modal visible={!!completingId} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-white rounded-2xl overflow-hidden max-h-[85%] shadow-xl">
            <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-900">Complete Site Visit</Text>
              <TouchableOpacity onPress={() => setCompletingId(null)} className="p-1">
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView className="px-2 pb-2">
              {completingId && (
                <SiteVisitEditMode
                  svId={completingId}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  saving={saving}
                  saveEdit={handleSaveComplete}
                  onCancel={() => setCompletingId(null)}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
