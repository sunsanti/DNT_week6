import { StyleSheet, Text, View } from 'react-native';
import { BookOpen, Buildings, MapPin, Monitor, Users } from 'phosphor-react-native';
import type { Room } from '@/types';
import { fonts, radius, spacing, useThemeColors } from '@/constants/theme';

export function RoomInfo({ room }: { room: Room }) {
  const colors = useThemeColors();
  const TypeIcon = room.type === 'lab' ? Monitor : BookOpen;
  const rows = [
    { Icon: Buildings, text: `${room.building} · Floor ${room.floor}` },
    { Icon: MapPin, text: room.location },
    { Icon: Users, text: `${room.seatsLeft}/${room.capacity} seats available` },
    { Icon: TypeIcon, text: room.type === 'lab' ? 'Computer lab' : 'Study room' },
  ];

  return (
    <View style={styles.wrap}>
      {rows.map(({ Icon, text }) => (
        <View key={text} style={styles.row}>
          <Icon size={16} color={colors.textMuted} weight="fill" />
          <Text style={[styles.text, { color: colors.textMuted }]}>{text}</Text>
        </View>
      ))}
      <View style={styles.chips}>
        {room.amenities.map((a) => (
          <View key={a} style={[styles.chip, { borderColor: colors.border }]}>
            <Text style={[styles.chipText, { color: colors.text }]}>{a}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  text: { fontFamily: fonts.regular, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  chip: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: { fontFamily: fonts.medium, fontSize: 12 },
});
