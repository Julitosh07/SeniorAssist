import { Platform, NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

const { SeniorSpeechModule: NativeModule } = NativeModules;

export interface ISpeechResultEvent {
  text: string;
  isFinal: boolean;
}

class SeniorSpeechModuleImpl {
  private eventEmitter: NativeEventEmitter | null = null;

  constructor() {
    if (Platform.OS === 'android' && NativeModule) {
      this.eventEmitter = new NativeEventEmitter(NativeModule);
    }
  }

  isAvailable(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModule?.isAvailable) {
      return NativeModule.isAvailable();
    }
    return Promise.resolve(false);
  }

  startListening(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModule?.startListening) {
      return NativeModule.startListening();
    }
    return Promise.resolve(false);
  }

  stopListening(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModule?.stopListening) {
      return NativeModule.stopListening();
    }
    return Promise.resolve(false);
  }

  cancelListening(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModule?.cancelListening) {
      return NativeModule.cancelListening();
    }
    return Promise.resolve(false);
  }

  playSystemAlarm(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModule?.playSystemAlarm) {
      return NativeModule.playSystemAlarm();
    }
    return Promise.resolve(false);
  }

  stopSystemAlarm(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModule?.stopSystemAlarm) {
      return NativeModule.stopSystemAlarm();
    }
    return Promise.resolve(false);
  }

  destroy(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModule?.destroy) {
      return NativeModule.destroy();
    }
    return Promise.resolve(false);
  }

  directPhoneCall(phoneNumber: string): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModule?.directPhoneCall) {
      return NativeModule.directPhoneCall(phoneNumber);
    }
    return Promise.resolve(false);
  }

  onResult(callback: (data: ISpeechResultEvent) => void): EmitterSubscription | null {
    if (!this.eventEmitter) return null;
    return this.eventEmitter.addListener('onSpeechResult', callback);
  }

  onPartialResult(callback: (data: ISpeechResultEvent) => void): EmitterSubscription | null {
    if (!this.eventEmitter) return null;
    return this.eventEmitter.addListener('onSpeechPartialResult', callback);
  }

  onError(callback: (errorMsg: string) => void): EmitterSubscription | null {
    if (!this.eventEmitter) return null;
    return this.eventEmitter.addListener('onSpeechError', callback);
  }

  onEnd(callback: () => void): EmitterSubscription | null {
    if (!this.eventEmitter) return null;
    return this.eventEmitter.addListener('onSpeechEnd', callback);
  }
}

export const SeniorSpeechModule = new SeniorSpeechModuleImpl();
