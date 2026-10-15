import { Linking, Platform } from 'react-native';
import { contactRepository } from '../repositories/ContactRepository';
import { gpsService, LocationCoordinates } from './GPSService';
import { voiceService } from './VoiceService';
import { Contact } from '../models';

export interface SOSEventDetails {
  contact: Contact | null;
  location: LocationCoordinates;
  smsSent: boolean;
  callInitiated: boolean;
}

export class SOSService {
  private static instance: SOSService;

  private constructor() {}

  public static getInstance(): SOSService {
    if (!SOSService.instance) {
      SOSService.instance = new SOSService();
    }
    return SOSService.instance;
  }

  /**
   * Ejecuta el protocolo completo de auxilio de emergencia (RF04)
   */
  public async triggerEmergencyProtocol(): Promise<SOSEventDetails> {
    await voiceService.speak('Activando protocolo de auxilio. Obteniendo tu ubicación satelital.');

    // 1. Obtener ubicación GPS
    const location = await gpsService.getCurrentLocation();

    // 2. Obtener contacto de emergencia
    const emergencyContact = await contactRepository.getPrimaryEmergencyContact();
    const phoneNumber = emergencyContact ? emergencyContact.phoneNumber : '123';
    const contactName = emergencyContact ? emergencyContact.name : 'Línea de Emergencias';

    // 3. Preparar mensaje de socorro con enlace a Google Maps
    const sosMessage = `¡AUXILIO! Necesito ayuda urgente. Mi ubicación actual es: ${location.mapsUrl}`;
    const encodedBody = encodeURIComponent(sosMessage);
    const smsUrl = `sms:${phoneNumber}?body=${encodedBody}`;

    let smsSuccess = false;
    let callSuccess = false;

    // 4. Enviar SMS
    try {
      await Linking.openURL(smsUrl);
      smsSuccess = true;
    } catch (err) {
      console.warn('Error al preparar SMS de emergencia:', err);
    }

    // 5. Locución de tranquilidad
    await voiceService.speak(`Mensaje de socorro enviado a ${contactName}. Llamando ahora mismo.`);

    // 6. Discar llamada telefónica directa
    const callUrl = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`;
    try {
      if (Platform.OS !== 'web') {
        await Linking.openURL(callUrl);
      }
      callSuccess = true;
    } catch (err) {
      console.warn('Error al iniciar llamada de emergencia:', err);
    }

    return {
      contact: emergencyContact,
      location,
      smsSent: smsSuccess,
      callInitiated: callSuccess,
    };
  }
}

export const sosService = SOSService.getInstance();
