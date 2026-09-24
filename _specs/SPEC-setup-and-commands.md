# Spec: Setup & Commands Log — `room-booking-app`

A running log of every command used to scaffold, install dependencies for, and run the app in `room-booking-app/`, plus the commands anyone else needs to run the project. Companion to `SPEC-room-booking-app.md` and `_plans/PLAN-room-booking-app.md`.

## Environment used

- Node: `v24.13.0`
- npm: `11.6.2`
- Expo SDK: `~57.0.23` (managed workflow)
- React Native: `0.86.3`, React: `19.2.3`

## 1. Project scaffold

Created the Expo + TypeScript project (blank template, since React Navigation is used instead of Expo Router):

```bash
npx create-expo-app@latest room-booking-app --template blank-typescript --yes
```

Run from the repo root (`week5/`); this created the `room-booking-app/` folder with its own `package.json`, `App.tsx`, `tsconfig.json` (`strict: true` already on), and its own git repo (create-expo-app initializes one automatically).

## 2. Navigation — React Navigation 7

```bash
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
```

- `@react-navigation/native` — core navigation container.
- `@react-navigation/native-stack` — the Stack navigator nested inside each tab.
- `@react-navigation/bottom-tabs` — the Browse Rooms / My Bookings / Profile tab bar.
- `react-native-screens`, `react-native-safe-area-context` — required native dependencies for any React Navigation navigator.

`npx expo install` (not plain `npm install`) is used for any native module so Expo resolves the version compatible with the installed SDK (57).

Not installed: `react-native-gesture-handler` / `@react-native-masked-view/masked-view` — those are only needed for the classic JS `@react-navigation/stack`, not for `native-stack` + `bottom-tabs`, which is what this project uses.

## 3. State management — Zustand + TanStack Query

```bash
npm install zustand @tanstack/react-query
```

Plain `npm install` is correct here since neither package has native code.

## 4. Linting — ESLint (Expo's official flow)

```bash
npx expo lint
```

This is Expo's CLI helper (SDK 53+): on first run it installs `eslint` and `eslint-config-expo` and generates `eslint.config.js` (flat config) automatically. No separate `npm install` step was needed for these two packages.

## 5. Formatting — Prettier

```bash
npm install --save-dev prettier eslint-config-prettier
```

`eslint-config-prettier` was then added to `eslint.config.js` (after `expoConfig` in the `defineConfig([...])` array) to turn off ESLint stylistic rules that would conflict with Prettier.

## 6. Web support (local preview convenience)

```bash
npx expo install react-dom react-native-web
```

Not in the original tech-stack table — added so the app (and `npm run web`) can be smoke-tested in a browser via `expo start --web` without needing an iOS/Android simulator. Everything still targets React Native + Expo managed as the primary platform.

## 7. Testing — Jest + React Native Testing Library

```bash
npx expo install jest-expo jest @types/jest --dev
npx expo install @testing-library/react-native --dev
```

- `jest-expo` — Jest preset that mocks the native Expo/React Native modules.
- `@testing-library/react-native` — `render`, `fireEvent`, etc. for component tests.

Manual config added on top of the install:
- `package.json`: `"jest": { "preset": "jest-expo", "moduleNameMapper": { "^@/(.*)$": "<rootDir>/src/$1" } }` — the `moduleNameMapper` is required because Jest doesn't read Metro/tsconfig path aliases on its own.
- `tsconfig.json`: added `"jest"` to `compilerOptions.types` for global `describe`/`it`/`expect` typings.

## 8. UI/UX polish — icons, SVG illustrations, typography

```bash
npx expo install react-native-svg phosphor-react-native expo-font @expo-google-fonts/inter
```

- `react-native-svg` — required peer dependency for both `phosphor-react-native` and the app's own hand-built `RoomIllustration` component.
- `phosphor-react-native` — vector icon set, replacing every emoji used as a structural icon (search, location pin, seat count, status badges, tab bar, filter caret, profile avatar). Emoji-as-icon is flagged as an anti-pattern by the `ui-ux-pro-max` design skill (see below) since emoji are font-dependent and can't be theme-controlled.
- `expo-font` + `@expo-google-fonts/inter` — loads the Inter typeface (returned by the design-system search below) via `useFonts` in `App.tsx`, with a loading gate shown until fonts are ready. `npx expo install` auto-added the `expo-font` config plugin to `app.json`.

`app.json`'s `userInterfaceStyle` was also changed from `"light"` to `"automatic"` so the OS chrome follows the system theme, matching the app's new light/dark token support (`src/constants/theme.ts`, `useThemeColors()` + `useColorScheme()`).

### Design-system source: the `ui-ux-pro-max` Claude Code skill

Installed as a Claude Code plugin (not an npm dependency of the app) from a third-party marketplace, after verifying its manifest/license/content:

