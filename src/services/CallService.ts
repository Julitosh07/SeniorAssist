import { Linking, Platform, PermissionsAndroid } from 'react-native';
import { contactRepository } from '../repositories/ContactRepository';
import { voiceService } from './VoiceService';
import { deviceContactsService } from './DeviceContactsService';
import { SeniorSpeechModule } from '../native/SeniorSpeechModule';
import { Contact } from '../models';

export interface CallResult {
  success: boolean;
  message: string;
  contact?: Contact;
  multipleMatches?: boolean;
  matches?: Contact[];
}

export class CallService {
  private static instance: CallService;

  private constructor() {}

  public static getInstance(): CallService {
    if (!CallService.instance) {
      CallService.instance = new CallService();
    }
    return CallService.instance;
  }

  /**
   * Realiza una llamada telefónica directa marcando de una vez sin pasar por el botón del teclado
   */
  public async makeCall(phoneNumber: string, contactName?: string, skipSpeech?: boolean): Promise<boolean> {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');

    // Hablar confirmación breve si no fue anunciada previamente
    if (!skipSpeech) {
      if (contactName) {
        voiceService.speak(`Marcando a ${contactName}...`);
      } else {
        voiceService.speak('Marcando llamada...');
      }
    }

    // 1. Android Nativo: Marcar directamente con Intent.ACTION_CALL (sin botón verde)
    if (Platform.OS === 'android') {
      try {
        const hasCallPerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
        if (!hasCallPerm) {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CALL_PHONE, {
            title: 'Permiso de Llamadas',
            message: 'SeniorAssist necesita permiso para marcar tus llamadas directamente sin pasar por el teclado.',
            buttonPositive: 'Permitir',
          });
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            await Linking.openURL(`tel:${cleanNumber}`);
            return true;
          }
        }

        const directSuccess = await SeniorSpeechModule.directPhoneCall(cleanNumber);
        if (directSuccess) {
          return true;
        }
      } catch (err) {
        console.warn('Error en directPhoneCall nativo, usando fallback:', err);
      }
    }

    try {
      // Fallback estándar
      await Linking.openURL(`tel:${cleanNumber}`);
      return true;
    } catch (error) {
      console.warn('Error al iniciar llamada:', error);
      await voiceService.speak('Ocurrió un inconveniente al intentar llamar.');
      return false;
    }
  }

  /**
   * Busca el contacto por nombre o parentesco (primero en la agenda del teléfono y luego en SQLite)
   */
  public async callByNameOrRelation(query: string): Promise<CallResult> {
    // 1. Intentar buscar en la agenda real del dispositivo
    try {
      const deviceMatches = await deviceContactsService.searchContacts(query);
      if (deviceMatches.length === 1) {
        const target = deviceMatches[0];
        await voiceService.speak(`Llamando a ${target.name}...`);
        const callSuccess = await this.makeCall(target.phoneNumber, target.name, true);
        return {
          success: callSuccess,
          message: `Llamando a ${target.name} (${target.phoneNumber})`,
          contact: {
            id: target.id,
            name: target.name,
            phoneNumber: target.phoneNumber,
            isEmergencyContact: false,
            createdAt: new Date().toISOString(),
          },
        };
      } else if (deviceMatches.length > 1) {
        const names = deviceMatches.map(m => m.name).slice(0, 3).join(' o ');
        const clarifyMsg = `Encontré varios contactos llamados ${query}: ${names}. ¿A cuál deseas llamar?`;
        await voiceService.speak(clarifyMsg);
        return {
          success: false,
          message: clarifyMsg,
          multipleMatches: true,
          matches: deviceMatches.map(m => ({
            id: m.id,
            name: m.name,
            phoneNumber: m.phoneNumber,
            isEmergencyContact: false,
            createdAt: new Date().toISOString(),
          })),
        };
      }
    } catch (e) {
      console.warn('Error consultando contactos nativos:', e);
    }

    // 2. Si no se encontró en el dispositivo, buscar en la base de datos local SQLite
    let matches = await contactRepository.findByNameOrRelation(query);

    if (matches.length === 0) {
      const notFoundMsg = `No encontré a "${query}" en tus contactos.`;
      await voiceService.speak(notFoundMsg);
      return { success: false, message: notFoundMsg };
    }

    // Si existen múltiples coincidencias en SQLite, priorizar coincidencia exacta
    if (matches.length > 1) {
      const normQ = deviceContactsService.normalize(query);
      const exactSqlite = matches.filter(m => 
        deviceContactsService.normalize(m.name) === normQ ||
        (m.relationship && deviceContactsService.normalize(m.relationship) === normQ)
      );
      if (exactSqlite.length === 1) {
        matches = exactSqlite;
      }
    }

    if (matches.length > 1) {
      const names = matches.map(m => m.name).join(' o ');
      const clarifyMsg = `Encontré varios contactos coincidentes: ${names}. ¿A cuál de ellos deseas llamar?`;
      await voiceService.speak(clarifyMsg);
      return {
        success: false,
        message: clarifyMsg,
        multipleMatches: true,
        matches,
      };
    }

    const target = matches[0];
    const relationLabel = target.relationship ? `tu ${target.relationship} ` : '';
    await voiceService.speak(`Llamando a ${relationLabel}${target.name}.`);

    const callSuccess = await this.makeCall(target.phoneNumber, target.name, true);
    return {
      success: callSuccess,
      message: `Llamando a ${target.name} (${target.phoneNumber})`,
      contact: target,
    };
  }
}

export const callService = CallService.getInstance();
