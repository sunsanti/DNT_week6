# Spec: Firebase Auth + Firestore setup

> **Status: configured.** Project `room-booking-dnt-2409263199` ("Room Booking", Web app "Room Booking App") was created with the Firebase CLI. Firestore `(default)` database (asia-southeast1, Standard) exists, Email/Password sign-in is enabled and `firestore.rules` is deployed. `room-booking-app/.env.local` holds the web config. Checked end to end on an Android emulator with the release APK. The manual steps below are only needed to recreate this in another project.

The app stores accounts in **Firebase Authentication** (email + password) and a profile document per user in **Cloud Firestore** (`users/{uid}`: `name`, `email`, `createdAt`). It uses the Firebase **JS SDK** (`firebase`), so it works in Expo Go, a development build and the release APK with no native Firebase modules.

Login is kept across app restarts (AsyncStorage persistence, `@react-native-async-storage/async-storage`).

## One-time setup (~3 minutes, done by you in the browser)

1. Open https://console.firebase.google.com and sign in with your Google account.
2. **Add project** → name it (e.g. `room-booking`) → Google Analytics can be off → Create.
3. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
4. **Build → Firestore Database → Create database.** Pick a location near you, start in **production mode** (the rules below replace the default).
5. **Firestore → Rules** tab: paste the contents of `room-booking-app/firestore.rules` → **Publish**.
6. **Project settings (gear) → General → Your apps → `</>` Web** → register an app (no hosting) → copy the `firebaseConfig` values.
7. In `room-booking-app/`:
   ```bash
   cp .env.example .env.local
   ```
   Fill the six `EXPO_PUBLIC_FIREBASE_*` values from step 6 into `.env.local`.
8. Restart the dev server so the values are picked up: `npm run start` (add `--clear` if it still says "not configured").

Until step 7 is done the app opens normally and the Register/Login forms show *"Firebase is not configured yet"* instead of crashing.

## Rebuilding the APK

`EXPO_PUBLIC_*` values are inlined when the JS bundle is built, so `.env.local` must exist **before** running `./gradlew assembleRelease` (see `SPEC-setup-and-commands.md`). An APK built without it cannot sign in.

## Security notes

- The Firebase web config (apiKey, projectId, ...) is **not a secret**; access is controlled by Authentication and the Firestore rules. Do not add a service-account key or admin credentials to the app.
- `.env.local` is gitignored anyway; commit `.env.example` only.
- Passwords are handled by Firebase Auth. The app never stores or logs them.
- Current rules allow each user to read/write **only** `users/{their uid}`. Bookings and rooms are still the in-memory mock (`src/services/api/mock/db.ts`), not Firestore. Moving them to Firestore needs new rules and transactions for the seat-conflict check; ask before doing it.

## Testing without a Firebase project (Emulator)

Needs Java 21+.

```bash
mkdir /tmp/fbemu && cd /tmp/fbemu
echo '{ "emulators": { "auth": { "port": 9099 }, "firestore": { "port": 8080 } } }' > firebase.json
npx firebase-tools emulators:start --only auth,firestore --project demo-roombooking
```

Then in another terminal, from `room-booking-app/`:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=fake EXPO_PUBLIC_FIREBASE_PROJECT_ID=demo-roombooking \
EXPO_PUBLIC_FIREBASE_APP_ID=fake EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=localhost npx expo start --web
```

On an Android emulator use `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=10.0.2.2`.

## Code map

| File | Role |
|---|---|
| `src/services/firebase.ts` | Lazy Firebase init from env; optional emulator; friendly error if not configured |
| `src/services/auth.ts` | `register`, `login`, `logout`, `watchSession` (restores login, feeds the session store) |
| `src/store/useSessionStore.ts` | Zustand: `user`, `initializing` |
| `src/components/AuthForm/AuthForm.tsx` | Shared form for the Login and Register screens |
| `src/utils/authValidation.ts`, `authErrors.ts` | Input checks and Firebase error → message (unit tested) |
| `firestore.rules` | Security rules to publish |

## Doing it with the CLI (what was actually run)

```bash
npx firebase-tools login                                   # prints a URL; then: login <authorization-code>
npx firebase-tools projects:create <unique-id> --display-name "Room Booking"
npx firebase-tools apps:create WEB "Room Booking App" --project <id>
npx firebase-tools apps:sdkconfig WEB <appId> --project <id>   # values for .env.local
npx firebase-tools deploy --only firestore:rules --project <id> # enables the API, creates (default) DB, publishes rules
npx firebase-tools deploy --only auth --project <id>            # enables Email/Password (auth.providers in firebase.json)
```

Files in `room-booking-app/`: `firebase.json` (rules path + `auth.providers.emailPassword`), `.firebaserc` (default project), `firestore.rules`. Rules can take up to a minute to take effect after the first deploy (writes return 403 until then).

To revoke CLI access to your Google account: `npx firebase-tools logout`.

## Gotcha: rebuilding the APK after changing `.env.local`

Gradle does not treat `.env.local` as an input, so `assembleRelease` may reuse the previous JS bundle and ship the **old** config (this happened once: an APK still contained the emulator project id). Force the bundle to rebuild:

```bash
cd android && ./gradlew :app:createBundleReleaseJsAndAssets --rerun :app:assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Check the result: `unzip -p app-release.apk assets/index.android.bundle | grep -a -c "<your-project-id>"` should be > 0.

## Testing on an Android emulator

- Firebase Emulator (http) needs `usesCleartextTraffic` in the manifest for a release build; the real project (https) does not.
- If the emulator shows "No connection" but `ping 8.8.8.8` works, DNS is broken: start it with `emulator -avd <name> -dns-server 8.8.8.8,1.1.1.1`.
- Android 15+ emulators may show a stylus tutorial; `adb shell settings put secure stylus_handwriting_enabled 0`.
