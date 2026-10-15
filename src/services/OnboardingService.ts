import { getDatabase } from '../storage/database';
import { contactRepository } from '../repositories/ContactRepository';
import { Contact } from '../models';
import { voiceService } from './VoiceService';

export class OnboardingService {
  private static instance: OnboardingService;
  private readonly SETTING_KEY = 'emergency_contact_configured';

  private constructor() {}

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  /**
   * Determina si el usuario ya configuró su contacto de emergencia en el primer inicio
   */
  public async isEmergencyConfigured(): Promise<boolean> {
    try {
      const db = await getDatabase();

      // Verificar si existe un contacto de emergencia real y válido en la base de datos
      const emergency = await contactRepository.getPrimaryEmergencyContact();
      const isMock = emergency && (
        emergency.id === 'contact-1' ||
        ['+573001234567', '+573109876543', '+573155554321'].includes(emergency.phoneNumber) ||
        emergency.name === 'María Gómez'
      );

      if (!emergency || isMock || !emergency.phoneNumber || emergency.phoneNumber.trim().length < 7) {
        // Si no hay un contacto de auxilio real, borrar cualquier marca previa y requerir configuración
        try {
          await db.runAsync('DELETE FROM app_settings WHERE key = ?', [this.SETTING_KEY]);
        } catch {}
        return false;
      }

      // Si existe un contacto de emergencia real válido, asegurar que la marca esté activa
      await this.markConfigured();
      return true;
    } catch (e) {
      console.warn('Error verificando estado de onboarding de emergencia:', e);
      return false;
    }
  }

  /**
   * Marca la configuración inicial de emergencia como completada
   */
  public async markConfigured(): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
        [this.SETTING_KEY, 'true']
      );
    } catch (e) {
      console.warn('Error guardando marca de configuración de emergencia:', e);
    }
  }

  /**
   * Guarda o actualiza el contacto de emergencia principal
   */
  public async saveEmergencyContact(
    name: string,
    phoneNumber: string,
    relationship: string = 'Familiar a cargo'
  ): Promise<Contact> {
    const db = await getDatabase();

    // 1. Quitar la marca de emergencia previa en otros contactos
    try {
      await db.runAsync('UPDATE contacts SET is_emergency_contact = 0');
    } catch {}

    // 2. Guardar el nuevo contacto en el repositorio
    const newContact = await contactRepository.addContact({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      relationship: relationship.trim(),
      isEmergencyContact: true,
    });

    // 3. Marcar onboarding como completado
    await this.markConfigured();

    // 4. Confirmación auditiva amigable para el adulto mayor
    await voiceService.speak(
      `Contacto de auxilio configurado con éxito. Si necesitas ayuda, llamaremos a ${newContact.name}.`,
      true
    );

    return newContact;
  }
}

export const onboardingService = OnboardingService.getInstance();
