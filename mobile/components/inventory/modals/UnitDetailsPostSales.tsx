import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { authClient } from '../../../lib/auth-client';

interface UnitDetailsPostSalesProps {
  unit: any;
  bookingData?: any;
  handleCancelBooking?: () => void;
  isCancelling?: boolean;
  onUpdateTimelinePress: () => void;
}

export function UnitDetailsPostSales({ unit, bookingData, handleCancelBooking, isCancelling, onUpdateTimelinePress }: UnitDetailsPostSalesProps) {
  const { data: sessionData } = authClient.useSession();
  const role = (sessionData?.user as any)?.role;
  const isAuthorizedToViewFinancials = [
    'ADMIN', 'DIRECTOR', 'CLOSING_MANAGER', 'SOURCING_MANAGER', 'CHANNEL_PARTNER'
  ].includes(role as string);

  // Fallback to unit.bookings[0] if bookingData isn't provided (for backward compatibility if needed)
  const activeBooking = bookingData || (unit.bookings && unit.bookings.length > 0 ? unit.bookings[0] : null);

  const renderField = (label: string, value: any) => (
    <View className="mb-3 w-1/2 pr-2">
      <Text className="text-xs text-slate-500 font-medium mb-1">{label}</Text>
      <Text className="text-sm font-semibold text-slate-900">{value || '-'}</Text>
    </View>
  );

  const renderDocLink = (label: string, url: string | null) => {
    if (!url) return null;
    return (
      <View className="flex-row items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg mt-2">
        <Text className="text-sm font-semibold text-slate-700">{label}</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(url)}
          className="flex-row items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-md"
        >
          <Feather name="download" size={14} color="#4f46e5" />
          <Text className="text-indigo-600 font-bold text-xs">View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      <View className="mt-8 border-t border-slate-200 pt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-sm font-bold text-slate-700 uppercase">Procession Timeline</Text>
          <TouchableOpacity
            onPress={onUpdateTimelinePress}
            className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
          >
            <Text className="text-indigo-600 font-bold text-xs">Update Timeline</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white p-4 rounded-xl border border-slate-200">
          <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Status</Text>
          <Text className="text-slate-900 font-bold text-lg mb-4">
            {unit.processionStatus ? unit.processionStatus.replace(/_/g, ' ') : 'Not Started'}
          </Text>

          <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Remaining Timeline</Text>
          <Text className="text-slate-900 font-bold">
            {unit.processionTimelineUnit ? `${unit.processionTimelineValue} ${unit.processionTimelineUnit}` : 'N/A'}
          </Text>
        </View>
      </View>

      {activeBooking && (
        <View className="mt-8 border-t border-slate-200 pt-6">

          {/* Customer Details */}
          <Text className="text-sm font-bold text-slate-700 uppercase mb-4">Customer Details</Text>
          <View className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm elevation-2 mb-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center">
                <Text className="text-indigo-700 font-bold text-lg">
                  {activeBooking.customer?.firstName?.[0] || 'C'}
                </Text>
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-lg">
                  {activeBooking.customer?.firstName} {activeBooking.customer?.lastName}
                </Text>
                <Text className="text-slate-500 text-sm font-medium">
                  {activeBooking.customer?.phone || 'No phone provided'}
                </Text>
              </View>
            </View>
            {activeBooking.customer?.email && (
              <View className="flex-row items-center gap-2 mt-2">
                <Feather name="mail" size={14} color="#64748b" />
                <Text className="text-slate-600 font-medium text-sm">{activeBooking.customer.email}</Text>
              </View>
            )}
          </View>

          {/* Detailed Booking Info */}
          <Text className="text-sm font-bold text-slate-700 uppercase mb-4">Booking Info</Text>
          <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <View className="flex-row flex-wrap">
              <View className="mb-3 w-1/2 pr-2">
                <Text className="text-xs text-slate-500 font-medium mb-1">Agreed Total Price</Text>
                <Text className="text-sm font-bold text-emerald-600">₹{Number(activeBooking.agreedPrice || 0).toLocaleString('en-IN')}</Text>
              </View>
              {renderField('Booking Amount / Token', activeBooking.bookingAmount ? `₹${Number(activeBooking.bookingAmount).toLocaleString('en-IN')}` : '-')}
              {renderField('Payment Mode', activeBooking.paymentMode)}
              {renderField('Txn / Cheque Ref', activeBooking.transactionRef)}
              {renderField('Loan Required', activeBooking.loanRequired ? 'Yes' : 'No')}
              {renderField('Closed By', activeBooking.salesExec?.name || '-')}
            </View>
            {activeBooking.remarks && (
              <View className="pt-3 mt-1 border-t border-slate-100">
                <Text className="text-xs text-slate-500 font-medium mb-1">Remarks</Text>
                <Text className="text-sm text-slate-700">{activeBooking.remarks}</Text>
              </View>
            )}
          </View>

          {/* Financials & Brokerage (Role Gated) */}
          {isAuthorizedToViewFinancials && (
            <>
              <Text className="text-sm font-bold text-slate-700 uppercase mb-4">Financials & Brokerage</Text>
              <View className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm mb-6">
                {activeBooking.brokerageRecords && activeBooking.brokerageRecords.length > 0 ? (
                  activeBooking.brokerageRecords.map((record: any, idx: number) => (
                    <View key={record.id || idx} className="flex-row flex-wrap border-b border-slate-100 pb-3 mb-3">
                      {renderField('Commission (%)', record.brokeragePercent ? `${record.brokeragePercent}%` : '-')}
                      <View className="mb-3 w-1/2 pr-2">
                        <Text className="text-xs text-slate-500 font-medium mb-1">Commission Amount</Text>
                        <Text className="text-sm font-bold text-emerald-600">{record.brokerageAmount ? `₹${Number(record.brokerageAmount).toLocaleString('en-IN')}` : '-'}</Text>
                      </View>
                      <View className="mb-3 w-1/2 pr-2">
                        <Text className="text-xs text-slate-500 font-medium mb-1">Status</Text>
                        <View className="self-start">
                          <Text className={`px-2 py-0.5 rounded-full text-[10px] font-bold overflow-hidden ${record.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {record.status}
                          </Text>
                        </View>
                      </View>
                      {renderField('Net Payable', record.netPayable ? `₹${Number(record.netPayable).toLocaleString('en-IN')}` : '-')}
                    </View>
                  ))
                ) : (
                  <View className="flex-row flex-wrap border-b border-slate-100 pb-3 mb-3">
                    {renderField('Commission (%)', activeBooking.commissionPercentage ? `${activeBooking.commissionPercentage}%` : '-')}
                    <View className="mb-3 w-1/2 pr-2">
                      <Text className="text-xs text-slate-500 font-medium mb-1">Commission Amount</Text>
                      <Text className="text-sm font-bold text-emerald-600">{activeBooking.commissionAmount ? `₹${Number(activeBooking.commissionAmount).toLocaleString('en-IN')}` : '-'}</Text>
                    </View>
                  </View>
                )}
                {activeBooking.customer?.lead?.broker ? (
                  <View className="flex-row flex-wrap mt-2">
                    {renderField('Linked Broker', activeBooking.customer.lead.broker.name || activeBooking.customer.lead.broker.companyName)}
                    {renderField('Broker Phone', activeBooking.customer.lead.broker.phone)}
                  </View>
                ) : (
                  <Text className="text-sm text-slate-500 italic mt-2">No broker linked to this deal.</Text>
                )}
              </View>
            </>
          )}

          <Text className="text-sm font-bold text-slate-700 uppercase mb-4">Post-Sales Pipeline</Text>

          {/* Documentation Card */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4">
            <View className="flex-row items-center gap-2 mb-3 border-b border-slate-100 pb-3">
              <Feather name="file-text" size={16} color="#2563eb" />
              <Text className="font-bold text-slate-900 uppercase">General Documents</Text>
            </View>
            {activeBooking.documents && activeBooking.documents.length > 0 ? (
              activeBooking.documents.map((doc: any, i: number) => (
                <View key={i} className="flex-row items-center justify-between py-2 border-b border-slate-50">
                  <View>
                    <Text className="text-sm font-semibold text-slate-900">{doc.type}</Text>
                    {doc.description && <Text className="text-xs text-slate-500 mt-0.5">{doc.description}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => Linking.openURL(doc.fileUrl)} className="bg-blue-50 px-3 py-1.5 rounded-md">
                    <Text className="text-blue-600 font-bold text-xs">View</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="text-sm text-slate-500 italic">No general documents uploaded.</Text>
            )}
          </View>

          {/* Loan Case */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4">
            <View className="flex-row items-center gap-2 mb-3 border-b border-slate-100 pb-3">
              <Feather name="credit-card" size={16} color="#d946ef" />
              <Text className="font-bold text-slate-900 uppercase">Loan Processing</Text>
            </View>
            {!activeBooking.loanCase ? (
              <Text className="text-sm text-slate-500 italic">No loan details available.</Text>
            ) : (
              <View>
                <View className="flex-row flex-wrap">
                  {renderField('Status', activeBooking.loanCase.status?.replace(/_/g, ' '))}
                  {renderField('Bank Name', activeBooking.loanCase.bankName)}
                  {renderField('App No.', activeBooking.loanCase.loanApplicationNumber)}
                  {renderField('Amount', activeBooking.loanCase.loanAmount ? `₹${Number(activeBooking.loanCase.loanAmount).toLocaleString('en-IN')}` : null)}
                  {renderField('Approved', activeBooking.loanCase.approvedAmount ? `₹${Number(activeBooking.loanCase.approvedAmount).toLocaleString('en-IN')}` : null)}
                  {renderField('Agent / DSA', activeBooking.loanCase.dsaName)}
                </View>
                {renderDocLink('Sanction Letter', activeBooking.loanCase.sanctionLetterUrl)}
              </View>
            )}
          </View>

          {/* Agreement */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4">
            <View className="flex-row items-center gap-2 mb-3 border-b border-slate-100 pb-3">
              <Feather name="edit-3" size={16} color="#e11d48" />
              <Text className="font-bold text-slate-900 uppercase">Agreement Execution</Text>
            </View>
            {!activeBooking.agreement ? (
              <Text className="text-sm text-slate-500 italic">No agreement details available.</Text>
            ) : (
              <View>
                <View className="flex-row flex-wrap">
                  {renderField('Status', activeBooking.agreement.status?.replace(/_/g, ' '))}
                  {renderField('Agreement No.', activeBooking.agreement.agreementNumber)}
                  {renderField('Sub-Registrar', activeBooking.agreement.subRegistrarOffice)}
                  {renderField('Lawyer', activeBooking.agreement.lawyerName)}
                  {renderField('Stamp Duty', activeBooking.agreement.stampDutyAmount ? `₹${Number(activeBooking.agreement.stampDutyAmount).toLocaleString('en-IN')}` : null)}
                  {renderField('Appt Time', activeBooking.agreement.appointmentTime ? new Date(activeBooking.agreement.appointmentTime).toLocaleString() : null)}
                </View>
                {renderDocLink('Draft Document', activeBooking.agreement.draftDocumentUrl)}
                {renderDocLink('Final Document', activeBooking.agreement.finalDocumentUrl)}
              </View>
            )}
          </View>

          {/* Handover */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <View className="flex-row items-center gap-2 mb-3 border-b border-slate-100 pb-3">
              <Feather name="key" size={16} color="#059669" />
              <Text className="font-bold text-slate-900 uppercase">Handover & Keys</Text>
            </View>
            {!activeBooking.possession ? (
              <Text className="text-sm text-slate-500 italic">No handover details available.</Text>
            ) : (
              <View>
                <View className="flex-row flex-wrap">
                  {renderField('Status', activeBooking.possession.status?.replace(/_/g, ' '))}
                  {renderField('Scheduled Date', activeBooking.possession.scheduledDate ? new Date(activeBooking.possession.scheduledDate).toLocaleDateString() : null)}
                  {renderField('Parking Slot', activeBooking.possession.parkingSlotNumber)}
                  {renderField('Electricity Meter', activeBooking.possession.electricityMeterNumber)}
                  {renderField('Water Meter', activeBooking.possession.waterMeterNumber)}
                  <View className="mb-3 w-1/2 pr-2">
                    <Text className="text-xs text-slate-500 font-medium mb-1">Checklist</Text>
                    <View className="flex-col gap-1">
                      <Text className={`text-sm font-medium ${activeBooking.possession.snagResolved ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {activeBooking.possession.snagResolved ? '✓' : '○'} Snags Resolved
                      </Text>
                      <Text className={`text-sm font-medium ${activeBooking.possession.keysHandedOver ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {activeBooking.possession.keysHandedOver ? '✓' : '○'} Keys Handed Over
                      </Text>
                    </View>
                  </View>
                </View>
                {renderDocLink('Occupancy Cert', activeBooking.possession.occupancyCertUrl)}
                {renderDocLink('Completion Cert', activeBooking.possession.completionCertUrl)}
                {renderDocLink('Handover Doc', activeBooking.possession.handoverDocUrl)}
              </View>
            )}
          </View>

          {/* Cancel Booking Action */}
          {handleCancelBooking && (
            <TouchableOpacity
              onPress={handleCancelBooking}
              disabled={isCancelling}
              className="w-full flex-row items-center justify-center gap-2 py-3 bg-rose-100 border border-rose-200 rounded-xl mb-4"
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color="#e11d48" />
              ) : (
                <Feather name="alert-circle" size={16} color="#e11d48" />
              )}
              <Text className="text-rose-700 font-bold">
                {isCancelling ? 'Cancelling...' : 'Revert to Available (Cancel Booking)'}
              </Text>
            </TouchableOpacity>
          )}

        </View>
      )}
    </View>
  );
}
