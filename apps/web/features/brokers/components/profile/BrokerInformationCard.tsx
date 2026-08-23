import React from 'react';
import { Card } from '@/components/ui/Card';
import { Edit2, Briefcase, Check, X, Phone, Mail, MapPin, Building2, FileText, FileCheck, Globe, UserCheck, Navigation } from 'lucide-react';

interface BrokerInformationCardProps {
  broker: any;
  isEditingBrokerInfo: boolean;
  setIsEditingBrokerInfo: (val: boolean) => void;
  brokerInfoData: any;
  setBrokerInfoData: (data: any) => void;
  handleBrokerInfoSave: () => void;
  availableSourcingManagers: any[];
  isCP?: boolean;
}

export function BrokerInformationCard({
  broker,
  isEditingBrokerInfo,
  setIsEditingBrokerInfo,
  brokerInfoData,
  setBrokerInfoData,
  handleBrokerInfoSave,
  availableSourcingManagers,
  isCP = false,
}: BrokerInformationCardProps) {
  return (
    <Card className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Broker Information
        </h3>
        {!isEditingBrokerInfo ? (
          <button
            onClick={() => setIsEditingBrokerInfo(true)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditingBrokerInfo(false);
                setBrokerInfoData({
                  companyName: broker.companyName || '',
                  reraNumber: broker.reraNumber || '',
                  gstNumber: broker.gstNumber || '',
                  serviceAreas: broker.serviceAreas && broker.serviceAreas.length > 0 ? broker.serviceAreas.join(', ') : '',
                  sourcingManagerId: broker.sourcingManagerId || '',
                  city: broker.city || '',
                  address: broker.address || '',
                });
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleBrokerInfoSave}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {!isEditingBrokerInfo ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500 flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</span>
              <span className="font-medium text-gray-900">{broker.phone} {broker.alternatePhone ? `/ ${broker.alternatePhone}` : ''}</span>
            </div>
            {broker.email && (
              <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                <span className="text-gray-500 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</span>
                <span className="font-medium text-gray-900">{broker.email}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500 flex items-center gap-2"><Building2 className="w-4 h-4" /> Company Name</span>
              <span className="font-medium text-gray-900">{broker.companyName || 'Not Provided'}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500 flex items-center gap-2"><FileText className="w-4 h-4" /> RERA No.</span>
              <span className="font-medium text-gray-900 text-right truncate max-w-[150px]">{broker.reraNumber || '-'}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500 flex items-center gap-2"><FileCheck className="w-4 h-4" /> GST No.</span>
              <span className="font-medium text-gray-900 text-right truncate max-w-[150px]">{broker.gstNumber || '-'}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500 flex items-center gap-2"><Globe className="w-4 h-4" /> Service Areas</span>
              <span className="font-medium text-gray-900 text-right truncate max-w-[150px]" title={broker.serviceAreas && broker.serviceAreas.length > 0 ? broker.serviceAreas.join(', ') : '-'}>
                {broker.serviceAreas && broker.serviceAreas.length > 0 ? broker.serviceAreas.join(', ') : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500 flex items-center gap-2"><Navigation className="w-4 h-4" /> City</span>
              <span className="font-medium text-gray-900 text-right truncate max-w-[150px]" title={broker.city || '-'}>{broker.city || '-'}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Address</span>
              <span className="font-medium text-gray-900 text-right truncate max-w-[150px]" title={broker.address || '-'}>{broker.address || '-'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-2"><UserCheck className="w-4 h-4" /> Sourcing Manager</span>
              <span className="font-medium text-gray-900 text-right truncate max-w-[150px]" title={broker.sourcingManager?.name || 'Unassigned'}>
                {broker.sourcingManager?.name || 'Unassigned'}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={brokerInfoData.companyName}
                onChange={(e) => setBrokerInfoData({ ...brokerInfoData, companyName: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">RERA Number</label>
              <input
                type="text"
                value={brokerInfoData.reraNumber}
                onChange={(e) => setBrokerInfoData({ ...brokerInfoData, reraNumber: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">GST Number</label>
              <input
                type="text"
                value={brokerInfoData.gstNumber}
                onChange={(e) => setBrokerInfoData({ ...brokerInfoData, gstNumber: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Service Areas (comma separated)</label>
              <input
                type="text"
                value={brokerInfoData.serviceAreas}
                onChange={(e) => setBrokerInfoData({ ...brokerInfoData, serviceAreas: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={brokerInfoData.city}
                onChange={(e) => setBrokerInfoData({ ...brokerInfoData, city: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={brokerInfoData.address}
                onChange={(e) => setBrokerInfoData({ ...brokerInfoData, address: e.target.value })}
                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={2}
              />
            </div>
            {isCP && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assign Sourcing Manager</label>
                <select
                  value={brokerInfoData.sourcingManagerId || ''}
                  onChange={(e) => setBrokerInfoData({ ...brokerInfoData, sourcingManagerId: e.target.value })}
                  className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {availableSourcingManagers.map((sm) => (
                    <option key={sm.id} value={sm.id}>
                      {sm.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
