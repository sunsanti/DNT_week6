import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle, MapPin, Users, XCircle } from 'phosphor-react-native';
import type { Room } from '@/types';
import { fonts, radius, spacing, useThemeColors } from '@/constants/theme';
import { RoomIllustration } from '@/components/RoomIllustration';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

function RoomCardBase({ room, onPress }: RoomCardProps) {
  const colors = useThemeColors();
  const isAvailable = room.status === 'available';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(room)}
      accessibilityRole="button"
      accessibilityLabel={`${room.name}, ${room.location}, ${room.seatsLeft} of ${room.capacity} seats left, ${isAvailable ? 'available' : 'occupied'}`}
    >
      <View style={styles.photo}>
        <RoomIllustration room={room} />
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {room.name}
      </Text>
      <View style={styles.metaRow}>
        <MapPin size={14} color={colors.textMuted} weight="fill" />
        <Text style={[styles.meta, { color: colors.textMuted }]}>{room.location}</Text>
      </View>
      <View style={styles.metaRow}>
        <Users size={14} color={colors.textMuted} weight="fill" />
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {room.seatsLeft}/{room.capacity} seats
        </Text>
      </View>
      <View
        style={[
          styles.badge,
          { backgroundColor: isAvailable ? colors.accentBg : colors.destructiveBg },
        ]}
      >
        {isAvailable ? (
          <CheckCircle size={14} color={colors.accent} weight="fill" />
        ) : (
          <XCircle size={14} color={colors.destructive} weight="fill" />
        )}
        <Text
          style={[styles.badgeText, { color: isAvailable ? colors.accent : colors.destructive }]}
        >
          {isAvailable ? 'Available' : 'Occupied'}
        </Text>
      </View>
    </Pressable>
  );
}

export const RoomCard = memo(RoomCardBase);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    margin: spacing.sm,
    gap: spacing.xs,
  },
  cardPressed: {
    opacity: 0.7,
  },
  photo: {
    height: 80,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  badge: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
});
