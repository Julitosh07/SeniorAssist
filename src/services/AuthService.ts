import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'senior_assist_device_uuid';
const TOKEN_KEY = 'senior_assist_jwt_token';
const BACKEND_URL = 'http://localhost:8000';

export class AuthService {
  private static instance: AuthService;
  private currentToken: string | null = null;
  private deviceId: string | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Obtiene o genera el UUID persistente único del dispositivo
   */
  public async getDeviceId(): Promise<string> {
    if (this.deviceId) return this.deviceId;

    try {
      let storedId: string | null = null;
      if (Platform.OS === 'web') {
        storedId = typeof window !== 'undefined' ? window.localStorage.getItem(DEVICE_ID_KEY) : null;
      } else {
        storedId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      }

      if (!storedId) {
        // Generar identificador de hardware / instalación único
        storedId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') window.localStorage.setItem(DEVICE_ID_KEY, storedId);
        } else {
          await SecureStore.setItemAsync(DEVICE_ID_KEY, storedId);
        }
      }

      this.deviceId = storedId;
      return storedId;
    } catch {
      const fallbackId = `device-${Date.now()}`;
      this.deviceId = fallbackId;
      return fallbackId;
    }
  }

  /**
   * Obtiene un token JWT válido de forma 100% transparente para el adulto mayor
   */
  public async getValidToken(): Promise<string> {
    if (this.currentToken) return this.currentToken;

    try {
      // Intentar leer token guardado
      let savedToken: string | null = null;
      if (Platform.OS === 'web') {
        savedToken = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
      } else {
        savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      }

      if (savedToken) {
        this.currentToken = savedToken;
        return savedToken;
      }

      // Si no existe, solicitar nuevo token al backend mediante POST /auth/device
      const devId = await this.getDeviceId();
      const response = await fetch(`${BACKEND_URL}/auth/device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: devId,
          app_version: '1.0.0',
          platform: Platform.OS,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        this.currentToken = newToken;

        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') window.localStorage.setItem(TOKEN_KEY, newToken);
        } else {
          await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        }

        return newToken;
      }
    } catch (err) {
      console.warn('Backend offline o inaccesible, operando con sesión local transparente:', err);
    }

    // Fallback de contingencia local si el backend está desconectado
    const offlineToken = `offline-jwt-${await this.getDeviceId()}`;
    this.currentToken = offlineToken;
    return offlineToken;
  }

  /**
   * Genera el encabezado Authorization con Bearer token
   */
  public async getAuthHeader(): Promise<Record<string, string>> {
    const token = await this.getValidToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}

export const authService = AuthService.getInstance();
