import { Linking } from 'react-native';
import { contactRepository } from '../repositories/ContactRepository';
import { voiceService } from './VoiceService';
import { deviceContactsService } from './DeviceContactsService';
import { Contact } from '../models';

export interface WhatsAppPreparationResult {
  success: boolean;
  message: string;
  contact?: Contact;
  whatsappUrl?: string;
  multipleMatches?: boolean;
  matches?: Contact[];
}

/**
 * Normaliza y da formato E.164 al número telefónico para WhatsApp.
 * Si el número tiene 10 dígitos (estándar móvil colombiano e internacional local),
 * le antepone el código de país (por defecto 57 para Colombia).
 */
export function formatPhoneForWhatsApp(phoneNumber: string, defaultCountryCode: string = '57'): string {
  if (!phoneNumber) return '';
  const trimmed = phoneNumber.trim();
  const hadPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) return '';

  // Si ya tenía el signo +, se respeta el código internacional ya guardado
  if (hadPlus) {
    return digits;
  }

  // Si empieza por 00 (código de salida internacional, ej. 0057300...)
  if (digits.startsWith('00')) {
    return digits.substring(2);
  }

  // Si ya empieza por 57 y tiene 12 dígitos (57 + 10 dígitos colombianos)
  if (digits.startsWith('57') && digits.length === 12) {
    return digits;
  }

  // En Colombia, números móviles tienen 10 dígitos (ej. 3001234567) o fijos locales
  if (digits.length === 10) {
    return `${defaultCountryCode}${digits}`;
  }

  // Si tiene menos de 10 dígitos
  if (digits.length < 10) {
    return `${defaultCountryCode}${digits}`;
  }

  return digits;
}

export class WhatsAppService {
  private static instance: WhatsAppService;

  private constructor() {}

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /**
   * Abre WhatsApp directamente a un número determinado
   */
  public async openWhatsAppToNumber(phoneNumber: string, name: string, messageText: string = 'Hola, te escribo con SeniorAssist'): Promise<boolean> {
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    const encodedText = encodeURIComponent(messageText);
    const nativeSchemeUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedText}`;
    const webUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;

    voiceService.speak(`Abriendo WhatsApp para ${name}.`);

    try {
      const canOpenNative = await Linking.canOpenURL(nativeSchemeUrl);
      if (canOpenNative) {
        await Linking.openURL(nativeSchemeUrl);
      } else {
        await Linking.openURL(webUrl);
      }
      return true;
    } catch {
      try {
        await Linking.openURL(webUrl);
        return true;
      } catch {
        const errorMsg = 'No pudimos abrir WhatsApp. Asegúrate de tenerlo instalado.';
        await voiceService.speak(errorMsg);
        return false;
      }
    }
  }

  /**
   * Prepara y abre WhatsApp con el mensaje precargado para confirmación del usuario
   */
  public async prepareMessage(recipientQuery: string, messageText: string): Promise<WhatsAppPreparationResult> {
    const openWhatsAppDirectly = async (phone: string, name: string) => {
      const formattedPhone = formatPhoneForWhatsApp(phone);
      const encodedText = encodeURIComponent(messageText);
      const nativeSchemeUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedText}`;
      const webUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;

      // Confirmar por voz sin bloquear la apertura
      voiceService.speak(`Abriendo WhatsApp para ${name}.`);

      try {
        const canOpenNative = await Linking.canOpenURL(nativeSchemeUrl);
        if (canOpenNative) {
          await Linking.openURL(nativeSchemeUrl);
        } else {
          await Linking.openURL(webUrl);
        }
        return true;
      } catch {
        try {
          await Linking.openURL(webUrl);
          return true;
        } catch {
          const errorMsg = 'No pudimos abrir WhatsApp en tu dispositivo. Asegúrate de tener WhatsApp instalado.';
          await voiceService.speak(errorMsg);
          return false;
        }
      }
    };

    // 1. Intentar buscar en la agenda del teléfono
    try {
      let deviceMatches = await deviceContactsService.searchContacts(recipientQuery);
      if (deviceMatches.length === 0) {
        const stripped = recipientQuery.replace(/^(hija|hijo|mama|mamá|papa|papá|abuela|abuelo|tio|tío|tia|tía|primo|prima|amigo|amiga|esposo|esposa)\s+/i, '').trim();
        if (stripped && stripped.toLowerCase() !== recipientQuery.toLowerCase()) {
          deviceMatches = await deviceContactsService.searchContacts(stripped);
        }
      }

      if (deviceMatches.length === 1) {
        const devContact = deviceMatches[0];
        const success = await openWhatsAppDirectly(devContact.phoneNumber, devContact.name);
        return {
          success,
          message: `Mensaje preparado para ${devContact.name}`,
          contact: {
            id: devContact.id,
            name: devContact.name,
            phoneNumber: devContact.phoneNumber,
            isEmergencyContact: false,
            createdAt: new Date().toISOString(),
          },
        };
      } else if (deviceMatches.length > 1) {
        const names = deviceMatches.map(c => c.name).slice(0, 3).join(' o ');
        const clarify = `Encontré varios contactos llamados ${recipientQuery}: ${names}. ¿A cuál de ellos deseas escribirle?`;
        await voiceService.speak(clarify);
        return {
          success: false,
          message: clarify,
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
      console.warn('Error buscando en contactos nativos para WhatsApp:', e);
    }

    // 2. Fallback a la base de datos local SQLite
    let contacts = await contactRepository.findByNameOrRelation(recipientQuery);
    if (contacts.length === 0) {
      const stripped = recipientQuery.replace(/^(hija|hijo|mama|mamá|papa|papá|abuela|abuelo|tio|tío|tia|tía|primo|prima|amigo|amiga|esposo|esposa)\s+/i, '').trim();
      if (stripped && stripped.toLowerCase() !== recipientQuery.toLowerCase()) {
        contacts = await contactRepository.findByNameOrRelation(stripped);
      }
    }

    if (contacts.length === 0) {
      const notFound = `No encontré el contacto "${recipientQuery}" para escribir por WhatsApp.`;
      await voiceService.speak(notFound);
      return { success: false, message: notFound };
    }

    if (contacts.length > 1) {
      const normQ = deviceContactsService.normalize(recipientQuery);
      const exactSqlite = contacts.filter(c => 
        deviceContactsService.normalize(c.name) === normQ ||
        (c.relationship && deviceContactsService.normalize(c.relationship) === normQ)
      );
      if (exactSqlite.length === 1) {
        contacts = exactSqlite;
      }
    }

    if (contacts.length > 1) {
      const names = contacts.map(c => c.name).join(' o ');
      const clarify = `Encontré varios contactos: ${names}. ¿A cuál de ellos deseas escribirle?`;
      await voiceService.speak(clarify);
      return {
        success: false,
        message: clarify,
        multipleMatches: true,
        matches: contacts,
      };
    }

    const contact = contacts[0];
    const success = await openWhatsAppDirectly(contact.phoneNumber, contact.name);

    return {
      success,
      message: `Mensaje preparado para ${contact.name}`,
      contact,
    };
  }
}

export const whatsAppService = WhatsAppService.getInstance();
