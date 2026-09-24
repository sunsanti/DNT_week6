import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GraduationCap } from 'phosphor-react-native';
import { useSessionStore } from '@/store/useSessionStore';
import { logout } from '@/services/auth';
import { fonts, minTouchTarget, radius, spacing, useThemeColors } from '@/constants/theme';

export function ProfileScreen() {
  const colors = useThemeColors();
  const user = useSessionStore((s) => s.user);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <GraduationCap size={32} color={colors.primary} weight="duotone" />
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>{user?.email}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.signOut,
          { borderColor: colors.border },
          pressed && styles.signOutPressed,
        ]}
        onPress={() => logout()}
        accessibilityRole="button"
      >
        <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.xs,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  signOut: {
    marginTop: spacing.xl,
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutPressed: {
    opacity: 0.7,
  },
  signOutText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
});
