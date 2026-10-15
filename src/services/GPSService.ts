export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  mapsUrl: string;
}

export class GPSService {
  private static instance: GPSService;

  private constructor() {}

  public static getInstance(): GPSService {
    if (!GPSService.instance) {
      GPSService.instance = new GPSService();
    }
    return GPSService.instance;
  }

  /**
   * Obtiene la posición GPS actual del usuario
   */
  public async getCurrentLocation(): Promise<LocationCoordinates> {
    // Intentar geolocalización del navegador / dispositivo
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            resolve({
              latitude: lat,
              longitude: lng,
              mapsUrl: `https://maps.google.com/?q=${lat},${lng}`,
            });
          },
          () => {
            // Coordenadas de contingencia (Bucaramanga, Colombia - UTS)
            resolve(this.getFallbackLocation());
          },
          { timeout: 8000, enableHighAccuracy: true }
        );
      });
    }

    return this.getFallbackLocation();
  }

  private getFallbackLocation(): LocationCoordinates {
    const lat = 7.1193; // Bucaramanga
    const lng = -73.1227;
    return {
      latitude: lat,
      longitude: lng,
      mapsUrl: `https://maps.google.com/?q=${lat},${lng}`,
    };
  }
}

export const gpsService = GPSService.getInstance();
