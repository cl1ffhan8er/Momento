import { Stack } from "expo-router";

export default function GroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
        <Stack.Screen
            name="members"
            options={{
            presentation: 'card',
            title: 'Members',
            }}
        />
        <Stack.Screen
            name="invite"
            options={{
            presentation: 'modal',
            title: 'Invite Members',
            }}
        />
        <Stack.Screen
            name="create-album"
            options={{
            presentation: 'modal',
            title: 'Create Album',
            }}
        />
    </Stack>
  );
}