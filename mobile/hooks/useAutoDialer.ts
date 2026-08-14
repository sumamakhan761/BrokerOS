import { useState, useEffect, useCallback, useRef } from 'react';
import { PermissionsAndroid } from 'react-native';
import { dialNumber, addCallEndedListener, startListening, stopListening } from '../modules/auto-dialer';

export type DialerState = 'IDLE' | 'DIALING' | 'WAITING' | 'CANCELLED' | 'FINISHED';

export type DialerLead = {
  id: string;
  name: string;
  phone: string;
};

export function useAutoDialer() {
  const [queue, setQueue] = useState<DialerLead[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [dialerState, setDialerState] = useState<DialerState>('IDLE');
  const [countdown, setCountdown] = useState(0);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCancelledRef = useRef(false);
  const queueRef = useRef<DialerLead[]>([]);
  const currentIndexRef = useRef(-1);

  useEffect(() => {
    queueRef.current = queue;
    currentIndexRef.current = currentIndex;
  }, [queue, currentIndex]);

  const cancelDialer = useCallback(() => {
    isCancelledRef.current = true;
    setDialerState('CANCELLED');
    stopListening();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const dialNext = useCallback(() => {
    if (isCancelledRef.current) return;
    
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= queueRef.current.length) {
      setDialerState('FINISHED');
      stopListening();
      return;
    }

    setCurrentIndex(nextIndex);
    setDialerState('DIALING');
    
    const lead = queueRef.current[nextIndex];
    try {
      dialNumber(lead.phone);
    } catch (e) {
      console.error('Failed to dial', e);
      handleCallEnded();
    }
  }, []);

  const handleCallEnded = useCallback(() => {
    if (isCancelledRef.current) return;
    
    setDialerState('WAITING');
    setCountdown(3);

    let timeLeft = 3;
    timerRef.current = setInterval(() => {
      if (isCancelledRef.current) {
        clearInterval(timerRef.current!);
        return;
      }
      
      timeLeft -= 1;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(timerRef.current!);
        dialNext();
      }
    }, 1000);
  }, [dialNext]);

  useEffect(() => {
    const subscription = addCallEndedListener(() => {
      handleCallEnded();
    });

    return () => {
      subscription.remove();
    };
  }, [handleCallEnded]);

  const startDialer = useCallback(async (leadsToDial: DialerLead[]) => {
    if (leadsToDial.length === 0) return;
    
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      ]);
      
      if (
        granted[PermissionsAndroid.PERMISSIONS.CALL_PHONE] !== PermissionsAndroid.RESULTS.GRANTED ||
        granted[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.error('Permissions denied');
        return;
      }
      
      startListening();
      
      isCancelledRef.current = false;
      setQueue(leadsToDial);
      setCurrentIndex(-1); // Reset
      queueRef.current = leadsToDial;
      currentIndexRef.current = -1;
      
      dialNext();
    } catch (err) {
      console.warn(err);
    }
  }, [dialNext]);

  return {
    queue,
    currentIndex,
    currentLead: currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null,
    dialerState,
    countdown,
    startDialer,
    cancelDialer,
  };
}
