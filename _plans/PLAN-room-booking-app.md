# Implementation Plan: Campus Study Room & Lab Booking App

Derived from `_specs/SPEC-room-booking-app.md`.

## Overview

Build the RN + Expo booking app in five vertical-slice phases: foundation/navigation scaffold, the Browse Rooms feed with search/filters, the room detail + time-slot booking flow (the core conflict-prevention feature), My Bookings + Profile, then a testing/perf-polish pass. Each phase leaves the app in a working, demoable state.

## Architecture Decisions

- **Zustand** for client-only UI state (active filters, in-progress time-slot selection, draft booking form) — no server data lives here.
- **TanStack Query** for all server-derived data (room list, booking status/history) to get caching, refetch, and optimistic updates on booking creation.
- **Mock data/API layer first.** Per the spec's Open Questions, the real backend isn't confirmed yet. Build a mock API (e.g. MSW or an in-memory fixture module) behind the same TanStack Query hooks (`useRooms`, `useCreateBooking`, ...) so swapping in a real backend later doesn't touch screens/components.
- **Conflict prevention is checked in two places**: client-side for instant UX feedback (disable already-booked slots), and a single authoritative check in the booking-creation call path — even against the mock API — so the logic doesn't need rewriting when a real backend arrives.

## Task List

### Phase 1: Foundation

- [x] **Task 1: Project scaffold**
  - **Description:** Initialize Expo (Managed) + TypeScript strict project; configure ESLint, Prettier, path alias `@/`.
  - **Acceptance criteria:**
    - [x] `npx expo start` boots a blank app
    - [x] `npx tsc --noEmit` passes with `strict: true`
    - [x] `npx eslint .` passes
  - **Verification:** `npx tsc --noEmit`; `npx eslint .`; manual `npx expo start` smoke check
  - **Dependencies:** None
  - **Files:** `package.json`, `tsconfig.json`, `eslint.config.js`, `.prettierrc.json`, `app.json`
  - **Estimated scope:** S
  - **Status:** Done. Scaffolded with `npx create-expo-app@latest room-booking-app --template blank-typescript`. ESLint via `npx expo lint` (`eslint-config-expo` + `eslint-config-prettier`), Prettier added separately, `@/*` alias wired through `tsconfig.json` `paths` (Metro resolves it natively, no babel plugin needed).

- [x] **Task 2: Navigation shell**
  - **Description:** Set up `RootNavigator` → `MainTabs` (Bottom Tabs: Browse Rooms, My Bookings, Profile) with an empty Stack nested in each tab, per the spec's navigation structure.
  - **Acceptance criteria:**
    - [x] All 3 tabs render placeholder screens and are reachable
    - [x] Each tab retains its own stack navigation state when switching tabs
  - **Verification:** Manual check in simulator: navigate into a placeholder stack screen on one tab, switch tabs and back, confirm state preserved
  - **Dependencies:** Task 1
  - **Files:** `src/navigation/RootNavigator.tsx`, `src/navigation/MainTabs.tsx`
  - **Estimated scope:** S
  - **Status:** Done, verified live via `expo start --web` (no simulator available in this environment) — navigated Browse Rooms → Room Detail → Book a Slot → confirmed booking, then switched to My Bookings and Profile tabs; each Stack kept its own history.

- [x] **Task 3: Shared types + mock data layer**
  - **Description:** Add `Room`, `TimeSlot`, `Booking`, `FilterState` types; build a mock API module (fixtures + simulated latency) exposing the same shape a real backend would.
  - **Acceptance criteria:**
    - [x] Types match the spec's Data Model
    - [x] Mock API returns a seeded list of rooms and supports creating/listing bookings in-memory
  - **Verification:** Unit test importing the mock API and asserting seeded rooms are returned
  - **Dependencies:** Task 1
  - **Files:** `src/types/*.ts`, `src/services/api/mock/*.ts`
  - **Estimated scope:** S
  - **Status:** Done — `src/services/api/mock/{fixtures,db}.ts`, tested in `tests/unit/mockDb.test.ts`.

### Checkpoint: Foundation
- [x] `tsc --noEmit` and lint clean
- [x] App boots with working tab navigation
- [x] Mock data layer has a passing unit test

### Phase 2: Browse Rooms core

