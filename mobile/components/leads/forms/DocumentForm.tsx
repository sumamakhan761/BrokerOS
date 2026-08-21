import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, TextInput } from 'react-native';
import { Upload, Download, CheckCircle2, FileText } from 'lucide-react-native';

interface DocumentFormProps {
  booking: any;
  saving: boolean;
  uploadDoc: (docType: string, description?: string) => void;
  userRole?: string;
}

export function DocumentForm({ booking, saving, uploadDoc, userRole }: DocumentFormProps) {
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const docTypes = [
    { key: 'AADHAAR', label: 'Aadhaar Card' },
    { key: 'PAN', label: 'PAN Card' },
    { key: 'INCOME_DOCUMENT', label: 'Income Proof' },
    { key: 'OTHER', label: 'Other Docs' },
  ];

  return (
    <View className="space-y-4">
      {docTypes.map(doc => {
        const existing = booking?.documents?.find((d: any) => d.type === doc.key);
        return (
          <View key={doc.key} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-3">
                <View className={`w-9 h-9 rounded-xl items-center justify-center border ${existing ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                  {existing ? <CheckCircle2 size={18} color="#059669" /> : <FileText size={18} color="#9ca3af" />}
                </View>
                <Text className="text-sm font-semibold text-gray-900">{doc.label}</Text>
              </View>
              <View>
                {existing ? (
                  <TouchableOpacity onPress={() => Linking.openURL(existing.fileUrl)} className="flex-row items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                    <Download size={14} color="#2563eb" />
                    <Text className="text-blue-600 font-bold text-xs">View</Text>
                  </TouchableOpacity>
                ) : userRole !== 'CHANNEL_PARTNER' ? (
                  <TouchableOpacity onPress={() => uploadDoc(doc.key, descriptions[doc.key])} disabled={saving} className="flex-row items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                    <Upload size={14} color="#4b5563" />
                    <Text className="text-gray-600 font-bold text-xs">Upload</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            
            {!existing && userRole !== 'CHANNEL_PARTNER' ? (
              <TextInput 
                placeholder={`Add description for ${doc.label}...`}
                placeholderTextColor="#9ca3af"
                value={descriptions[doc.key] || ''}
                onChangeText={text => setDescriptions({ ...descriptions, [doc.key]: text })}
                className="w-full text-xs text-black border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 mt-1"
              />
            ) : existing && existing.description ? (
              <Text className="text-xs text-gray-500 italic px-1 mt-1">{existing.description}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
