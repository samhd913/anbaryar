import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Force RTL layout for Persian
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);


export default function RootLayout() {
  const colorScheme = useColorScheme();

  const customTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.primary,
      background: Colors.background,
      card: Colors.surface,
      text: Colors.text,
      border: Colors.border,
      notification: Colors.primary,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : customTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="drug-detail/[id]" 
          options={{ 
            presentation: 'modal', 
            title: 'شمارش فیزیکی',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.surface,
          }} 
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