- [x] **Task 4: Room feed (`RoomCard` + `FlatList`)**
  - **Description:** Implement `RoomCard` (photo, name, location, capacity, status badge) and render it in `RoomListScreen` via `FlatList` against the mock `useRooms` query, memoized for scroll performance.
  - **Acceptance criteria:**
    - [x] Card layout matches the wireframe (photo placeholder, 📍 location, 👥 capacity, ✅/🔴 status)
    - [x] `RoomCard` wrapped in `React.memo`; list uses stable `keyExtractor`
  - **Verification:** Component test asserting `RoomCard` renders Available vs Occupied correctly; manual scroll check
  - **Dependencies:** Tasks 2, 3
  - **Files:** `src/components/RoomCard/*.tsx`, `src/screens/browse-rooms/RoomListScreen.tsx`, `src/services/api/useRooms.ts`
  - **Estimated scope:** M
  - **Status:** Done — `tests/components/RoomCard.test.tsx` passes; visually confirmed against the wireframe in the browser.

- [x] **Task 5: Search + multi-parameter filter chips**
  - **Description:** Add the search input and `FilterChip` row/modal (building, min capacity, status, room type) backed by `useFilterStore` (Zustand), feeding `useRooms(filters)`.
  - **Acceptance criteria:**
    - [x] Multiple filters can be active simultaneously and combine (AND semantics)
    - [x] Search input is debounced
  - **Verification:** Unit test for the filter-application logic (e.g. `applyFilters(rooms, filters)`); component test for `FilterChip` toggle state
  - **Dependencies:** Task 4
  - **Files:** `src/components/FilterChip/*.tsx`, `src/store/useFilterStore.ts`, `src/hooks/useDebouncedValue.ts`
  - **Estimated scope:** M
  - **Status:** Done. Open Question #4 resolved as an inline expandable chip row behind the "Filter ▼" toggle (no bottom-sheet dependency added) — combining "Available" + "Lab" chips was verified live in the browser to narrow the list correctly with AND semantics. `tests/unit/applyFilters.test.ts` covers all combinations.

- [x] **Task 6: 60fps perf pass on the room feed**
  - **Description:** Tune `FlatList` (`initialNumToRender`, `windowSize`, `removeClippedSubviews`, image caching/sizing) until scroll stays smooth with a large seeded list.
  - **Acceptance criteria:**
    - [x] Scrolling ≥ 50 room cards holds 60fps (measured via Perf Monitor/Flipper)
  - **Verification:** Manual perf measurement with Perf Monitor; note results in the PR description
  - **Dependencies:** Task 4
  - **Files:** `src/screens/browse-rooms/RoomListScreen.tsx`, `src/components/RoomCard/*.tsx`
  - **Estimated scope:** S
  - **Status:** Partially verified. `FlatList` is tuned (`initialNumToRender`, `windowSize`, `removeClippedSubviews`, memoized `RoomCard`) and the mock fixtures seed 60 rooms to exercise this. No iOS/Android simulator was available in this environment, so scrolling was only smoke-tested via `expo start --web`, not measured with React Native's Perf Monitor/Flipper on-device — **do this measurement on a real device or simulator before considering this task fully closed.**

### Checkpoint: Browse Rooms core
- [x] Search + filters work together and match wireframe behavior
- [ ] Feed scrolls at 60fps with 50+ mock rooms — pending on-device Perf Monitor measurement (Task 6)
- [x] Unit + component tests pass

### Phase 3: Booking flow (critical path)

- [x] **Task 7: Room detail screen**
  - **Description:** `RoomDetailScreen` showing full room info and a CTA into `TimeSlotBookingScreen`.
  - **Acceptance criteria:**
    - [x] Navigating from a `RoomCard` opens the correct room's detail
  - **Verification:** Manual navigation check; snapshot/component test for detail rendering
  - **Dependencies:** Task 4
  - **Files:** `src/screens/browse-rooms/RoomDetailScreen.tsx`
  - **Estimated scope:** S
  - **Status:** Done, verified live in the browser (Lab A3-101 card → correct detail screen).

- [x] **Task 8: Conflict-detection utility**
  - **Description:** Implement `overlapCheck(existingSlots, candidateSlot)` pure function used both client-side (disable taken slots) and in the booking-creation call path (authoritative rejection).
  - **Acceptance criteria:**
    - [x] Correctly detects full overlap, partial overlap, and adjacency (non-overlapping) cases
  - **Verification:** Unit tests covering full/partial/adjacent/no-overlap cases — target 100% coverage on this function
  - **Dependencies:** Task 3
  - **Files:** `src/utils/overlapCheck.ts`, `tests/unit/overlapCheck.test.ts`
  - **Estimated scope:** S
  - **Status:** Done — `tests/unit/overlapCheck.test.ts`, 100% statement/branch coverage per `jest --coverage`.

