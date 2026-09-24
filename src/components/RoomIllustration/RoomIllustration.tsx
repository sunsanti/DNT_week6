import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { BookOpen, Monitor } from 'phosphor-react-native';
import type { Room } from '@/types';

interface RoomIllustrationProps {
  room: Pick<Room, 'id' | 'type'>;
  iconSize?: number;
}

// Deterministic per-room hash so each room gets a stable, distinct illustration
// (auto-generated from room data, not a hand-picked image).
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function RoomIllustration({ room, iconSize = 32 }: RoomIllustrationProps) {
  // ×137 (≈ golden angle) so near-identical ids like room-1/room-2 land on very different hues.
  const hue = (hashString(room.id) * 137) % 360;
  const colorA = `hsl(${hue}, 65%, 90%)`;
  const colorB = `hsl(${(hue + 35) % 360}, 65%, 80%)`;
  const iconColor = `hsl(${hue}, 45%, 38%)`;
  // Scoped to this mounted instance, not just the room, so two screens showing
  // the same room at once (e.g. list + detail on the navigation stack) never
  // share a <defs> id — a shared id makes the browser drop the gradient fill.
  // React's useId() contains ":" characters that break `url(#id)` SVG references
  // in some renderers, so strip them.
  const gradientId = `room-illustration-bg-${useId().replace(/:/g, '')}`;
  const Icon = room.type === 'lab' ? Monitor : BookOpen;

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colorA} />
            <Stop offset="1" stopColor={colorB} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={100} height={100} fill={`url(#${gradientId})`} />
        <Circle cx={82} cy={20} r={18} fill="#FFFFFF" opacity={0.25} />
        <Circle cx={14} cy={86} r={26} fill="#FFFFFF" opacity={0.18} />
      </Svg>
      <View style={styles.iconWrap}>
        <Icon size={iconSize} color={iconColor} weight="duotone" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  iconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
