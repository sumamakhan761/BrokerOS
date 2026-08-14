import React from 'react';
import { View, Text } from 'react-native';
import { usePostSalesPipeline } from '../hooks/usePostSalesPipeline';
import { PipelineCardWrapper } from './PipelineCardWrapper';
import { FileText, Banknote, PenTool, Key } from 'lucide-react-native';

import { DocumentForm } from '../forms/DocumentForm';
import { LoanForm } from '../forms/LoanForm';
import { AgreementForm } from '../forms/AgreementForm';
import { HandoverForm } from '../forms/HandoverForm';

interface PostSalesPipelineCardsProps {
  leadId: string;
  leadStatus: string;
  leadSubStatus: string;
  booking: any;
  onRefresh: () => void;
}

export default function PostSalesPipelineCards({ leadId, leadStatus, leadSubStatus, booking, onRefresh }: PostSalesPipelineCardsProps) {
  const { saving, handleMarkStageDone, uploadFile, uploadDoc, saveModelData } = usePostSalesPipeline(leadId, booking?.id, onRefresh);

  if (!booking) {
    return (
      <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <Text className="text-gray-500 italic">No booking details available.</Text>
      </View>
    );
  }

  const wrapperProps = { leadStatus, leadSubStatus, saving, handleMarkStageDone };

  return (
    <View className="space-y-4 w-full">
      <PipelineCardWrapper title="Documentation" statusKey="DOCUMENT" description="Collect and verify all KYC and property related documents." icon={<FileText size={20} color="#4f46e5" />} {...wrapperProps}>
        <DocumentForm booking={booking} saving={saving} uploadDoc={uploadDoc} />
      </PipelineCardWrapper>
      
      <PipelineCardWrapper title="Loan Processing" statusKey="LOAN" description="Process home loan applications and await disbursement." icon={<Banknote size={20} color="#4f46e5" />} {...wrapperProps}>
        <LoanForm booking={booking} saving={saving} saveModelData={saveModelData} uploadFile={uploadFile} />
      </PipelineCardWrapper>
      
      <PipelineCardWrapper title="Agreement Execution" statusKey="AGREEMENT" description="Draft and execute the final agreement to sell / sale deed." icon={<PenTool size={20} color="#4f46e5" />} {...wrapperProps}>
        <AgreementForm booking={booking} saving={saving} saveModelData={saveModelData} uploadFile={uploadFile} />
      </PipelineCardWrapper>
      
      <PipelineCardWrapper title="Handover" statusKey="HANDOVER" description="Complete final snagging, clear dues, and hand over the keys." icon={<Key size={20} color="#4f46e5" />} {...wrapperProps}>
        <HandoverForm booking={booking} saving={saving} saveModelData={saveModelData} uploadFile={uploadFile} />
      </PipelineCardWrapper>
    </View>
  );
}
