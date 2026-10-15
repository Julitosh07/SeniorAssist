import * as Contacts from 'expo-contacts';
import { Platform, PermissionsAndroid } from 'react-native';

export interface SimpleDeviceContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship?: string;
  imageAvailable?: boolean;
}

export class DeviceContactsService {
  private static instance: DeviceContactsService;
  private cachedContacts: SimpleDeviceContact[] | null = null;
  private isFetching: boolean = false;

  private constructor() {}

  public static getInstance(): DeviceContactsService {
    if (!DeviceContactsService.instance) {
      DeviceContactsService.instance = new DeviceContactsService();
    }
    return DeviceContactsService.instance;
  }

  /**
   * Limpia la caché en memoria para forzar una nueva lectura
   */
  public clearCache(): void {
    this.cachedContacts = null;
  }

  /**
   * Solicita permisos explícitos para acceder a la agenda del teléfono
   */
  public async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    // 1. Android Nativo con PermissionsAndroid
    if (Platform.OS === 'android') {
      try {
        const hasPerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
        if (hasPerm) {
          return true;
        }

        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Permiso de Contactos',
            message: 'SeniorAssist necesita acceso a tus contactos para que puedas elegir a tu persona de auxilio y familiares.',
            buttonPositive: 'Permitir',
            buttonNegative: 'Cancelar',
          }
        );

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          try {
            await Contacts.requestPermissionsAsync();
          } catch {}
          return true;
        }
        return false;
      } catch (err) {
        console.warn('Error solicitando permisos con PermissionsAndroid:', err);
      }
    }

    // 2. Fallback estándar con Expo Contacts
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn('Error solicitando permisos de contactos expo:', err);
      return false;
    }
  }

  /**
   * Verifica si la app ya tiene permiso concedido
   */
  public async hasPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
        if (granted) return true;
      } catch {}
    }

    try {
      const { status } = await Contacts.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Normaliza texto para búsqueda fonética, insensible a mayúsculas y sin acentos en español
   */
  public normalize(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  /**
   * Obtiene todos los contactos del teléfono de forma rápida y segura con caché en memoria
   */
  public async getAllContacts(forceRefresh: boolean = false): Promise<SimpleDeviceContact[]> {
    if (Platform.OS === 'web') return [];

    // Si ya los tenemos en memoria y no se forzó refresco, responder al instante (0ms)
    if (!forceRefresh && this.cachedContacts && this.cachedContacts.length > 0) {
      return [...this.cachedContacts];
    }

    // Evitar llamadas concurrentes duplicadas
    if (this.isFetching) {
      // Esperar hasta 2.5s si ya hay una petición en curso
      for (let i = 0; i < 25; i++) {
        await new Promise(res => setTimeout(res, 100));
        if (this.cachedContacts) return [...this.cachedContacts];
      }
    }

    this.isFetching = true;

    try {
      const hasPerm = await this.requestPermission();
      if (!hasPerm) {
        this.isFetching = false;
        return [];
      }

      // Timeout de seguridad de 7 segundos para que nunca se quede cargando infinitamente
      const timeoutPromise = new Promise<{ data?: Contacts.Contact[] }>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de lectura de contactos')), 7000)
      );

      const queryPromise = Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Name,
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
        ],
        pageSize: 300,
        sort: Contacts.SortTypes.FirstName,
      });

      const response = await Promise.race([queryPromise, timeoutPromise]);
      const data = response?.data;

      if (!data || !Array.isArray(data)) {
        this.isFetching = false;
        return this.cachedContacts || [];
      }

      const validContacts: SimpleDeviceContact[] = [];
      const seenPhones = new Set<string>();

      for (const c of data) {
        if (c.phoneNumbers && c.phoneNumbers.length > 0) {
          // Obtener el primer número de teléfono
          const rawPhone = c.phoneNumbers[0]?.number || '';
          const cleanPhone = rawPhone.replace(/[^\d+]/g, '');

          // Evitar números vacíos o demasiado cortos (< 5 dígitos)
          if (cleanPhone.replace(/\D/g, '').length < 5) continue;

          const digitsOnly = cleanPhone.replace(/\D/g, '');
          if (seenPhones.has(digitsOnly)) continue;
          seenPhones.add(digitsOnly);

          const derivedName = (
            c.name ||
            `${c.firstName || ''} ${c.lastName || ''}`.trim() ||
            (c.phoneNumbers[0] as any).label ||
            'Contacto sin nombre'
          ).trim();

          validContacts.push({
            id: c.id || `${derivedName}-${digitsOnly}`,
            name: derivedName,
            phoneNumber: cleanPhone || rawPhone,
          });
        }
      }

      // Ordenar alfabéticamente de forma segura
      validContacts.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

      this.cachedContacts = validContacts;
      return [...validContacts];
    } catch (err) {
      console.warn('Error o timeout obteniendo contactos del dispositivo:', err);
      return this.cachedContacts || [];
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Busca contactos en la agenda que coincidan con un texto o nombre
   * Ejemplo: "carlos" encuentra "Carlos Gómez", "Carlos Tío", "José Carlos"
   */
  public async searchContacts(query: string): Promise<SimpleDeviceContact[]> {
    const normQuery = this.normalize(query);
    if (!normQuery) {
      return this.getAllContacts();
    }

    const all = await this.getAllContacts();
    if (all.length === 0) return [];

    const queryDigits = normQuery.replace(/\D/g, '');
    const tokens = normQuery.split(/\s+/).filter(t => t.length > 0);
    const strippedQuery = normQuery.replace(/^(?:mi\s+|el\s+|la\s+)/i, '').trim();

    // 1. Prioridad Máxima: Coincidencia EXACTA directa por nombre completo
    const exactMatches = all.filter(c => {
      const normName = this.normalize(c.name);
      return normName === normQuery || (strippedQuery && normName === strippedQuery);
    });
    if (exactMatches.length === 1) {
      return exactMatches;
    }

    // 2. Filtrado de candidatos
    const candidates = all.filter(c => {
      const normName = this.normalize(c.name);
      const cleanPhone = c.phoneNumber.replace(/\D/g, '');

      // Coincidencia por número
      if (queryDigits.length >= 3 && cleanPhone.includes(queryDigits)) {
        return true;
      }

      // Coincidencia por inclusión de frase
      if (normName.includes(normQuery) || (strippedQuery && normName.includes(strippedQuery))) {
        return true;
      }

      // Coincidencia por tokens
      if (tokens.length > 1 && tokens.every(tok => normName.includes(tok))) {
        return true;
      }

      // Coincidencia por inicio de palabra (ej: query "carlos" coincide con "carlos gómez")
      const nameWords = normName.split(/\s+/);
      return nameWords.some(w => w.startsWith(normQuery) || (strippedQuery && w.startsWith(strippedQuery)));
    });

    // Si entre los candidatos hay una única coincidencia exacta, devolverla
    const exactInCandidates = candidates.filter(c => {
      const normName = this.normalize(c.name);
      return normName === normQuery || (strippedQuery && normName === strippedQuery);
    });
    if (exactInCandidates.length === 1) {
      return exactInCandidates;
    }

    return candidates;
  }
}

export const deviceContactsService = DeviceContactsService.getInstance();
