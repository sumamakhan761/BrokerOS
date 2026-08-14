import React from 'react';
import { View } from 'react-native';
import { useApprovalTicket } from './hooks/useApprovalTicket';
import { ApprovalTicketHeader } from './ApprovalTicketHeader';
import { ApprovalMessageThread } from './ApprovalMessageThread';
import { ApprovalReplyForm } from './ApprovalReplyForm';

interface ApprovalTicketProps {
  ticket: any;
  role: 'SALES_EXECUTIVE' | 'SALES_MANAGER';
  onBack: () => void;
  onUpdate: () => void;
}

export default function ApprovalTicket({ ticket, role, onBack, onUpdate }: ApprovalTicketProps) {
  const {
    loading,
    showReplyForm,
    setShowReplyForm,
    replyTitle,
    setReplyTitle,
    replyDesc,
    setReplyDesc,
    replyFile,
    setReplyFile,
    actionType,
    setActionType,
    handleSelectFile,
    handleReply,
    handleCloseTicket,
  } = useApprovalTicket(ticket, onUpdate);

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <ApprovalTicketHeader
        ticket={ticket}
        role={role}
        onBack={onBack}
        loading={loading}
        onCloseTicket={handleCloseTicket}
      />

      <ApprovalMessageThread
        messages={ticket.messages}
        role={role}
      />

      <ApprovalReplyForm
        ticketStatus={ticket.status}
        role={role}
        showReplyForm={showReplyForm}
        setShowReplyForm={setShowReplyForm}
        actionType={actionType}
        setActionType={setActionType}
        replyTitle={replyTitle}
        setReplyTitle={setReplyTitle}
        replyDesc={replyDesc}
        setReplyDesc={setReplyDesc}
        replyFile={replyFile}
        setReplyFile={setReplyFile}
        handleSelectFile={handleSelectFile}
        handleReply={handleReply}
        loading={loading}
      />
    </View>
  );
}
