import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle, XCircle } from 'phosphor-react-native';
import type { BrowseRoomsStackParamList } from '@/navigation/types';
import { useRoom } from '@/services/api/useRoom';
import { RoomIllustration } from '@/components/RoomIllustration';
import { RoomInfo } from '@/components/RoomInfo/RoomInfo';
import { fonts, minTouchTarget, radius, spacing, useThemeColors } from '@/constants/theme';

type Props = NativeStackScreenProps<BrowseRoomsStackParamList, 'RoomDetail'>;

export function RoomDetailScreen({ route, navigation }: Props) {
  const colors = useThemeColors();
  const { roomId } = route.params;
  const { data: room, isLoading } = useRoom(roomId);

  if (isLoading || !room) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const isAvailable = room.status === 'available';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.photo}>
        <RoomIllustration room={room} iconSize={56} />
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{room.name}</Text>
      <RoomInfo room={room} />
      <View style={styles.metaRow}>
        {isAvailable ? (
          <CheckCircle size={16} color={colors.accent} weight="fill" />
        ) : (
          <XCircle size={16} color={colors.destructive} weight="fill" />
        )}
        <Text style={[styles.meta, { color: isAvailable ? colors.accent : colors.destructive }]}>
          {isAvailable ? 'Available now' : 'Currently occupied'}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: colors.primary },
          !isAvailable && { backgroundColor: colors.disabled },
          pressed && isAvailable && styles.ctaPressed,
        ]}
        disabled={!isAvailable}
        onPress={() => navigation.navigate('TimeSlotBooking', { roomId })}
        accessibilityRole="button"
      >
        <Text style={[styles.ctaText, { color: colors.onPrimary }]}>
          {isAvailable ? 'Choose a time slot' : 'Room occupied'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    height: 180,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  cta: {
    marginTop: spacing.lg,
    minHeight: minTouchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
});
