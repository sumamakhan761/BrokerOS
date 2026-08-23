import { requireNativeModule, EventEmitter, EventSubscription } from 'expo-modules-core';

type AutoDialerEvents = {
  onCallEnded: (event: any) => void;
  onCallStarted: (event: any) => void;
};

export const AutoDialerModule = requireNativeModule('AutoDialer');
const emitter = new EventEmitter<AutoDialerEvents>(AutoDialerModule ?? {} as any);

export function dialNumber(phoneNumber: string): void {
  return AutoDialerModule.dialNumber(phoneNumber);
}

export function startListening(): void {
  return AutoDialerModule.startListening();
}

export function stopListening(): void {
  return AutoDialerModule.stopListening();
}

export function addCallEndedListener(listener: (event: any) => void): EventSubscription {
  return emitter.addListener('onCallEnded', listener);
}

export function addCallStartedListener(listener: (event: any) => void): EventSubscription {
  return emitter.addListener('onCallStarted', listener);
}

export function setODialerFolder(folderUriString: string): void {
  return AutoDialerModule.setODialerFolder(folderUriString);
}

export function setAuthTokenForBackground(token: string, apiUrl: string): void {
  return AutoDialerModule.setAuthTokenForBackground(token, apiUrl);
}
