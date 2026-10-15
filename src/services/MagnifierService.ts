import { voiceService } from './VoiceService';

export type ContrastFilterMode = 'normal' | 'yellow_on_black' | 'inverted_high_contrast';

export class MagnifierService {
  private static instance: MagnifierService;
  private currentZoom: number = 1;
  private listeners: Set<(zoom: number) => void> = new Set();
  private freezeToggleListeners: Set<() => void> = new Set();

  private constructor() {}

  public triggerFreezeToggle(): void {
    this.freezeToggleListeners.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.warn('Error in freeze toggle listener:', err);
      }
    });
  }

  public addFreezeToggleListener(listener: () => void): () => void {
    this.freezeToggleListeners.add(listener);
    return () => {
      this.freezeToggleListeners.delete(listener);
    };
  }

  public static getInstance(): MagnifierService {
    if (!MagnifierService.instance) {
      MagnifierService.instance = new MagnifierService();
    }
    return MagnifierService.instance;
  }

  public getZoom(): number {
    return this.currentZoom;
  }

  public setZoom(level: number): void {
    const clamped = Math.max(1, Math.min(5, level));
    this.currentZoom = clamped;
    this.listeners.forEach(cb => cb(clamped));
  }

  public async increaseZoom(): Promise<number> {
    if (this.currentZoom < 5) {
      this.setZoom(this.currentZoom + 1);
    }
    await this.announceZoom(this.currentZoom);
    return this.currentZoom;
  }

  public async decreaseZoom(): Promise<number> {
    if (this.currentZoom > 1) {
      this.setZoom(this.currentZoom - 1);
    }
    await this.announceZoom(this.currentZoom);
    return this.currentZoom;
  }

  public addListener(listener: (zoom: number) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentZoom);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async announceZoom(zoomLevel: number): Promise<void> {
    await voiceService.speak(`Aumento a ${zoomLevel} equis`);
  }

  public async announceFreeze(frozen: boolean): Promise<void> {
    if (frozen) {
      await voiceService.speak('Imagen pausada para que puedas leer con tranquilidad.');
    } else {
      await voiceService.speak('Cámara en vivo nuevamente.');
    }
  }

  public async announceFilter(filter: ContrastFilterMode): Promise<void> {
    if (filter === 'yellow_on_black') {
      await voiceService.speak('Filtro amarillo sobre negro activado para mayor nitidez.');
    } else if (filter === 'inverted_high_contrast') {
      await voiceService.speak('Modo alto contraste invertido activado.');
    } else {
      await voiceService.speak('Colores naturales normales.');
    }
  }
}

export const magnifierService = MagnifierService.getInstance();
