---
name: write-mobile-tests
description: "Use this skill whenever the user asks to write, update, or manage tests for the Expo / React Native mobile app. Enforces Jest co-location for unit tests and Maestro centralized folders for E2E tests."
---

# Write Mobile Tests

Whenever you are tasked with creating or modifying tests in the BrokerOS Expo Mobile App, you MUST follow this strict structural guide.

## 1. Testing Layers & Tooling

The mobile app has three distinct testing layers. You must choose the right tool for the job.

- **Unit & Component Tests (`Jest` + `@testing-library/react-native`)**: Use for testing pure React Native UI components (`components/`) and complex TS business logic (e.g., `lib/location-tracking.ts`).
- **E2E UI Tests (`Maestro`)**: Use for testing full user journeys across the app. Maestro uses YAML files to simulate a real user tapping on the Android emulator.
- **Native Module Tests (`JUnit`)**: Use for testing custom native Java/Kotlin code (e.g., `modules/auto-dialer`).

## 2. File Organization Strategy

### Unit & Component Tests (Jest) -> Co-location
You MUST co-locate component and unit tests directly next to the file they are testing. Do not put them in a separate folder.
- **Source:** `apps/mobile/components/CallButton.tsx`
- **Test:** `apps/mobile/components/CallButton.test.tsx`

### E2E UI Tests (Maestro) -> Centralized
Maestro E2E tests must be kept completely separate from the source code.
- **Location:** `apps/mobile/e2e/`
- **Example:** `apps/mobile/e2e/login-flow.yaml`

### Native Module Tests (JUnit) -> Native Structure
Native Android tests must live inside the standard Android `src/test/java` or `src/androidTest/java` directories within the module.
- **Location:** `apps/mobile/modules/auto-dialer/android/src/test/java/expo/modules/autodialer/AutoDialerTest.kt`

## 3. Mocking Expo APIs in Jest

When writing Jest Unit tests, complex Expo APIs will crash the test runner if they are not mocked, because Jest runs in Node.js, not a real phone.
You must explicitly mock these APIs at the top of your test file if the component uses them:

**Mocking Location:**
```typescript
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({ coords: { latitude: 12.34, longitude: 56.78 } }),
}));
```

**Mocking Expo Router:**
```typescript
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({ id: '123' }),
}));
```

## 4. Writing Maestro E2E Flows

Maestro E2E flows are written in YAML. They run against the compiled `.apk` on an emulator. Do not write JS/TS for Maestro.
Example `apps/mobile/e2e/login-flow.yaml`:
docs/role-password.md file has all passwords & users. use it.

```yaml
appId: com.brokeros.mobile
---
- launchApp
- tapOn: "Email Address"
- inputText: "[EMAIL_ADDRESS]"
- tapOn: "Password"
- inputText: "Demo@1234"
- tapOn: "Sign In"
- assertVisible: "Admin Dashboard"
```

## 5. Execution

- **Run Unit Tests (from repo root):**
  ```bash
  pnpm --filter @brokeros/mobile test
  ```
- **Run Maestro E2E Tests (Requires Android Emulator running):**
  ```bash
  maestro test apps/mobile/e2e/login-flow.yaml
  ```
