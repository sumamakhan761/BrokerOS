import { requireOptionalNativeModule, requireNativeModule } from 'expo-modules-core';

export interface EventSubscription {
  remove(): void;
}

let AutoDialerModule: any = null;
try {
  if (typeof requireOptionalNativeModule === 'function') {
    AutoDialerModule = requireOptionalNativeModule('AutoDialer');
  } else {
    AutoDialerModule = requireNativeModule('AutoDialer');
  }
} catch {
  AutoDialerModule = null;
}

export { AutoDialerModule };

const dummySubscription: EventSubscription = {
  remove: () => {},
};

export function dialNumber(phoneNumber: string): void {
  try {
    return AutoDialerModule?.dialNumber?.(phoneNumber);
  } catch (e) {
    console.warn('[AutoDialer] dialNumber unavailable:', e);
  }
}

export function startListening(): void {
  try {
    return AutoDialerModule?.startListening?.();
  } catch (e) {
    console.warn('[AutoDialer] startListening unavailable:', e);
  }
}

export function stopListening(): void {
  try {
    return AutoDialerModule?.stopListening?.();
  } catch (e) {
    console.warn('[AutoDialer] stopListening unavailable:', e);
  }
}

export function addCallEndedListener(listener: (event: any) => void): EventSubscription {
  if (!AutoDialerModule || typeof AutoDialerModule.addListener !== 'function') {
    return dummySubscription;
  }
  try {
    return AutoDialerModule.addListener('onCallEnded', listener) ?? dummySubscription;
  } catch {
    return dummySubscription;
  }
}

export function addCallStartedListener(listener: (event: any) => void): EventSubscription {
  if (!AutoDialerModule || typeof AutoDialerModule.addListener !== 'function') {
    return dummySubscription;
  }
  try {
    return AutoDialerModule.addListener('onCallStarted', listener) ?? dummySubscription;
  } catch {
    return dummySubscription;
  }
}

export function setODialerFolder(folderUriString: string): void {
  try {
    return AutoDialerModule?.setODialerFolder?.(folderUriString);
  } catch (e) {
    console.warn('[AutoDialer] setODialerFolder unavailable:', e);
  }
}

export function setAuthTokenForBackground(token: string, apiUrl: string): void {
  try {
    return AutoDialerModule?.setAuthTokenForBackground?.(token, apiUrl);
  } catch (e) {
    console.warn('[AutoDialer] setAuthTokenForBackground unavailable:', e);
  }
}


