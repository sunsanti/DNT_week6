# Spec: Campus Study Room & Lab Booking App (Mini-Project 2)

## Objective

Build a mobile app that lets students **search for and book study rooms / labs** on campus quickly, without double-booking.

- **Primary user:** A student looking for a free room for group study or lab work.
- **Problems to solve:**
  - The room list is long, so it must be searchable/filterable on multiple criteria at once (filter chips).
  - The list must scroll smoothly (60fps) even though each card carries a photo and status badge.
  - Booking is per time slot and must never overlap with another student's booking on the same room (conflict prevention).
- **Success looks like:**
  - A student can find a suitable room in a few taps.
  - It is impossible to create two overlapping bookings for the same room.
  - The room feed scrolls smoothly with no jank from images or status badges.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (Managed Workflow) |
| Language | TypeScript (`strict: true`) |
| Navigation | React Navigation 7 (Bottom Tabs, with a Stack nested inside each tab) |
| Client state | Zustand |
| Server state / cache | TanStack Query |
| Testing | Jest + React Native Testing Library (unit/component), Detox or Maestro (e2e - optional) |
| Linting/Format | ESLint + Prettier |

**Rationale (assumptions — confirm if wrong):**
- Zustand for local/UI state (currently selected filters, the in-progress time slot, the draft booking form) — lightweight, no boilerplate.
- TanStack Query for all server data (room list, booking status, booking history) to get caching, refetching, and optimistic updates on booking creation for free.

## Navigation Structure (per the wireframe)

```
RootNavigator (Stack)
└─ MainTabs (Bottom Tabs)
   ├─ Tab: Browse Rooms (Stack)
   │  ├─ RoomListScreen        ← the screen in the image: search bar + filter chips + FlatList of room cards
   │  ├─ RoomDetailScreen      ← room detail, large photo, description
   │  └─ TimeSlotBookingScreen ← pick a time slot + confirm booking
   ├─ Tab: My Bookings (Stack)
   │  ├─ MyBookingsListScreen  ← current/past bookings
   │  └─ BookingDetailScreen   ← single booking detail, cancel booking
   └─ Tab: Profile (Stack)
      └─ ProfileScreen         ← student info, sign out
```

### `RoomListScreen` (as shown in the wireframe)
- Header: search input `[Search rooms...]` (magnifying-glass icon) + a `[Filter ▼]` button opening a bottom sheet/modal of filter chips.
- Filter chips (multi-parameter, multiple selectable at once): Building, Minimum capacity (Min seats), Status (Available / Occupied), Room type (Study room / Lab).
- Body: `FlatList` of `RoomCard`:
  - Room photo (📷 placeholder while loading)
  - Room name (e.g. "Lab A3-101", "Library Zone B")
  - 📍 Location (building/area, e.g. "Building A3", "Main Library")
  - 👥 Capacity (e.g. "30 seats")
  - Status badge: ✅ Available (green background) or 🔴 Occupied (red dot)
- Fixed Bottom Tabs: `Browse Rooms | My Bookings | Profile`.

## Commands

```bash
# Dev server (Expo)
npx expo start

# Run on simulator/device
npx expo run:ios
npx expo run:android

# Type check (strict mode)
npx tsc --noEmit

# Lint
npx eslint . --ext .ts,.tsx --fix

# Test
npx jest --coverage

# Format
npx prettier --write .
```

## Project Structure

```
app/                        → Expo Router routes (if using Expo Router) or entry point
src/
  navigation/                → RootNavigator, MainTabs, per-tab Stacks
  screens/
    browse-rooms/            → RoomListScreen, RoomDetailScreen, TimeSlotBookingScreen
    my-bookings/             → MyBookingsListScreen, BookingDetailScreen
    profile/                 → ProfileScreen
  components/
    RoomCard/                → FlatList card (memoized to preserve 60fps)
    FilterChip/               → Reusable filter chip
    TimeSlotPicker/            → Time-slot picker + conflict indicator
  store/                     → Zustand stores (useFilterStore, useBookingDraftStore)
  services/
    api/                     → API client + TanStack Query hooks (useRooms, useCreateBooking, ...)
  types/                     → Room, TimeSlot, Booking, User, FilterState
  hooks/                     → custom hooks (useDebouncedSearch, useConflictCheck)
  constants/                 → theme, spacing, colors
  utils/                     → pure helpers (formatTime, overlapCheck)
assets/                      → images, icons, fonts
tests/
  unit/                      → tests for utils, hooks, store
  components/                → component tests (RTL)
e2e/                         → end-to-end booking flow tests (optional)
```

## Data Model (assumed — confirm with backend)

```typescript
interface Room {
  id: string;
  name: string;              // "Lab A3-101"
  building: string;          // "Building A3"
  location: string;          // "Main Library" (if it's an area inside the library)
  capacity: number;          // 30
  photoUrl: string | null;
  status: 'available' | 'occupied';
  type: 'study_room' | 'lab';
}

interface TimeSlot {
  start: string;   // ISO datetime
  end: string;     // ISO datetime
}

interface Booking {
  id: string;
  roomId: string;
  userId: string;
  slot: TimeSlot;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
}

interface FilterState {
  query: string;
  buildings: string[];
  minCapacity?: number;
  status?: 'available' | 'occupied';
  type?: Room['type'];
}
```

