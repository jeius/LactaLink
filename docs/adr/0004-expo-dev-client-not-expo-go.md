# 0004. Expo dev-client builds, not Expo Go

Date: backfilled 2026-10-08 · Status: accepted

## Context

The mobile app depends on native modules Expo Go cannot run: Google Maps (`react-native-google-maps-plus`), Skia, MMKV, Reanimated worklets, Google Sign-In, edge-to-edge, and others.

## Decision

Develop and distribute via EAS dev-client builds: `pnpm build:android-dev` / `pnpm build:ios-dev` (or local variants) produce a development APK/IPA installed on devices; day-to-day development runs `pnpm dev:mobile` (`expo start --dev-client`). Preview/production go through EAS build profiles and `expo-updates` OTA channels.

## Consequences

- First-run and post-native-change friction: a new dev-client build is required whenever native dependencies change (JS-only changes do not need rebuilds).
- `apps/mobile/package.json` pins an `expo.install.exclude` list and disables strict react-native-directory checks to keep workspace-pinned versions authoritative over Expo's autodetection — don't let Expo "fix" those versions.
- OTA updates (`expo-updates`) can ship JS-only fixes fast, but never native changes.
- Testing on emulators works, but Android physical devices need ADB port forwarding (`pnpm dev:mobile-safe-adb`).
