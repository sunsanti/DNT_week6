import { StyleSheet, View } from 'react-native';
import { radius, spacing, useThemeColors } from '@/constants/theme';

export function RoomCardSkeleton() {
  const colors = useThemeColors();
  const block = { backgroundColor: colors.border, borderRadius: radius.sm };

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[block, { height: 80 }]} />
      <View style={[block, { height: 14, width: '70%' }]} />
      <View style={[block, { height: 12, width: '50%' }]} />
      <View style={[block, { height: 12, width: '40%' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    margin: spacing.sm,
    gap: spacing.sm,
  },
});
