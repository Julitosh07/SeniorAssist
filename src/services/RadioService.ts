import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { RadioStation, RadioPlaybackState } from '../models';
import { voiceService } from './VoiceService';

export const STATIONS: RadioStation[] = [
  {
    id: 'caracol',
    name: 'Caracol Radio',
    frequency: '100.9 FM',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CARACOL_RADIOAAC_SC',
    genre: 'Noticias y Deportes',
  },
  {
    id: 'nacional',
    name: 'Radio Nacional de Colombia',
    frequency: '92.9 FM',
    streamUrl: 'https://streaming.rtvc.gov.co/Radio_Radionacional/Radionacional.stream/playlist.m3u8',
    genre: 'Noticias, Cultura y Música Colombiana',
  },
  {
    id: 'rcn',
    name: 'RCN Radio',
    frequency: '93.9 FM',
    streamUrl: 'https://mdstrm.com/audio/632c9b89aa9ace684913b815/live.m3u8',
    genre: 'Opinión y Variedades',
  },
  {
    id: 'olimpica',
    name: 'Olímpica Stereo',
    frequency: '105.9 FM',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/OLP_BARRANQUILLAAAC.aac',
    genre: 'Música Tropical y Popular',
  },
  {
    id: 'besame',
    name: 'Bésame Radio',
    frequency: '94.9 FM',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/BESAME_MEDELLINAAC_SC',
    genre: 'Baladas y Romántica',
  },
  {
    id: 'blu',
    name: 'Blu Radio',
    frequency: '89.9 FM',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/BLURADIO.mp3',
    genre: 'Noticias y Música',
  },
];

type RadioListener = (state: {
  status: RadioPlaybackState;
  station: RadioStation;
  volume: number;
  errorMessage?: string;
}) => void;

export class RadioService {
  private static instance: RadioService;
  private currentStation: RadioStation = STATIONS[0];
  private status: RadioPlaybackState = 'stopped';
  private volume: number = 0.8; // 80% por defecto
  private listeners: Set<RadioListener> = new Set();

  // Instancias de audio
  private soundObject: Audio.Sound | null = null;
  private webAudioElement: any = null;

  private constructor() {}

  public static getInstance(): RadioService {
    if (!RadioService.instance) {
      RadioService.instance = new RadioService();
    }
    return RadioService.instance;
  }

  public getStations(): RadioStation[] {
    return [...STATIONS];
  }

  public getCurrentStation(): RadioStation {
    return this.currentStation;
  }

  public getStatus(): RadioPlaybackState {
    return this.status;
  }

  public getVolume(): number {
    return this.volume;
  }

