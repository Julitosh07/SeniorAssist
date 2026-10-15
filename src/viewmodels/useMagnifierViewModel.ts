import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CameraView } from 'expo-camera';
import { magnifierService, ContrastFilterMode } from '../services/MagnifierService';
import { useGlobalVoiceAssistant } from '../context/GlobalVoiceAssistantContext';

export const useMagnifierViewModel = (onClose?: () => void) => {
  const globalAssistant = useGlobalVoiceAssistant();
  const [zoomLevel, setZoomLevel] = useState<number>(() => magnifierService.getZoom());
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [frozenPhotoUri, setFrozenPhotoUri] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [contrastFilter, setContrastFilter] = useState<ContrastFilterMode>('normal');
  const cameraRef = useRef<CameraView | null>(null);

  // Mapeo lineal de 1x-5x a [0.0, 1.0] para expo-camera
  const cameraZoom = Math.min(1, Math.max(0, (zoomLevel - 1) / 4));

  const increaseZoom = useCallback(async () => {
    await magnifierService.increaseZoom();
  }, []);

  const decreaseZoom = useCallback(async () => {
    await magnifierService.decreaseZoom();
  }, []);

  const toggleTorch = useCallback(() => {
    setIsTorchOn(prev => !prev);
  }, []);

  const toggleFreeze = useCallback(async () => {
    if (!isFrozen) {
      // 1. Pausar la transmisión de video de la cámara nativamente
      try {
        if (cameraRef.current && typeof (cameraRef.current as any).pausePreview === 'function') {
          await (cameraRef.current as any).pausePreview();
        }
      } catch (err) {
        console.warn('Error en pausePreview:', err);
      }

      // 2. Tomar foto fija de respaldo
      try {
        if (cameraRef.current && typeof (cameraRef.current as any).takePictureAsync === 'function') {
          const photo = await (cameraRef.current as any).takePictureAsync({
            quality: 0.8,
          });
          if (photo?.uri) {
            setFrozenPhotoUri(photo.uri);
          }
        }
      } catch (err) {
        console.warn('takePictureAsync fallback:', err);
      }

      setIsFrozen(true);
      await magnifierService.announceFreeze(true);
    } else {
      // Reanudar cámara en vivo
      try {
        if (cameraRef.current && typeof (cameraRef.current as any).resumePreview === 'function') {
          await (cameraRef.current as any).resumePreview();
        }
      } catch (err) {
        console.warn('Error en resumePreview:', err);
      }
      setFrozenPhotoUri(null);
      setIsFrozen(false);
      await magnifierService.announceFreeze(false);
    }
  }, [isFrozen]);

  useEffect(() => {
    const unsubscribeZoom = magnifierService.addListener((newZoom) => {
      setZoomLevel(newZoom);
    });
    const unsubscribeFreeze = magnifierService.addFreezeToggleListener(() => {
      toggleFreeze();
    });
    return () => {
      unsubscribeZoom();
      unsubscribeFreeze();
    };
  }, [toggleFreeze]);

  const cycleContrastFilter = useCallback(async () => {
    let next: ContrastFilterMode = 'normal';
    if (contrastFilter === 'normal') next = 'yellow_on_black';
    else if (contrastFilter === 'yellow_on_black') next = 'inverted_high_contrast';
    else next = 'normal';

    setContrastFilter(next);
    await magnifierService.announceFilter(next);
  }, [contrastFilter]);

  const handleVoiceCommand = useCallback(async () => {
    if (globalAssistant.state === 'listening') {
      globalAssistant.stopListening();
    } else {
      if (Platform.OS !== 'web') {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch {}
      }
      await globalAssistant.startListening();
    }
  }, [globalAssistant]);

  return {
    zoomLevel,
    cameraZoom,
    isFrozen,
    frozenPhotoUri,
    isTorchOn,
    contrastFilter,
    cameraRef,
    increaseZoom,
    decreaseZoom,
    toggleTorch,
    toggleFreeze,
    cycleContrastFilter,
    isListeningVoice: globalAssistant.state === 'listening',
    voiceFeedback: globalAssistant.transcript,
    handleVoiceCommand,
  };
};

