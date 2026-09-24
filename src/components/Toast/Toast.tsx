import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle } from 'phosphor-react-native';
import { useToastStore } from '@/store/useToastStore';
import { fonts, radius, spacing, useThemeColors } from '@/constants/theme';

export function Toast() {
  const message = useToastStore((s) => s.message);
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  if (!message) return null;

  return (
    <View
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.toast, { top: insets.top + spacing.sm, backgroundColor: colors.text }]}
    >
      <CheckCircle size={18} color={colors.accent} weight="fill" />
      <Text style={[styles.text, { color: colors.background }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    zIndex: 10,
  },
  text: { flex: 1, fontFamily: fonts.medium, fontSize: 14 },
});
