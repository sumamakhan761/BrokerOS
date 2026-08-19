import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authClient } from '@/lib/auth-client';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { NewLeadsHeader } from '../../../components/dashboards/pre-sales-manager/lists/NewLeadsHeader';
import { SelectionActionBar } from '../../../components/dashboards/pre-sales-manager/lists/SelectionActionBar';
import { LeadListItem } from '../../../components/dashboards/pre-sales-manager/lists/LeadListItem';
import { AssignLeadsModal } from '../../../components/dashboards/pre-sales-manager/modals/AssignLeadsModal';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

export default function MobileNewLeads() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [subordinates, setSubordinates] = useState<any[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [assignTarget, setAssignTarget] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);

  const [uploading, setUploading] = useState(false);

  const fetchLeadsAndSubordinates = async () => {
    setLoading(true);
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch<Lead[]>(`/api/leads?managerUnassigned=true`, { baseURL });
      if (data) {
        setLeads(data);
      }

      const { data: subData } = await authClient.$fetch<any[]>(`/users/subordinates`, { baseURL });
      if (subData) {
        setSubordinates(subData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsAndSubordinates();
  }, []);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedLeadIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLeadIds(newSet);
  };

  const handleAssign = async (roundRobin: boolean) => {
    if (selectedLeadIds.size === 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please select at least one lead.' });
      return;
    }
    if (!roundRobin && !assignTarget) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please select an employee.' });
      return;
    }

    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch<{ success: boolean }>(`/api/leads/assign`, {
        method: 'POST',
        baseURL,
        body: {
          leadIds: Array.from(selectedLeadIds),
          targetUserId: roundRobin ? undefined : assignTarget,
          roundRobin
        }
      });

      if (data?.success) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Leads assigned successfully!' });
        setSelectedLeadIds(new Set());
        setModalVisible(false);
        fetchLeadsAndSubordinates();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to assign leads.' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'An error occurred during assignment.' });
    }
  };

  const openAssignModal = () => {
    if (selectedLeadIds.size === 0) {
      Toast.show({ type: 'info', text1: 'Selection Required', text2: 'Please select at least one lead to assign.' });
      return;
    }
    setModalVisible(true);
  };

  const handleUploadLeads = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      if (!result.assets || result.assets.length === 0) return;

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      setUploading(true);

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (parsed) => {
          try {
            const mappedLeads = parsed.data.map((row: any) => ({
              firstName: row['First Name'] || row['FirstName'] || row['Name'],
              lastName: row['Last Name'] || row['LastName'],
              phone: row['Phone'] || row['Mobile'],
              email: row['Email'],
              source: row['Source'] || row['Source Name'],
              project: row['Project'] || row['Interested Project'],
              preferredLocation: row['Preferred Location'] || row['Location'],
              budget: row['Budget'] ? Number(row['Budget']) : undefined,
              requirements: row['Requirements'],
            }));

            const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
            const { data, error } = await authClient.$fetch<{ success: boolean; count: number }>(`/api/leads/bulk-create`, {
              method: 'POST',
              baseURL,
              body: mappedLeads
            });

            if (data && !error) {
              Toast.show({ type: 'success', text1: 'Success', text2: `${data.count || mappedLeads.length} leads uploaded successfully!` });
              fetchLeadsAndSubordinates();
            } else {
              Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to upload leads.' });
            }
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'An error occurred during upload.' });
          } finally {
            setUploading(false);
          }
        },
        error: () => {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to parse the CSV file.' });
          setUploading(false);
        }
      });
    } catch (err) {
      console.error(err);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to pick the document.' });
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <NewLeadsHeader uploading={uploading} onUpload={handleUploadLeads} />

      {selectedLeadIds.size > 0 && (
        <SelectionActionBar
          selectedCount={selectedLeadIds.size}
          onRoundRobin={() => handleAssign(true)}
          onAssign={openAssignModal}
        />
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : leads.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <Feather name="inbox" size={48} color="#D1D5DB" className="mb-4" />
          <Text className="text-lg text-gray-500 font-medium text-center">No New Leads</Text>
          <Text className="text-gray-400 text-center mt-2">Tap 'Create' to add a new lead manually, or use the web app for bulk upload.</Text>
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <LeadListItem
              item={item}
              isSelected={selectedLeadIds.has(item.id)}
              onToggleSelect={toggleSelect}
            />
          )}
        />
      )}

      <AssignLeadsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedCount={selectedLeadIds.size}
        assignTarget={assignTarget}
        setAssignTarget={setAssignTarget}
        subordinates={subordinates}
        onConfirm={() => handleAssign(false)}
      />
    </View>
  );
}
