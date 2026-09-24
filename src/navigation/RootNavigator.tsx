import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { MainTabs } from './MainTabs';
import { AuthStack } from './AuthStack';
import { useSessionStore } from '@/store/useSessionStore';
import { darkColors, lightColors } from '@/constants/theme';

const lightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.surface,
    text: lightColors.text,
    border: lightColors.border,
  },
};

const darkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.surface,
    text: darkColors.text,
    border: darkColors.border,
  },
};

export function RootNavigator() {
  const scheme = useColorScheme();
  const user = useSessionStore((s) => s.user);

  // The key remounts the container on login/logout, so the next user starts on a clean stack.
  return (
    <NavigationContainer
      key={user ? 'app' : 'auth'}
      theme={scheme === 'dark' ? darkNavTheme : lightNavTheme}
    >
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
