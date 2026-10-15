import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useGlobalVoiceAssistant } from '../context/GlobalVoiceAssistantContext';
import { onboardingService } from '../services/OnboardingService';
import { alarmService } from '../services/AlarmService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface ModalState {
  visible: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export const useHomeViewModel = () => {
  const navigation = useNavigation<NavigationProp>();
  const globalAssistant = useGlobalVoiceAssistant();

  // Estado para alarma sonora de medicamentos disparada
  const [alarmRingingMedication, setAlarmRingingMedication] = useState<string | null>(null);

  // Estado para modal de onboarding de contacto de auxilio en primer inicio
  const [emergencySetupVisible, setEmergencySetupVisible] = useState<boolean>(false);

  const [modal, setModal] = useState<ModalState>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showModal = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setModal({
      visible: true,
      type,
      title,
      message,
    });
  }, []);

  const dismissModal = useCallback(() => {
    setModal(prev => ({ ...prev, visible: false }));
  }, []);

  // Verificar si es la primera vez que se instala la aplicación para configurar el contacto de auxilio
  useEffect(() => {
    onboardingService.isEmergencyConfigured().then((isConfigured) => {
      if (!isConfigured) {
        setEmergencySetupVisible(true);
      }
    });
  }, []);

  const handleEmergencySetupCompleted = useCallback(() => {
    setEmergencySetupVisible(false);
  }, []);

  // Escuchar disparos de alarmas de medicamentos para mostrar el modal con botón de apagado gigante
  useEffect(() => {
    const unsub = alarmService.onAlarmTriggered((medicationName) => {
      setAlarmRingingMedication(medicationName);
    });
    return () => {
      unsub();
    };
  }, []);

  const dismissAlarmModal = useCallback(() => {
    setAlarmRingingMedication(null);
  }, []);

  const navigateTo = useCallback((screen: keyof RootStackParamList) => {
    (navigation.navigate as any)(screen);
  }, [navigation]);

  return {
    state: globalAssistant.state,
    transcript: globalAssistant.transcript,
    modal,
    isHandsFree: globalAssistant.isHandsFree,
    toggleHandsFree: globalAssistant.toggleHandsFree,
    startListening: globalAssistant.startListening,
    stopListening: globalAssistant.stopListening,
    dismissModal,
    navigateTo,
    emergencySetupVisible,
    handleEmergencySetupCompleted,
    alarmRingingMedication,
    dismissAlarmModal,
  };
};
