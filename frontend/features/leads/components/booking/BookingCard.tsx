'use client';

import React, { useState } from 'react';
import { BookingForm } from '@/features/leads/components/booking/BookingForm';
import { BookingSummary } from '@/features/leads/components/booking/BookingSummary';

interface BookingDocument {
  type: string;
  fileUrl: string;
  title: string;
}

interface BookingData {
  id: string;
  unitDescription?: string;
  agreedPrice?: number;
  bookingAmount?: number;
  commissionPercentage?: number;
  commissionAmount?: number;
  paymentMode?: string;
  transactionRef?: string;
  loanRequired?: boolean;
  remarks?: string;
  documents: BookingDocument[];
  status: string;
  createdAt: string;
}

interface BookingCardProps {
  booking: BookingData | null;
  leadId: string;
  userId: string;
  onRefresh: () => void;
  lead?: any;
}

export function BookingCard({ booking, leadId, userId, onRefresh, lead }: BookingCardProps) {
  const [showForm, setShowForm] = useState(false);

  if (!booking) {
    return (
      <BookingForm
        leadId={leadId}
        userId={userId}
        showForm={showForm}
        setShowForm={setShowForm}
        onRefresh={onRefresh}
        lead={lead}
      />
    );
  }

  return (
    <BookingSummary
      booking={booking}
      leadId={leadId}
      onRefresh={onRefresh}
    />
  );
}
