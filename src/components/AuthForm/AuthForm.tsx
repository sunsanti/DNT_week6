import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GraduationCap } from 'phosphor-react-native';
import type { AuthStackParamList } from '@/navigation/types';
import { login, register } from '@/services/auth';
import { authErrorMessage } from '@/utils/authErrors';
import { validateAuth } from '@/utils/authValidation';
import { fonts, minTouchTarget, radius, spacing, useThemeColors } from '@/constants/theme';

const COPY = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to book study rooms',
    submit: 'Sign in',
    switchText: "Don't have an account?",
    switchAction: 'Create one',
    switchTo: 'Register',
  },
  register: {
    title: 'Create account',
    subtitle: 'Register to start booking rooms',
    submit: 'Create account',
    switchText: 'Already have an account?',
    switchAction: 'Sign in',
    switchTo: 'Login',
  },
} as const;

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const colors = useThemeColors();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const copy = COPY[mode];
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof fields) => (value: string) => {
    setError(null);
    setFields((f) => ({ ...f, [key]: value }));
  };

  const submit = async () => {
    const problem = validateAuth(mode, fields);
    if (problem) return setError(problem);
    setBusy(true);
    try {
      // On success the session listener swaps this screen for the app.
      if (mode === 'login') await login(fields.email, fields.password);
      else await register(fields.name, fields.email, fields.password);
    } catch (e) {
      setError(authErrorMessage(e));
      setBusy(false);
    }
  };

  const input = [
    styles.input,
    { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
  ];
  const placeholder = colors.textMuted;

  return (
    // Edge-to-edge Android does not resize the window for the keyboard, so without this the
    // lower fields sit under the keyboard and there is nothing to scroll.
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior="padding"
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <GraduationCap size={48} color={colors.primary} weight="duotone" />
        <Text style={[styles.title, { color: colors.text }]}>{copy.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{copy.subtitle}</Text>

        {mode === 'register' && (
          <TextInput
            style={input}
            placeholder="Full name"
            placeholderTextColor={placeholder}
            accessibilityLabel="Full name"
            autoComplete="name"
            value={fields.name}
            onChangeText={set('name')}
          />
        )}
        <TextInput
          style={input}
          placeholder="Email"
          placeholderTextColor={placeholder}
          accessibilityLabel="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          value={fields.email}
          onChangeText={set('email')}
        />
        <TextInput
          style={input}
          placeholder="Password"
          placeholderTextColor={placeholder}
          accessibilityLabel="Password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={fields.password}
          onChangeText={set('password')}
          onSubmitEditing={mode === 'login' ? submit : undefined}
        />
        {mode === 'register' && (
          <TextInput
            style={input}
            placeholder="Confirm password"
            placeholderTextColor={placeholder}
            accessibilityLabel="Confirm password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            value={fields.confirm}
            onChangeText={set('confirm')}
            onSubmitEditing={submit}
          />
        )}

        {error && (
          <Text style={[styles.error, { color: colors.destructive }]} accessibilityRole="alert">
            {error}
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: busy ? colors.disabled : colors.primary },
            pressed && !busy && styles.pressed,
          ]}
          disabled={busy}
          onPress={submit}
          accessibilityRole="button"
        >
          {busy ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{copy.submit}</Text>
          )}
        </Pressable>

        <View style={styles.switchRow}>
          <Text style={[styles.switchText, { color: colors.textMuted }]}>{copy.switchText}</Text>
          <Pressable
            onPress={() => navigation.navigate(copy.switchTo)}
            hitSlop={8}
            accessibilityRole="link"
          >
            <Text style={[styles.switchAction, { color: colors.primary }]}>
              {copy.switchAction}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 48,
    gap: spacing.md,
  },
  title: { fontFamily: fonts.bold, fontSize: 22 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, marginBottom: spacing.md },
  input: {
    alignSelf: 'stretch',
    minHeight: minTouchTarget,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  error: { alignSelf: 'stretch', fontFamily: fonts.regular, fontSize: 13 },
  button: {
    alignSelf: 'stretch',
    minHeight: minTouchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonText: { fontFamily: fonts.semibold, fontSize: 15 },
  switchRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  switchText: { fontFamily: fonts.regular, fontSize: 14 },
  switchAction: { fontFamily: fonts.semibold, fontSize: 14 },
});
