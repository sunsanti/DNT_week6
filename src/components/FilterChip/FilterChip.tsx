import { Pressable, StyleSheet, Text } from 'react-native';
import { fonts, radius, spacing, useThemeColors } from '@/constants/theme';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: colors.surface, borderColor: colors.border },
        selected && { backgroundColor: colors.primary, borderColor: colors.primary },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={4}
    >
      <Text style={[styles.label, { color: selected ? colors.onPrimary : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
