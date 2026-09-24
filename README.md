# Study Room Booking

Mobile app for booking campus study rooms and labs: browse and filter rooms, pick a time slot, then choose your exact seats. Built with React Native + Expo (managed), TypeScript (strict), React Navigation 7, Zustand and TanStack Query. Accounts use Firebase Authentication + Firestore.

## Try it

| | |
|---|---|
| **Live demo (web, installable)** | https://sunsanti.github.io/DNT_week6/ |
| **Android APK** | [Latest release](https://github.com/sunsanti/DNT_week6/releases/latest) |

**Install the web app on your phone:** open the live demo in Chrome (Android) or Safari (iOS), open the browser menu and choose **Add to Home screen** / **Install app**. It then opens full screen like a native app.

**Install the APK (Android):** download `room-booking-app.apk` from the release, open it, and allow "Install from unknown sources" when asked. It targets 64-bit ARM phones (most modern devices).

Create an account on the Register page, or sign in with one you made earlier. Web build note: local reminder notifications only work in the Android app, not in the browser.

## Features

- Sign up / sign in (Firebase Auth), login persists across restarts
- Room search, multi-parameter filter chips, 60fps `FlatList` feed with memoized cards
- Two-step booking: choose a time slot, then pick seats on a seat map (taken seats are locked)
- Conflict prevention: no double-booked seats, one person cannot hold two overlapping bookings
- My Bookings with room details and cancel; local reminder 15 minutes before a slot (Android app)
- Light and dark themes

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the Firebase web config, see _specs/SPEC-firebase-setup.md
npm run start                # then press w (web), or scan the QR with a development build / Expo Go
npm run web                  # web only
npm test                     # jest
npm run typecheck            # tsc --noEmit
```

Expo Go note: reminder notifications are unavailable in Expo Go (Expo removed that support); everything else works.

Build the Android APK locally: see `_specs/SPEC-setup-and-commands.md`.

## Project docs

- `_specs/SPEC-room-booking-app.md`: what the app does and the decisions made
- `_specs/SPEC-firebase-setup.md`: Firebase project, rules, and env setup
- `_specs/SPEC-setup-and-commands.md`: every install/run/build command used
- `_plans/PLAN-room-booking-app.md`: implementation plan and task status

## Deployment

Every push to `main` runs `.github/workflows/deploy-web.yml`: type check, tests, `expo export -p web`, then publishes to GitHub Pages. The Firebase web config is stored as repository **variables** (it is public config, not a secret); data access is protected by Firestore security rules (`firestore.rules`).

Rooms and bookings are currently an in-memory mock (`src/services/api/mock`); only user accounts live in Firebase.
