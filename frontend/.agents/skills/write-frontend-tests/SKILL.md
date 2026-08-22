---
name: write-frontend-tests
description: "Use this skill whenever the user asks to write, update, or manage tests for the Next.js frontend. Enforces the hybrid testing strategy (co-located component tests, centralized E2E tests) using Vitest and Playwright."
---

# Write Frontend Tests

Whenever you are tasked with creating or modifying tests in the BrokerOS Next.js frontend, you MUST follow this strict structural guide.

## 1. Testing Layers & Tooling
The frontend requires different tools for different testing layers:
- **Unit Tests (`Vitest`)**: Use for testing pure functions, calculations, or isolated custom hooks (e.g., date formatting in `lib/`).
- **Client Component Tests (`Vitest` + `React Testing Library`)**: Use for testing React Client Components (files with `"use client"`). Test that modals open, form validation works, and button clicks trigger the right functions.
- **Server Component Tests (`Playwright`)**: React Server Components are notoriously difficult to unit-test because they fetch data server-side. Do not try to test them with Vitest. Rely on E2E browser tests to verify Server Components render correctly.
- **E2E Tests (`Playwright`)**: Use for testing full browser journeys across multiple pages, including hitting your backend.

## 2. File Organization Strategy (Hybrid Approach)

### Unit & Component Tests -> Co-location
You MUST co-locate component and unit tests directly next to the file they are testing. Do not put them in a separate folder.
- **Source:** `frontend/features/leads/LeadCard.tsx`
- **Test:** `frontend/features/leads/LeadCard.test.tsx`

### E2E Tests -> Centralized
Playwright E2E tests must be kept completely separate from the UI source code.
- **Location:** `frontend/e2e/`
- **Example:** `frontend/e2e/dashboard-flow.spec.ts`

## 3. Mocking Next.js App Router
When writing Component Tests with React Testing Library, you often need to render components that rely on the Next.js App Router (like `useRouter`, `usePathname`, or `Link`).
You must use `next-router-mock` or explicitly mock `next/navigation` at the top of your test file:

```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));
```

## 4. Mocking Better Auth
Many UI components require an authenticated session to render correctly. When writing Component Tests, mock the Better Auth client hook:

```typescript
vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: { user: { id: '1', name: 'Test User', role: 'ADMIN' } },
    isPending: false,
    error: null
  })
}));
```

For **Playwright E2E Tests**, do not mock the hook. Instead, write a global setup script or a `beforeEach` hook that uses the Playwright `request` context to hit the real backend `/api/auth/sign-in/email` endpoint to get a session cookie, injecting it into the browser context.

## 5. Execution
- **Run Unit/Component Tests:**
  ```bash
  pnpm test
  ```
- **Run E2E Tests:**
  ```bash
  pnpm test:e2e
  ```
