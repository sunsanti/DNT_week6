import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, View, type ViewStyle } from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { RootNavigator } from '@/navigation/RootNavigator';
import { Toast } from '@/components/Toast/Toast';
import { initReminders } from '@/services/reminders';
import { watchSession } from '@/services/auth';
import { useSessionStore } from '@/store/useSessionStore';
import { useThemeColors } from '@/constants/theme';

const queryClient = new QueryClient();

// On desktop browsers keep the app phone-sized and centred instead of stretching it.
const webFrame: ViewStyle =
  Platform.OS === 'web'
    ? { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' }
    : { flex: 1 };
initReminders();

function LoadingGate() {
  const colors = useThemeColors();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export default function App() {
  const initializing = useSessionStore((s) => s.initializing);
  useEffect(() => watchSession(), []);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <View style={webFrame}>
          {fontsLoaded && !initializing ? <RootNavigator /> : <LoadingGate />}
          <Toast />
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
