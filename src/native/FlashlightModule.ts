import { Platform, NativeModules } from 'react-native';

export interface IFlashlightModule {
  isAvailableAsync(): Promise<boolean>;
  setTorchModeAsync(enabled: boolean): Promise<boolean>;
  getTorchModeAsync(): Promise<boolean>;
}

class FlashlightModuleImpl implements IFlashlightModule {
  private isTorchOn: boolean = false;

  async isAvailableAsync(): Promise<boolean> {
    // Si existe un módulo nativo custom vinculado en Android
    if (NativeModules.FlashlightModule && NativeModules.FlashlightModule.isAvailable) {
      return NativeModules.FlashlightModule.isAvailable();
    }
    // En dispositivos móviles estándar la linterna está disponible
    return true;
  }

  async setTorchModeAsync(enabled: boolean): Promise<boolean> {
    this.isTorchOn = enabled;
    if (Platform.OS === 'android' && NativeModules.FlashlightModule && NativeModules.FlashlightModule.setTorchMode) {
      try {
        const result = await NativeModules.FlashlightModule.setTorchMode(enabled);
        this.isTorchOn = result;
        return result;
      } catch (e) {
        console.warn('Error al activar LED físico:', e);
      }
    }
    return this.isTorchOn;
  }

  async getTorchModeAsync(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModules.FlashlightModule && NativeModules.FlashlightModule.getTorchMode) {
      try {
        return await NativeModules.FlashlightModule.getTorchMode();
      } catch {}
    }
    return this.isTorchOn;
  }
}

export const FlashlightModule: IFlashlightModule = new FlashlightModuleImpl();
