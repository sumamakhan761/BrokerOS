import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AudioPlayer from '../misc/AudioPlayer';
import { LeadProfileData } from '../misc/lead-profile-types';

interface HistoryTimelineProps {
  lead: LeadProfileData;
}

export default function HistoryTimeline({ lead }: HistoryTimelineProps) {
  // Gather all events
  const events: any[] = [];

  if (lead.createdAt) {
    events.push({
      id: 'created-' + lead.id,
      type: 'CREATED',
      date: new Date(lead.createdAt),
      title: 'Lead Created',
      description: `Lead was added to the CRM.`,
      icon: 'user',
      color: 'bg-emerald-500'
    });
  }

  if (lead.callRecords) {
    lead.callRecords.forEach((call: any) => {
      events.push({
        id: 'call-' + call.id,
        type: 'CALL',
        date: new Date(call.startedAt),
        title: 'Outgoing Call',
        description: call.aiSummary || 'No summary available.',
        data: call,
        icon: 'phone-call',
        color: 'bg-blue-500'
      });
    });
  }

  if (lead.siteVisits) {
    lead.siteVisits.forEach((sv: any) => {
      events.push({
        id: 'sv-' + sv.id,
        type: 'SITE_VISIT',
        date: new Date(sv.scheduledDate),
        title: `Site Visit - ${sv.status || 'SCHEDULED'}`,
        description: sv.project ? `Scheduled for project: ${sv.project.name}` : 'Site visit scheduled.',
        data: sv,
        icon: 'map-pin',
        color: 'bg-violet-500'
      });
    });
  }

  if (lead.followUps) {
    lead.followUps.forEach((fu: any) => {
      events.push({
        id: 'fu-' + fu.id,
        type: 'FOLLOW_UP',
        date: new Date(fu.scheduledDate),
        title: `Follow-up - ${fu.status || 'SCHEDULED'}`,
        description: fu.remarks || 'Follow-up scheduled.',
        data: fu,
        icon: 'clipboard',
        color: 'bg-amber-500'
      });
    });
  }

  if (lead.customer?.bookings) {
    lead.customer.bookings.forEach((booking: any) => {
      events.push({
        id: 'booking-' + booking.id,
        type: 'BOOKING',
        date: new Date(booking.createdAt),
        title: `Booking - ${booking.status}`,
        description: booking.unit ? `Unit booked: ${booking.unit.unitNumber}` : 'Booking created.',
        data: booking,
        icon: 'check-circle',
        color: 'bg-pink-500'
      });
    });
  }

  // Sort events by date descending
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 shadow-sm">
      <View className="flex-row justify-between items-center mb-6 border-b border-gray-100 pb-3">
        <View className="flex-row items-center gap-2">
          <Feather name="clock" size={18} color="#4f46e5" />
          <Text className="text-lg font-bold text-gray-900">History & Timeline</Text>
        </View>
      </View>

      <View className="pl-4">
        {events.length === 0 ? (
          <Text className="text-sm text-gray-400 italic text-center py-4">No history available.</Text>
        ) : (
          <View className="border-l border-gray-200 ml-2">
            {events.map((event) => {
              return (
                <View key={event.id} className="relative pl-6 pb-6">
                  {/* Timeline dot */}
                  <View className={`absolute -left-3.5 mt-1 w-9 h-9 rounded-full items-center justify-center border-4 border-white ${event.color} shadow-sm`}>
                    <Feather name={event.icon as any} size={12} color="white" />
                  </View>

                  {/* Event Content */}
                  <View className="bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-sm font-bold text-gray-900 flex-1 mr-2">{event.title}</Text>
                      <View className="bg-white px-2 py-1 rounded border border-gray-200">
                        <Text className="text-[10px] font-medium text-gray-500">
                          {event.date.toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    {event.type === 'CALL' ? (
                      <View className="flex-col">
                        {event.data.recordingUrl ? (
                          <View className="mb-3">
                            <AudioPlayer url={event.data.recordingUrl} />
                          </View>
                        ) : (
                          <View className="bg-red-50 px-2 py-1 rounded border border-red-100 self-start mb-2">
                            <Text className="text-xs font-medium text-red-600">Missed / Unrecorded</Text>
                          </View>
                        )}

                        {event.data.aiSummary && (
                          <View className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50 mb-2">
                            <View className="flex-row items-center mb-1">
                              <Feather name="zap" size={10} color="#4f46e5" style={{ marginRight: 4 }} />
                              <Text className="text-xs font-bold text-indigo-700">AI Summary</Text>
                            </View>
                            <Text className="text-xs text-indigo-900 leading-4">
                              {event.data.aiSummary}
                            </Text>
                          </View>
                        )}

                        {/* {event.data.aiTranscript && (
                          <View className="mt-1">
                            <View className="flex-row items-center mb-1">
                              <Feather name="file-text" size={10} color="#475569" style={{ marginRight: 4 }} />
                              <Text className="text-xs font-bold text-gray-600">Transcript</Text>
                            </View>
                            <Text className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">
                              {event.data.aiTranscript}
                            </Text>
                          </View>
                        )} */}
                      </View>
                    ) : (
                      <Text className="text-sm text-gray-700">{event.description}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