```bash
claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

Source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (MIT license). Provides a local, searchable database (styles, color palettes, font pairings, UX guidelines, icons, per-stack rules including `react-native`) used to pick the color palette (Minimalism & Swiss Style: primary `#2563EB`, accent `#059669`, background `#F8FAFC`, dark-mode counterparts in `theme.ts`), the Inter font pairing, the Phosphor icon set, and the pre-delivery checklist (touch targets ≥44pt, no emoji icons, pressed-state feedback, light/dark contrast) applied across the screens/components.

The plugin only takes effect for the Skill tool in a **new** Claude Code session (a running session doesn't hot-reload newly installed plugin skills) — its `SKILL.md`/reference files were read directly from `~/.claude/plugins/cache/ui-ux-pro-max-skill/...` to apply this round of changes without restarting.

## 9. Local notifications, Android system UI, APK build

```bash
npx expo install expo-notifications expo-system-ui
```

- `expo-notifications` — local reminder 15 min before a booked slot starts (`src/services/reminders.ts`). The booking id is the notification id, so cancelling a booking cancels its reminder. Not supported on web, and **not usable in Expo Go**: since SDK 53 the package throws on import there (`expo-notifications: Android Push notifications ... removed from Expo Go`). `reminders.ts` skips it when `isRunningInExpoGo()`, so the app runs in Expo Go with reminders off; use the APK or a development build (`npx expo run:android`) for reminders.
- `expo-system-ui` — makes `userInterfaceStyle: "automatic"` (dark mode) work on Android.
- `app.json` got `android.package` / `ios.bundleIdentifier` = `com.dnt.roombooking`.

### Build a release APK locally (no Expo account needed)

Needs JDK 17-22 (JDK 25 not used), Android SDK (platform 36, NDK 28, build-tools 36):

```bash
cd room-booking-app
npx expo prebuild -p android --no-install        # generates android/ (gitignored)
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
cd android
export JAVA_HOME=<path to JDK 17-22> ANDROID_HOME=$HOME/Library/Android/sdk
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
# output: android/app/build/outputs/apk/release/app-release.apk
```

`-PreactNativeArchitectures=arm64-v8a` builds only for 64-bit ARM phones (most modern Android); drop it for a universal APK. First build ~28 min (downloads Gradle + compiles native code); later builds are faster. APK is signed with the Expo template's debug keystore — fine for sideloading, not for Play Store.

## 10. Accounts: Firebase Auth + Firestore

```bash
npm install firebase
npx expo install @react-native-async-storage/async-storage
```

- `firebase` (JS SDK, no native modules): email/password Auth and Firestore. Works in Expo Go, dev builds and the APK.
- `@react-native-async-storage/async-storage` (2.2.0, pinned by Expo): keeps the login across app restarts.

Setup of the Firebase project itself (console steps, `.env.local`, security rules) is in `SPEC-firebase-setup.md`. Values are read from `EXPO_PUBLIC_FIREBASE_*`, which are inlined at bundle time, so create `.env.local` **before** `npm run start` or before building the APK.

Local testing without a Firebase project uses the emulators (`npx firebase-tools emulators:start --only auth,firestore --project demo-roombooking`, needs Java 21+); see `SPEC-firebase-setup.md`.

## Manual config changes (no install, but part of setup)

- `tsconfig.json` — added `"paths": { "@/*": ["./src/*"] }` for the `@/` import alias (Metro resolves tsconfig paths natively as of recent Expo SDKs — no `babel-plugin-module-resolver` needed). Note: no `baseUrl` — TypeScript 6 deprecates bare `baseUrl`, and `paths` alone resolves relative to the tsconfig file.
- `.prettierrc.json` — added (`semi`, `singleQuote`, `trailingComma: all`, `printWidth: 100`).
- `.gitignore` — added `coverage/` (Jest coverage output).
- `package.json` scripts — added `format`, `typecheck`, `test` (see below).

## How to run the project

From `room-booking-app/`:

```bash
# install all dependencies (after cloning)
npm install

# start the Metro dev server (scan the QR with Expo Go, or press a platform key)
npm run start        # same as: npx expo start

# run directly on a platform
npm run android      # npx expo start --android
npm run ios          # npx expo start --ios
npm run web          # npx expo start --web
```

## How to verify the code

```bash
npm run typecheck    # npx tsc --noEmit   (strict mode)
npm run lint         # npx expo lint
npm run format       # npx prettier --write .
npm run test         # npx jest
npx jest --coverage  # test run with a coverage report
```

All four currently pass clean on this codebase (25/25 tests, `overlapCheck.ts` and `applyFilters.ts` at 100% coverage).

## Notes

- No backend is required to run the app — `src/services/api/mock/db.ts` is an in-memory mock (seeded rooms + a `setTimeout`-based simulated latency) sitting behind the same TanStack Query hooks a real API would use, per the Open Questions in `SPEC-room-booking-app.md`.
- If a real backend is introduced later, only `src/services/api/mock/*` needs to be swapped out — the hooks (`useRooms`, `useCreateBooking`, ...) and every screen/component stay the same.
