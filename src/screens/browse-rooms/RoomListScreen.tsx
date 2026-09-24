import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CaretDown, CaretUp, MagnifyingGlass } from 'phosphor-react-native';
import type { BrowseRoomsStackParamList } from '@/navigation/types';
import type { Room } from '@/types';
import { RoomCard } from '@/components/RoomCard';
import { RoomCardSkeleton } from '@/components/RoomCard/RoomCardSkeleton';
import { FilterChip } from '@/components/FilterChip';
import { useRooms } from '@/services/api/useRooms';
import { useFilterStore } from '@/store/useFilterStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SEED_BUILDINGS } from '@/services/api/mock/fixtures';
import { fonts, minTouchTarget, spacing, useThemeColors } from '@/constants/theme';

type Props = NativeStackScreenProps<BrowseRoomsStackParamList, 'RoomList'>;

export function RoomListScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filters = useFilterStore((s) => s.filters);
  const setQuery = useFilterStore((s) => s.setQuery);
  const toggleBuilding = useFilterStore((s) => s.toggleBuilding);
  const setStatus = useFilterStore((s) => s.setStatus);
  const setType = useFilterStore((s) => s.setType);

  const debouncedFilters = useDebouncedValue(filters, 250);
  const { data: rooms, isLoading } = useRooms(debouncedFilters);

  const handlePressRoom = (room: Room) => {
    navigation.navigate('RoomDetail', { roomId: room.id });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.searchRow}>
          <MagnifyingGlass size={18} color={colors.textMuted} />
          <TextInput
            style={[
              styles.searchInput,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text,
              },
            ]}
            placeholder="Search rooms..."
            accessibilityLabel="Search rooms"
            placeholderTextColor={colors.textMuted}
            value={filters.query}
            onChangeText={setQuery}
          />
          <Pressable
            onPress={() => setFiltersOpen((v) => !v)}
            style={styles.filterButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Toggle filters"
            accessibilityState={{ expanded: filtersOpen }}
          >
            <Text style={[styles.filterButtonText, { color: colors.primary }]}>Filter</Text>
            {filtersOpen ? (
              <CaretUp size={16} color={colors.primary} />
            ) : (
              <CaretDown size={16} color={colors.primary} />
            )}
          </Pressable>
        </View>

        {filtersOpen && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsRow}
            data={[
              ...SEED_BUILDINGS.map((b) => ({
                key: `building-${b}`,
                label: b,
                kind: 'building' as const,
              })),
              { key: 'status-available', label: 'Available', kind: 'status' as const },
              { key: 'status-occupied', label: 'Occupied', kind: 'status' as const },
              { key: 'type-lab', label: 'Lab', kind: 'type' as const },
              { key: 'type-study_room', label: 'Study room', kind: 'type' as const },
            ]}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => {
              if (item.kind === 'building') {
                return (
                  <FilterChip
                    label={item.label}
                    selected={filters.buildings.includes(item.label)}
                    onPress={() => toggleBuilding(item.label)}
                  />
                );
              }
              if (item.kind === 'status') {
                const status = item.label === 'Available' ? 'available' : 'occupied';
                return (
                  <FilterChip
                    label={item.label}
                    selected={filters.status === status}
                    onPress={() => setStatus(status)}
                  />
                );
              }
              const type = item.label === 'Lab' ? 'lab' : 'study_room';
              return (
                <FilterChip
                  label={item.label}
                  selected={filters.type === type}
                  onPress={() => setType(type)}
                />
              );
            }}
          />
        )}
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <RoomCard room={item} onPress={handlePressRoom} />}
        initialNumToRender={8}
        windowSize={5}
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletonGrid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonCell}>
                  <RoomCardSkeleton />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <MagnifyingGlass size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No rooms match your filters.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  filterButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  chipsRow: {
    marginTop: spacing.md,
  },
  listContent: {
    padding: spacing.sm,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skeletonCell: {
    width: '50%',
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
});
