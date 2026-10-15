import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { radioService, STATIONS } from '../services/RadioService';
import { RadioStation, RadioPlaybackState } from '../models';

export const useRadioViewModel = () => {
  const [currentStation, setCurrentStation] = useState<RadioStation>(radioService.getCurrentStation());
  const [status, setStatus] = useState<RadioPlaybackState>(radioService.getStatus());
  const [volume, setVolume] = useState<number>(radioService.getVolume());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(radioService.isOnline());

  useEffect(() => {
    // Suscribirse a cambios en el servicio de radio
    const unsubscribe = radioService.addListener(state => {
      setCurrentStation(state.station);
      setStatus(state.status);
      setVolume(state.volume);
      if (state.errorMessage) {
        setErrorMessage(state.errorMessage);
      } else {
        setErrorMessage(null);
      }
    });

    const handleOnlineCheck = () => {
      setIsOnline(radioService.isOnline());
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('online', handleOnlineCheck);
      window.addEventListener('offline', handleOnlineCheck);
    }

    return () => {
      unsubscribe();
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('online', handleOnlineCheck);
        window.removeEventListener('offline', handleOnlineCheck);
      }
    };
  }, []);

  const play = useCallback(async () => {
    setErrorMessage(null);
    await radioService.play();
  }, []);

  const pause = useCallback(async () => {
    await radioService.pause();
  }, []);

  const stop = useCallback(async () => {
    await radioService.stop();
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (status === 'playing' || status === 'loading') {
      await radioService.pause();
    } else {
      await radioService.play();
    }
  }, [status]);

  const increaseVolume = useCallback(async () => {
    await radioService.increaseVolume();
  }, []);

  const decreaseVolume = useCallback(async () => {
    await radioService.decreaseVolume();
  }, []);

  const selectStation = useCallback(async (station: RadioStation) => {
    setErrorMessage(null);
    await radioService.playStation(station);
  }, []);

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const volumePercentage = Math.round(volume * 100);

  return {
    currentStation,
    status,
    volume,
    volumePercentage,
    isPlaying,
    isLoading,
    stations: STATIONS,
    isOnline,
    errorMessage,
    play,
    pause,
    stop,
    togglePlayPause,
    increaseVolume,
    decreaseVolume,
    selectStation,
  };
};
