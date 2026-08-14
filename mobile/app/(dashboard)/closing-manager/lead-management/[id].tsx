import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import LeadProfileClient from '../../../../components/leads/profile/LeadProfileClient';

export default function ClosingManagerLeadProfile() {
  const { id } = useLocalSearchParams();
  return <LeadProfileClient leadId={id as string} role="closing-manager" />;
}
