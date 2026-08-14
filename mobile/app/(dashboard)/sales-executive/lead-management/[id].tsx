import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import LeadProfileClient from '../../../../components/leads/profile/LeadProfileClient';

export default function SalesExecLeadProfile() {
  const { id } = useLocalSearchParams();
  return <LeadProfileClient leadId={id as string} role="sales-executive" />;
}
