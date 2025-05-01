import { Stack } from 'expo-router';
import { FC } from 'react';

const Layout: FC = () => {
  return (
    <Stack>
      <Stack.Screen name="welcome/index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up/index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in/index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