  public addListener(listener: RadioListener): () => void {
    this.listeners.add(listener);
    // Notificar estado actual de inmediato
    listener({
      status: this.status,
      station: this.currentStation,
      volume: this.volume,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(errorMessage?: string) {
    this.listeners.forEach(listener =>
      listener({
        status: this.status,
        station: this.currentStation,
        volume: this.volume,
        errorMessage,
      })
    );
  }

  public isOnline(): boolean {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  }

  /**
   * Sintoniza y reproduce una emisora por ID o nombre
   */
  public async playStation(station: RadioStation): Promise<void> {
    if (!this.isOnline()) {
      this.status = 'error';
      const offlineMsg =
        'No tienes conexión a internet para reproducir la radio en vivo. Por favor revisa tu conexión Wi-Fi o datos móviles.';
      this.notify(offlineMsg);
      await voiceService.speak(offlineMsg);
      return;
    }

    this.currentStation = station;
    this.status = 'loading';
    this.notify();

    await voiceService.speak(`Sintonizando ${station.name}.`);

    try {
      await this.cleanupCurrentAudio();

      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.Audio !== 'undefined') {
        const audio = new window.Audio(station.streamUrl);
        audio.volume = this.volume;
        audio.autoplay = true;

        audio.onplaying = () => {
          this.status = 'playing';
          this.notify();
        };

        audio.onerror = () => {
          this.status = 'error';
          this.notify('La señal de la emisora no está respondiendo en este momento.');
        };

        audio.onpause = () => {
          if (this.status === 'playing') {
            this.status = 'paused';
            this.notify();
          }
        };

        audio.play().catch(err => {
          console.warn('Autoplay web bloqueado o error al reproducir:', err);
          this.status = 'paused';
          this.notify();
        });

        this.webAudioElement = audio;
      } else {
        // Nativo Android / iOS con expo-av con audio continuo nivelado
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const isHls = station.streamUrl.includes('.m3u8');
        const { sound } = await Audio.Sound.createAsync(
          {
            uri: station.streamUrl,
            overrideFileExtensionAndroid: isHls ? 'm3u8' : undefined,
          },
          {
            shouldPlay: true,
            volume: this.volume,
            progressUpdateIntervalMillis: 1000,
          },
          (playbackStatus) => {
            if (playbackStatus.isLoaded) {
              if (playbackStatus.isPlaying && this.status !== 'playing') {
                this.status = 'playing';
                this.notify();
              } else if (playbackStatus.isBuffering && this.status !== 'loading' && this.status !== 'playing') {
                this.status = 'loading';
                this.notify();
              }
            } else if (playbackStatus.error) {
              console.warn('Error en transmisión de radio:', playbackStatus.error);
            }
          }
        );

        this.soundObject = sound;
        this.status = 'playing';
        this.notify();
      }
    } catch (err) {
      console.warn('Error al sintonizar radio:', err);
      this.status = 'error';
      const errMsg = `No fue posible conectar con la señal de ${station.name}. Intenta nuevamente o elige otra emisora.`;
      this.notify(errMsg);
      voiceService.speak(errMsg);
    }
  }

  /**
   * Sintoniza buscando por texto natural (ej: "nacional", "caracol", "rcn")
   */
  public async playStationByName(nameQuery: string): Promise<void> {
    const q = nameQuery.toLowerCase().trim();
    let found = STATIONS.find(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));

    if (!found) {
      if (q.includes('caracol')) found = STATIONS.find(s => s.id === 'caracol');
      else if (q.includes('colombia') || q.includes('nacional')) found = STATIONS.find(s => s.id === 'nacional');
      else if (q.includes('rcn')) found = STATIONS.find(s => s.id === 'rcn');
      else if (q.includes('olimpica') || q.includes('olímpica')) found = STATIONS.find(s => s.id === 'olimpica');
      else if (q.includes('besame') || q.includes('bésame')) found = STATIONS.find(s => s.id === 'besame');
      else if (q.includes('blu')) found = STATIONS.find(s => s.id === 'blu');
      else found = this.currentStation;
    }

    await this.playStation(found || this.currentStation);
  }

  /**
   * Reanuda la reproducción si está pausada
   */
  public async play(): Promise<void> {
    if (this.status === 'playing') return;

    if (this.status === 'paused' && this.soundObject) {
      try {
        this.status = 'playing';
        this.notify();
        await this.soundObject.playAsync();
        voiceService.speak(`Reanudando ${this.currentStation.name}.`);
        return;
      } catch {
        // Si falla reanudar en stream vivo, reconectar
      }
    }

    await this.playStation(this.currentStation);
  }

  /**
   * Pausa la radio de inmediato sin bloqueos
   */
  public async pause(): Promise<void> {
    // Actualizar estado de inmediato para que la interfaz responda al toque
    this.status = 'paused';
    this.notify();

    try {
      if (this.webAudioElement) {
        this.webAudioElement.pause();
      } else if (this.soundObject) {
        try {
          await this.soundObject.pauseAsync();
        } catch {
          try {
            await this.soundObject.stopAsync();
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Error al pausar radio:', e);
    }

    voiceService.speak('Radio pausada.');
  }

  /**
   * Detiene por completo la radio de inmediato
   */
  public async stop(): Promise<void> {
    // Actualizar estado de inmediato para respuesta táctil instantánea
    this.status = 'stopped';
    this.notify();

    try {
      await this.cleanupCurrentAudio();
    } catch (e) {
      console.warn('Error al detener radio:', e);
    }

    voiceService.speak('Radio detenida.');
  }

  /**
   * Cambia el volumen (0.0 a 1.0)
   */
  public async setVolume(vol: number): Promise<void> {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;

    if (this.webAudioElement) {
      this.webAudioElement.volume = clamped;
    } else if (this.soundObject) {
      await this.soundObject.setVolumeAsync(clamped);
    }

    this.notify();
  }

  public async increaseVolume(): Promise<void> {
    const newVol = Math.min(1.0, Math.round((this.volume + 0.2) * 10) / 10);
    await this.setVolume(newVol);
    const pct = Math.round(newVol * 100);
    await voiceService.speak(`Volumen al ${pct} por ciento.`);
  }

  public async decreaseVolume(): Promise<void> {
    const newVol = Math.max(0.0, Math.round((this.volume - 0.2) * 10) / 10);
    await this.setVolume(newVol);
    const pct = Math.round(newVol * 100);
    await voiceService.speak(`Volumen al ${pct} por ciento.`);
  }

  private async cleanupCurrentAudio(): Promise<void> {
    if (this.webAudioElement) {
      try {
        this.webAudioElement.pause();
        this.webAudioElement.src = '';
      } catch {}
      this.webAudioElement = null;
    }

    if (this.soundObject) {
      try {
        await this.soundObject.stopAsync();
        await this.soundObject.unloadAsync();
      } catch {}
      this.soundObject = null;
    }
  }
}

export const radioService = RadioService.getInstance();