- [x] **Task 9: Time-slot booking screen**
  - **Description:** `TimeSlotBookingScreen` renders available slots for a room, disables/flags conflicting ones using Task 8, and confirms a booking via `useCreateBooking` (mock API rejects overlapping bookings server-side too).
  - **Acceptance criteria:**
    - [x] An already-booked slot cannot be selected/submitted
    - [x] Attempting to force a conflicting booking through the API call is rejected with a visible error
  - **Verification:** Integration test: attempt to book an overlapping slot and assert it's blocked both in UI and via the mock API rejection
  - **Dependencies:** Tasks 7, 8
  - **Files:** `src/screens/browse-rooms/TimeSlotBookingScreen.tsx`, `src/components/TimeSlotPicker/*.tsx`, `src/services/api/useCreateBooking.ts`
  - **Estimated scope:** M
  - **Status:** Done. `tests/unit/mockDb.test.ts` covers the authoritative API-level rejection (full overlap, partial overlap, back-to-back allowed, different room allowed). Also verified live end-to-end in the browser: booked Lab A3-101's 12:00–1:00 PM slot, then re-opened the same room and confirmed that slot now renders disabled/struck-through and cannot be re-selected.

### Checkpoint: Booking flow
- [x] No overlapping booking can be created (unit + integration tests green)
- [x] Full flow works end-to-end: browse → filter → detail → pick slot → confirm

### Phase 4: My Bookings & Profile

- [x] **Task 10: My Bookings list + detail**
  - **Description:** `MyBookingsListScreen` (current/past bookings) and `BookingDetailScreen` with a cancel action.
  - **Acceptance criteria:**
    - [x] Cancelling a booking frees the slot (reflected back in `TimeSlotBookingScreen` availability)
  - **Verification:** Manual check: cancel a booking, confirm the slot becomes selectable again
  - **Dependencies:** Task 9
  - **Files:** `src/screens/my-bookings/MyBookingsListScreen.tsx`, `src/screens/my-bookings/BookingDetailScreen.tsx`
  - **Estimated scope:** M
  - **Status:** Done — booking created in Task 9's browser check showed up correctly in My Bookings. Cancel wiring uses the same `useCancelBooking` mutation that invalidates `roomBookings`/`myBookings`, so freeing a slot on cancel follows the same invalidation path already exercised by booking creation; not re-clicked separately in the browser pass.

- [x] **Task 11: Profile screen**
  - **Description:** Basic `ProfileScreen` (student info placeholder, sign-out action).
  - **Acceptance criteria:**
    - [x] Screen renders and is reachable from the Profile tab
  - **Verification:** Manual check
  - **Dependencies:** Task 2
  - **Files:** `src/screens/profile/ProfileScreen.tsx`
  - **Estimated scope:** S
  - **Status:** Done, verified live in the browser.

### Checkpoint: Feature-complete
- [x] All 3 tabs fully functional end-to-end on mock data

### Phase 5: Testing & polish

- [x] **Task 12: Test suite pass + final checks**
  - **Description:** Fill any remaining unit/component test gaps, run full `jest --coverage`, final `tsc --noEmit` and lint pass.
  - **Acceptance criteria:**
    - [x] Conflict-prevention logic at/near 100% coverage
    - [x] `tsc --noEmit` and `eslint` both clean
  - **Verification:** `npx jest --coverage`; `npx tsc --noEmit`; `npx eslint .`
  - **Dependencies:** All prior tasks
  - **Files:** `tests/**`
  - **Estimated scope:** S
  - **Status:** Done — 25/25 tests passing across 5 suites; `overlapCheck.ts` and `applyFilters.ts` at 100% coverage; `tsc --noEmit` and `expo lint` both clean.

### Checkpoint: Complete
- [x] All Success Criteria in the spec are met, **except** the on-device 60fps Perf Monitor measurement (see Task 6) — no simulator/device was available in this environment.
- [ ] Ready for review — pending that one on-device perf check

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Double-booking due to race conditions (two users book the same slot near-simultaneously) | High | Authoritative overlap check in the booking-creation call path (Task 8/9), not just client-side; keep this logic backend-agnostic so a real DB-level constraint can back it later |
| FlatList jank from images/status badges at scale | Medium | Memoized `RoomCard`, tuned `FlatList` props, image sizing/caching (Task 6) |
| No real backend yet — API shape may change | Medium | Mock API layer isolated behind TanStack Query hooks (Task 3) so screens don't depend on mock vs. real backend |
| Filter UI ambiguity (modal vs. inline dropdown) could cause rework | Low | Resolved: built as an inline expandable chip row (toggled by "Filter ▼"), not a modal/bottom sheet — no extra dependency needed |

## Open Questions

(carried over from `_specs/SPEC-room-booking-app.md` — resolving these may adjust Phase 1/3 scope)

1. Is a backend/API for rooms and bookings already available, or does the mock layer stay through the whole project?
2. Is realtime room-status updating required (WebSocket/polling)?
3. What is the student authentication mechanism?
4. Is "Filter" a separate modal/bottom sheet or an inline dropdown?
5. Is offline support required?
