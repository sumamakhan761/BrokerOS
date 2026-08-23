import { Stack } from 'expo-router';

export default function LeadManagementLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Leads' }} />
      <Stack.Screen name="[id]" options={{ title: 'Lead Profile' }} />
    </Stack>
  );
}
