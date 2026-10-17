import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/hooks/useTheme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GlobalVoiceAssistantProvider } from './src/context/GlobalVoiceAssistantContext';
import { backgroundAssistantService } from './src/services/BackgroundAssistantService';
import { voiceService } from './src/services/VoiceService';
import { authService } from './src/services/AuthService';

const MainApp: React.FC = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    // Inicializar autenticacion transparente y handshake con Render en segundo plano
    authService.getValidToken().catch(err => {
      console.log('Handshake local:', err);
    });

    // Configurar notificación permanente accesible en segundo plano
    backgroundAssistantService.setupPersistentAssistant();

    // Silenciar voz de inmediato al presionar el botón atrás físico de Android
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      voiceService.stopSpeaking();
      return false; // Permite que la navegación retroceda normalmente
    });

    return () => {
      backSub.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <GlobalVoiceAssistantProvider>
        <AppNavigator />
      </GlobalVoiceAssistantProvider>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
