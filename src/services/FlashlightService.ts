import { FlashlightModule } from '../native/FlashlightModule';
import { voiceService } from './VoiceService';

export class FlashlightService {
  private static instance: FlashlightService;
  private isOn: boolean = false;
  private listeners: Set<(isOn: boolean) => void> = new Set();

  private constructor() {}

  public static getInstance(): FlashlightService {
    if (!FlashlightService.instance) {
      FlashlightService.instance = new FlashlightService();
    }
    return FlashlightService.instance;
  }

  public addListener(cb: (isOn: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public async getStatus(): Promise<boolean> {
    return this.isOn;
  }

  public async turnOn(): Promise<boolean> {
    this.isOn = true;
    this.listeners.forEach(cb => cb(true));
    await FlashlightModule.setTorchModeAsync(true);
    await voiceService.speak('Linterna encendida');
    return true;
  }

  public async turnOff(): Promise<boolean> {
    this.isOn = false;
    this.listeners.forEach(cb => cb(false));
    await FlashlightModule.setTorchModeAsync(false);
    await voiceService.speak('Linterna apagada');
    return false;
  }

  public async toggle(): Promise<boolean> {
    if (this.isOn) {
      return this.turnOff();
    } else {
      return this.turnOn();
    }
  }
}

export const flashlightService = FlashlightService.getInstance();
