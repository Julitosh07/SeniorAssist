import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeaderBar } from '../../components/HeaderBar';
import { AccessibleText } from '../../components/AccessibleText';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleCard } from '../../components/AccessibleCard';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../constants/theme';
import { useRadioViewModel } from '../../viewmodels/useRadioViewModel';
import { useGlobalVoiceAssistant } from '../../context/GlobalVoiceAssistantContext';

export const RadioView: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const globalAssistant = useGlobalVoiceAssistant();
  const {
    currentStation,
    status,
    volumePercentage,
    isPlaying,
    isLoading,
    stations,
    isOnline,
    errorMessage,
    togglePlayPause,
    stop,
    increaseVolume,
    decreaseVolume,
    selectStation,
  } = useRadioViewModel();

  const getStatusBadge = () => {
    switch (status) {
      case 'playing':
        return { text: '🔴 EN VIVO REPRODUCIENDO', color: '#1B5E20', bg: '#E8F5E9' };
      case 'loading':
        return { text: '⏳ SINTONIZANDO SEÑAL...', color: '#E65100', bg: '#FFF3E0' };
      case 'paused':
        return { text: '⏸️ EN PAUSA', color: '#0D47A1', bg: '#E3F2FD' };
      case 'error':
        return { text: '⚠️ ERROR DE SEÑAL', color: '#B71C1C', bg: '#FFEBEE' };
      case 'stopped':
      default:
        return { text: '⏹️ DETENIDA', color: '#424242', bg: '#EEEEEE' };
    }
  };

  const badge = getStatusBadge();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Radio en Vivo" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Advertencia si no hay conexión a internet */}
        {!isOnline && (
          <AccessibleCard style={[styles.offlineCard, { backgroundColor: '#FFF3E0', borderColor: '#FF9800' }]}>
            <AccessibleText variant="title" weight="heavy" color="#E65100">
              ⚠️ Sin Conexión a Internet
            </AccessibleText>
            <AccessibleText variant="bodyLarge" weight="bold" color="#000000" style={{ marginTop: spacing.xs }}>
              La radio en vivo requiere conexión a internet. Por favor conéctate a una red Wi-Fi o datos móviles.
            </AccessibleText>
          </AccessibleCard>
        )}

        {/* Mensaje de error si falla la emisora */}
        {errorMessage && (
          <AccessibleCard style={[styles.errorCard, { backgroundColor: '#FFEBEE', borderColor: '#D32F2F' }]}>
            <AccessibleText variant="bodyLarge" weight="bold" color="#B71C1C">
              {errorMessage}
            </AccessibleText>
          </AccessibleCard>
        )}

        {/* Tarjeta de Emisora Actual */}
        <AccessibleCard elevated style={[styles.currentStationCard, { borderColor: theme.radio }]}>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.color }]}>
            <AccessibleText variant="body" weight="heavy" color={badge.color}>
              {badge.text}
            </AccessibleText>
          </View>

          <AccessibleText variant="title" weight="heavy" color={theme.textPrimary} style={styles.stationName}>
            {currentStation.name}
          </AccessibleText>

          <AccessibleText variant="title" weight="bold" color={theme.radio}>
            {currentStation.frequency}
          </AccessibleText>

          {currentStation.genre ? (
            <AccessibleText variant="bodyLarge" weight="medium" color={theme.textSecondary} style={{ marginTop: 4 }}>
              {currentStation.genre}
            </AccessibleText>
          ) : null}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.radio} />
              <AccessibleText variant="body" weight="bold" color={theme.radio}>
                Conectando con la transmisión...
              </AccessibleText>
            </View>
          )}
        </AccessibleCard>

        {/* Botón Principal de Reproducción / Pausa */}
        <View style={styles.playbackControls}>
          <AccessibleButton
            title={
              isLoading
                ? '⏳ SINTONIZANDO... TOCAR PARA CANCELAR'
                : isPlaying
                ? '⏸️ PAUSAR RADIO'
                : status === 'paused'
                ? '▶️ REANUDAR RADIO'
                : '▶️ SINTONIZAR Y ESCUCHAR'
            }
            subtitle={
              isLoading
                ? 'Presiona para cancelar o pausar'
                : isPlaying
                ? 'Presiona para pausar la transmisión'
                : status === 'paused'
                ? 'Presiona para continuar escuchando'
                : 'Presiona para escuchar en vivo'
            }
            variant={isPlaying || isLoading ? 'secondary' : 'radio'}
            minHeight={88}
            onPress={togglePlayPause}
          />

          {status !== 'stopped' && (
            <AccessibleButton
              title="⏹️ DETENER POR COMPLETO"
              subtitle="Cerrar la señal de audio"
              variant="secondary"
              minHeight={64}
              onPress={stop}
            />
          )}

          {/* Botón de Control por Voz del Asistente en Radio */}
          <AccessibleButton
            title={globalAssistant.state === 'listening' ? '🎙️ ESCUCHANDO TU ORDEN...' : '🎙️ HABLAR AL ASISTENTE'}
            subtitle="Toca o di 'Asistente' en cualquier momento para dar una orden por voz"
            variant={globalAssistant.state === 'listening' ? 'primary' : 'secondary'}
            minHeight={72}
            onPress={async () => {
              if (globalAssistant.state === 'listening') {
                globalAssistant.stopListening();
              } else {
                await globalAssistant.startListening();
              }
            }}
          />
        </View>

        {/* Panel de Control de Volumen Accesible */}
        <AccessibleCard style={[styles.volumeCard, { borderColor: theme.border }]}>
          <View style={styles.volumeHeader}>
            <AccessibleText variant="title" weight="heavy" color={theme.textPrimary}>
              🔊 Volumen:
            </AccessibleText>
            <AccessibleText variant="title" weight="heavy" color={theme.radio}>
              {volumePercentage}%
            </AccessibleText>
          </View>

          {/* Barra visual de volumen */}
          <View style={[styles.volumeBarBackground, { backgroundColor: theme.surfaceElevated }]}>
            <View
              style={[
                styles.volumeBarFill,
                {
                  width: `${Math.max(5, volumePercentage)}%`,
                  backgroundColor: theme.radio,
                },
              ]}
            />
          </View>

          <View style={styles.volumeButtonsRow}>
            <View style={{ flex: 1 }}>
              <AccessibleButton
                title="🔉 Bajar Volumen (-20%)"
                variant="secondary"
                minHeight={64}
                onPress={decreaseVolume}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AccessibleButton
                title="🔊 Subir Volumen (+20%)"
                variant="secondary"
                minHeight={64}
                onPress={increaseVolume}
              />
            </View>
          </View>
        </AccessibleCard>

        {/* Lista de Emisoras Accesibles */}
        <AccessibleText variant="title" weight="heavy" color={theme.textPrimary} style={styles.sectionTitle}>
          📻 Emisoras Colombianas Disponibles:
        </AccessibleText>

        <View style={styles.stationsList}>
          {stations.map(station => {
            const isSelected = currentStation.id === station.id;
            return (
              <View key={station.id} style={styles.stationItemWrapper}>
                <AccessibleButton
                  title={isSelected && isPlaying ? `▶️ ${station.name}` : station.name}
                  subtitle={`${station.frequency} • ${station.genre}`}
                  variant={isSelected && isPlaying ? 'radio' : 'secondary'}
                  minHeight={76}
                  onPress={() => selectStation(station)}
                />
              </View>
            );
          })}
        </View>

        {/* Tarjeta de Sugerencia de Comandos por Voz */}
        <AccessibleCard style={[styles.voiceTipCard, { backgroundColor: theme.surfaceElevated }]}>
          <AccessibleText variant="bodyLarge" weight="bold" color={theme.textPrimary}>
            💡 Comandos por Voz:
          </AccessibleText>
          <AccessibleText variant="body" color={theme.textSecondary} style={{ marginTop: spacing.xs }}>
            Pulsa el botón "Hablar" en la pantalla principal y di:
          </AccessibleText>
          <AccessibleText variant="bodyLarge" weight="heavy" color={theme.radio} style={{ marginTop: 4 }}>
            "Pon Radio Nacional"  •  "Pon Caracol"  •  "Pausar radio"  •  "Subir volumen"
          </AccessibleText>
        </AccessibleCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  offlineCard: {
    borderWidth: 2,
    marginBottom: spacing.md,
  },
  errorCard: {
    borderWidth: 2,
    marginBottom: spacing.md,
  },
  currentStationCard: {
    borderWidth: 3,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  stationName: {
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 34,
    marginBottom: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  playbackControls: {
    marginBottom: spacing.md,
  },
  volumeCard: {
    borderWidth: 2,
    marginBottom: spacing.md,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  volumeBarBackground: {
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginBottom: spacing.md,
  },
  volumeBarFill: {
    height: '100%',
    borderRadius: 9,
  },
  volumeButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  stationsList: {
    marginBottom: spacing.md,
  },
  stationItemWrapper: {
    marginBottom: spacing.md,
  },
  voiceTipCard: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
});
