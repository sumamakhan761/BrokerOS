import { useState } from 'react';
import { toast } from 'sonner';

export function useBrokerSchedules(brokerId: string, userId: string | undefined, broker: any) {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const [followUpData, setFollowUpData] = useState({ title: '', scheduledDate: '', type: 'CALL', notes: '' });
  const [meetingData, setMeetingData] = useState({ title: '', scheduledAt: '', meetingType: 'OFFICE', agenda: '' });

  const updateSchedulesFromBroker = (brokerData: any) => {
    if (brokerData) {
      if (brokerData.followUps) setFollowUps(brokerData.followUps);
      if (brokerData.meetings) setMeetings(brokerData.meetings);
    }
  };

  const handleSaveFollowUp = async (loadBroker: () => void) => {
    try {
      if (!userId) { toast.error('You must be logged in.'); return; }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers/${brokerId}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpData)
      });
      if (res.ok) {
        setIsFollowUpModalOpen(false);
        setFollowUpData({ title: '', scheduledDate: '', type: 'CALL', notes: '' });
        loadBroker();
      }
    } catch (e) { console.error(e); }
  };

  const handleSaveMeeting = async (loadBroker: () => void) => {
    try {
      if (!userId) { toast.error('You must be logged in.'); return; }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers/${brokerId}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData)
      });
      if (res.ok) {
        setIsMeetingModalOpen(false);
        setMeetingData({ title: '', scheduledAt: '', meetingType: 'OFFICE', agenda: '' });
        loadBroker();
      }
    } catch (e) { console.error(e); }
  };

  const openFollowUpModal = () => {
    setFollowUpData({ title: '', scheduledDate: '', type: 'CALL', notes: '' });
    setIsFollowUpModalOpen(true);
  };

  const openMeetingModal = () => {
    setMeetingData({ title: '', scheduledAt: '', meetingType: 'OFFICE', agenda: '' });
    setIsMeetingModalOpen(true);
  };

  return {
    followUps,
    meetings,
    updateSchedulesFromBroker,
    isFollowUpModalOpen,
    setIsFollowUpModalOpen,
    isMeetingModalOpen,
    setIsMeetingModalOpen,
    followUpData,
    setFollowUpData,
    meetingData,
    setMeetingData,
    handleSaveFollowUp,
    handleSaveMeeting,
    openFollowUpModal,
    openMeetingModal,
  };
}
