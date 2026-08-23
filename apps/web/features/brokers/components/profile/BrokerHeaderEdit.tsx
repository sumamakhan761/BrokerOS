import React from 'react';
import { Input } from '@/components/ui/Input';
import { Phone } from 'lucide-react';

interface BrokerHeaderEditProps {
  formData: any;
  setFormData: (data: any) => void;
  brokerPhone: string;
}

export function BrokerHeaderEdit({ formData, setFormData, brokerPhone }: BrokerHeaderEditProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 mr-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          label="Email Address"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500 flex items-center gap-2 mt-2">
        <Phone className="w-4 h-4 text-gray-400" />
        Phone number ({brokerPhone}) cannot be edited.
      </div>
    </div>
  );
}