## Code Style

Example component using Zustand + TanStack Query, following strict TypeScript:

```tsx
// src/screens/browse-rooms/RoomListScreen.tsx
import { FlatList } from 'react-native';
import { useRooms } from '@/services/api/useRooms';
import { useFilterStore } from '@/store/useFilterStore';
import { RoomCard } from '@/components/RoomCard';
import type { Room } from '@/types';

export function RoomListScreen() {
  const filters = useFilterStore((s) => s.filters);
  const { data: rooms, isLoading } = useRooms(filters);

  const renderItem = ({ item }: { item: Room }) => <RoomCard room={item} />;

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      initialNumToRender={8}
      windowSize={5}
      removeClippedSubviews
    />
  );
}
```

Conventions:
- Function components + hooks only, no class components.
- Wrap heavy components (`RoomCard`) in `React.memo` to avoid unnecessary re-renders while the FlatList scrolls.
- Naming: `PascalCase` for components, `camelCase` for hooks (`useXxx`) and variables, `SCREAMING_SNAKE_CASE` for constants.
- Use absolute imports via the `@/` alias.
- No `any`; `strict` mode enabled in `tsconfig.json`.

## Testing Strategy

- **Unit tests** (Jest): pure logic — especially the `overlapCheck`/conflict-detection for time slots, and the filter reducer in the Zustand store.
- **Component tests** (React Native Testing Library): `RoomCard` renders the correct Available/Occupied state, `FilterChip` toggles state correctly.
- **Integration test**: `TimeSlotBookingScreen` blocks selection of an already-booked slot (disabled/error message shown).
- **E2E (optional, Detox/Maestro):** main flow — search room → filter → view detail → pick a slot → book successfully.
- Coverage target: aim for 100% on conflict-prevention logic; UI coverage elsewhere is driven by actual need, not an enforced global threshold.

## Boundaries

- **Always do:**
  - Run `tsc --noEmit` and the test suite before committing.
  - Memoize list items and use a stable `keyExtractor` to keep the FlatList at 60fps.
  - Validate time-slot overlap both client-side (fast UX) and server-side (source of truth) before confirming a booking.
- **Ask first:**
  - Swapping the state/navigation libraries for anything other than what's in the tech stack table.
  - Adding a new backend/API or changing the Room/Booking data shape.
  - Adding screens/tabs beyond the three defined (Browse Rooms, My Bookings, Profile).
- **Never do:**
  - Allow creation of an overlapping booking for the same room, at the UI or the API layer.
  - Commit secrets/API keys.
  - Delete a failing test without approval.

## Success Criteria

- [ ] `RoomListScreen` matches the wireframe: search bar, filter button, `RoomCard` list with photo/name/location/capacity/status.
- [ ] Filter chips support selecting **multiple criteria at once** (building, capacity, status, room type), with results updating accordingly.
- [ ] FlatList maintains 60fps while scrolling through ≥ 50 room cards (measured via React Native Perf Monitor or Flipper).
- [ ] It is impossible to create two overlapping bookings for the same room — covered by tests for partial and full overlap cases.
- [ ] Bottom Tabs correctly navigate the 3 tabs: Browse Rooms, My Bookings, Profile; each tab preserves its own navigation state when switching back and forth.
- [ ] `npx tsc --noEmit` runs clean (strict mode, no errors).

## Open Questions

1. Is a backend/API for rooms and bookings already available, or should the initial phase use a mock (MSW/json-server)? use a Mock
2. Is realtime room-status updating required (e.g. WebSocket/polling) when another user just booked a room? yes
3. What is the student authentication mechanism (school SSO, email/password, or no auth needed for the demo)?no auth need
4. Is "Filter" in the wireframe a separate modal/bottom sheet, or an inline dropdown right under the search bar? dropdown
5. Is offline support required (viewing saved bookings while offline)?yes

## Changes since first draft (implemented)

- **Seat-map booking** replaces exclusive slot booking. Two pages: `TimeSlotBookingScreen` (pick a slot, shows seats left per slot) then `SeatSelectionScreen` ("Pick Seats": seats left, seat map, confirm). Specific seats on the room's seat map (`seatIds`, shown as 1..capacity). A seat is blocked only when an overlapping confirmed booking holds that same seat; a slot shows `capacity - taken seats` left. Room card shows `seatsLeft/capacity`. A room with 0 seats left, or seeded `occupied`, is shown Occupied and cannot be booked.
- **One user cannot hold two overlapping bookings** (any room). Enforced in the mock API.
- **Accounts**: register and login pages (`AuthStack`) backed by Firebase Auth (email + password) with a profile document in Firestore (`users/{uid}`). Session lives in Zustand (`useSessionStore`), restored on launch; sign-out works. Setup: `SPEC-firebase-setup.md`. Bookings and rooms are still the in-memory mock.
- **Local reminder** 15 min before a slot starts (`expo-notifications`), cancelled with the booking. In-app toast on book/cancel.
- **Room data** gained `floor` and `amenities`; My Bookings shows room info.
- **UI**: Phosphor icons (no emoji), generated SVG room illustrations, Inter font, light/dark tokens, skeleton loading, empty states.
