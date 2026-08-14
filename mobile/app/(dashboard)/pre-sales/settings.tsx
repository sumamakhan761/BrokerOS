import { View, Text, TouchableOpacity, Alert, PermissionsAndroid } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { setODialerFolder } from '../../../modules/auto-dialer';
import { Feather } from '@expo/vector-icons';

export default function PreSalesSettings() {
  const handleGrantPermissions = async () => {
    try {
      // 1. Request Phone Permissions
      const permissionsToRequest = [
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.PROCESS_OUTGOING_CALLS,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);

      // Check if critical permissions were granted
      if (
        granted['android.permission.CALL_PHONE'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.READ_PHONE_STATE'] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        Alert.alert("Step 1 Complete", "Phone permissions granted. Now please select your ODialer folder.");

        // 2. Request Folder Permission
        // @ts-ignore
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          try {
            setODialerFolder(permissions.directoryUri);
            Alert.alert("Success!", "All permissions granted and ODialer folder linked for background sync!");
          } catch (folderError) {
            console.log("Persistable permission warning:", folderError);
            Alert.alert("Success", "Folder linked, but you may need to re-link it if the app restarts.");
          }
        }
      } else {
        Alert.alert("Error", "Phone permissions are required for the Auto-Dialer to work.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not grant permissions");
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Pre-Sales Settings</Text>
      <Text className="text-gray-500 mb-8">Configure your auto-dialer and permissions below.</Text>
      
      <TouchableOpacity
        onPress={handleGrantPermissions}
        className="bg-blue-600 rounded-xl py-3 px-4 flex-row items-center justify-center">
        <Feather name="shield" size={20} color="white" style={{ marginRight: 8 }} />
        <Text className="text-white font-semibold">Grant All Permissions (Phone & Folder)</Text>
      </TouchableOpacity>
    </View>
  );
}
