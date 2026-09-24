# VKU – Cross-platform Development
## MINI-PROJECT SHORT TECHNICAL REPORT

**Project:** Mini-Project 2 – Real-time Study Room Booking App
**Date:** 24/09/2026

---

## 1. Team information

| Field | Value |
|---|---|
| Team name | `TODO: fill in` |
| Class | `TODO: fill in` |

| # | Student name | Student ID | Role | Contribution (%) |
|---|---|---|---|---|
| 1 | `TODO` | `TODO` | `TODO` | `TODO` |
| 2 | `TODO` | `TODO` | `TODO` | `TODO` |

> Names, IDs, roles and contribution percentages were not provided, so they are left blank on purpose.

---

## 2. Product links

| Item | Link |
|---|---|
| Source code (GitHub) | https://github.com/sunsanti/DNT_week6 |
| Live demo (GitHub Pages, installable PWA) | https://sunsanti.github.io/DNT_week6/ |
| Android APK (GitHub Release) | https://github.com/sunsanti/DNT_week6/releases/latest (`room-booking-app.apk`, ~42 MB, debug-signed) |
| Demo video | N/A |

**Stack:** React Native + Expo SDK 57 (managed), TypeScript strict, React Navigation 7 (Bottom Tabs + Native Stack), Zustand (client state), TanStack Query (server state), Firebase Auth + Firestore (accounts), expo-notifications (reminders).

---

## 3. Feature checklist

| Requirement | Status | Notes |
|---|---|---|
| Browse rooms with search + filter chips (status, type) | Done | `RoomListScreen`, state in `useFilterStore` |
| Room list as `FlatList` with memoized cards | Done | `RoomCard` is `memo`, skeleton while loading. **60 fps was not measured on a device.** |
| Two-step booking: time slot, then seats | Done | `TimeSlotBookingScreen` then `SeatSelectionScreen`, shows "N of M seats left" |
| Conflict prevention | Done | A seat cannot be double-booked for an overlapping slot; one user cannot hold two overlapping bookings; occupied rooms cannot be booked. Checked again in the (mock) API, not only in the UI. |
| Global state with Zustand | Done | filters, booking draft (slot + seats), session, toast |
| My Bookings + cancel | Done | Shows room, building, floor, seats, time, status |
| Local notification reminder (15 min before slot) | Done, Android app only | Not available on web or in Expo Go. See screenshot 9. |
| Sign up / sign in / persisted login | Done | Firebase Auth (email + password), profile doc in Firestore `users/{uid}` |
| Dark mode + responsive layout | Done | Follows system theme; web is capped at 480 px |
| Live demo + installable on mobile | Done | GitHub Pages PWA + APK |
| Real-time updates across users | **Not done** | Rooms and bookings live in an in-memory mock DB. Only accounts are in Firebase. |
| Booking persistence across app restarts | **Not done** | Same reason as above |

Automated checks: `tsc --noEmit` clean, 46 Jest tests passing (overlap/seat logic, filters, mock DB, auth validation, reminder time, session watcher, `RoomCard`, `FilterChip`).

---

## 4. Screenshots

All screenshots were taken from the release APK running on an Android emulator (Pixel 8, 1080x2400). Red numbers mark the points described under each image.

### 1. Sign in
![Login](images/s01_login.png)
Email + password form with validation. Session is restored on the next launch.

### 2. Register
![Register](images/s02_register.png)
Account creation (Firebase Auth). The form scrolls and stays above the keyboard.

### 3. Browse rooms with filters
![Browse](images/s03_filters.png)
1. Search box. 2. Filter chips (here: *Available* + *Lab*). 3. Room cards in a two-column `FlatList` with seats left and status badge.

### 4. Step 1: pick a time slot
![Slots](images/s04_slots.png)
1. Selected slot. 2. Free seats for that slot. 3. "Continue to seats" is enabled only after a slot is picked.

### 5. Step 2: pick seats
![Seats](images/s05_seats.png)
1. "N of M seats left" for the chosen slot. 2. Selected seats (blue). 3. Confirm button shows the seat count.

### 6. Notification permission and confirmation toast
![Confirmed](images/s06_confirmed.png)
After confirming, a toast appears. On first booking the app asks for notification permission.

### 7. My Bookings
![My bookings](images/s07_mybookings.png)
1. Booking card: room, building, floor, seats, time, status.

### 8. Seat conflict prevention
![Taken](images/s08_taken.png)
Seats 5, 6, 12 are now taken for the same slot. They are disabled and struck through, and the counter dropped from 30 to 27.

### 9. Reminder notification
![Notification](images/s10_notification.png)
"Upcoming: Lab A3-102, Seat 1, 3:00 PM - 4:00 PM". It was scheduled for 14:45 (15 min before the slot). Android delivered it at about 14:49 because it batches inexact alarms (`dumpsys alarm` showed a delivery window of about 4.5 min).

### 10. Dark mode
![Dark](images/s09_dark.png)
Same screen with the system dark theme.

---

## 5. Challenges and solutions

1. **Form hidden by the keyboard (Android edge-to-edge).** On the Register screen the keyboard covered the fields and the page did not scroll. Found while testing on the emulator. Fixed with a scrollable form inside `KeyboardAvoidingView behavior="padding"`.
2. **APK shipped with the wrong Firebase config.** Gradle cached the JS bundle and ignored the new `.env.local`, so the APK still used placeholder values. Fixed by forcing a re-bundle (`createBundleReleaseJsAndAssets --rerun`) and verifying by searching for the project id inside the built bundle.
3. **Smaller issues:** `expo-notifications` throws in Expo Go on Android (now lazy-imported and skipped there); the startup spinner could hang for a deleted account on a slow network (session check now gives up after 4 s); SVG gradients disappeared on stacked screens because of duplicate ids (unique id per instance).

**Known limits / future work:** move rooms and bookings to Firestore for real-time sync and persistence; measure list performance on a physical device; the APK is debug-signed.
