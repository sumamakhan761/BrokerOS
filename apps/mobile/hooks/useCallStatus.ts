import { useEffect } from 'react';
import { authClient } from '../lib/auth-client';
import { addCallStartedListener, addCallEndedListener } from '../modules/auto-dialer';

/**
 * useCallStatus
 *
 * Mount this hook at the root dashboard layout so it is always active.
 *
 * It listens to the native AutoDialer events (which fire for BOTH the
 * in-app auto-dialer AND native phone dialer calls) and syncs the
 * employee's on-call status to the backend in real time.
 *
 * - onCallStarted → POST /api/call-status { isOnCall: true }
 * - onCallEnded   → POST /api/call-status { isOnCall: false }
 *
 * The backend stores this on User.isOnCall, which the manager's
 * employee-cards endpoint returns, allowing the manager to see a
 * green/yellow dot on each employee card (updated every 15 seconds).
 */
export function useCallStatus() {
  const baseURL = process.env.EXPO_PUBLIC_API_URL as string;

  useEffect(() => {
    const setStatus = async (isOnCall: boolean) => {
      try {
        await authClient.$fetch('/api/call-status', {
          baseURL,
          method: 'POST',
          body: { isOnCall },
        });
      } catch (e) {
        // Silently fail — status sync is best-effort
        console.warn('[useCallStatus] Failed to sync call status:', e);
      }
    };

    // Explicitly reset status on mount to clear any stuck state from previous sessions/crashes
    setStatus(false);

    const startSub = addCallStartedListener(() => {
      setStatus(true);
    });

    const endSub = addCallEndedListener(() => {
      setStatus(false);
    });

    return () => {
      startSub.remove();
      endSub.remove();
      // Ensure we clear the status when leaving the dashboard
      setStatus(false);
    };
  }, [baseURL]);
}
