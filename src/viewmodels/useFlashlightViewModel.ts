import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { flashlightService } from '../services/FlashlightService';
import { useGlobalVoiceAssistant } from '../context/GlobalVoiceAssistantContext';

export const useFlashlightViewModel = (onClose?: () => void) => {
  const globalAssistant = useGlobalVoiceAssistant();
  const [isOn, setIsOn] = useState<boolean>(false);

  useEffect(() => {
    flashlightService.getStatus().then(setIsOn);
    const unsub = flashlightService.addListener(setIsOn);
    return () => {
      unsub();
    };
  }, []);

  const toggle = useCallback(async () => {
    const newState = await flashlightService.toggle();
    setIsOn(newState);
  }, []);

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
    isOn,
    toggle,
    isListeningVoice: globalAssistant.state === 'listening',
    voiceFeedback: globalAssistant.transcript,
    handleVoiceCommand,
  };
};
