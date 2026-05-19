// app/(tabs)/groups/_layout.tsx
import { Stack } from 'expo-router';

export default function GroupsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Groups' , headerShown: false }} />
      <Stack.Screen name="[groupId]" options={{ headerShown: false }} />
      <Stack.Screen
        name="create-group"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="join-group"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}