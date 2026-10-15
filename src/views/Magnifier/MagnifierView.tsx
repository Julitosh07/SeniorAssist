import React from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useMagnifierViewModel } from '../../viewmodels/useMagnifierViewModel';
import { HeaderBar } from '../../components/HeaderBar';
import { AccessibleText } from '../../components/AccessibleText';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleCard } from '../../components/AccessibleCard';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius } from '../../constants/theme';

export const MagnifierView: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();

  const {
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
    isListeningVoice,
    voiceFeedback,
    handleVoiceCommand,
  } = useMagnifierViewModel(() => navigation.goBack());

  // Estilos visuales de alto contraste
  const getFilterOverlay = () => {
    switch (contrastFilter) {
      case 'yellow_on_black':
        return {
          tintOverlay: 'rgba(250, 204, 21, 0.18)',
          borderColor: '#EAB308',
          label: '🟡 Tono Amarillo',
        };
      case 'inverted_high_contrast':
        return {
          tintOverlay: 'rgba(14, 165, 233, 0.20)',
          borderColor: '#38BDF8',
          label: '⚪ Tono Azul Alto Contraste',
        };
      case 'normal':
      default:
        return {
          tintOverlay: 'transparent',
          borderColor: theme.magnifier,
          label: '🌈 Color Natural',
        };
    }
  };

  const filterStyle = getFilterOverlay();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Lupa Digital" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Caso 1: Solicitud de Permiso de Cámara */}
        {!permission?.granted ? (
          <AccessibleCard style={[styles.permissionCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.primary }]}>
            <AccessibleText variant="title" weight="heavy" align="center" color={theme.textPrimary}>
              📷 Permiso de Cámara Requerido
            </AccessibleText>
            <AccessibleText variant="bodyLarge" align="center" color={theme.textSecondary} style={{ marginVertical: spacing.md }}>
              Para usar la lupa digital y aumentar letras pequeñas de medicamentos o libros, SeniorAssist necesita acceso a la cámara de tu teléfono.
            </AccessibleText>
            <AccessibleButton
              title="📷 PERMITIR USO DE CÁMARA"
              subtitle="Toca aquí para autorizar la cámara"
              variant="primary"
              minHeight={76}
              onPress={requestPermission}
            />
          </AccessibleCard>
        ) : (
          <>
            {/* Visor de la Cámara en Vivo / Imagen Congelada */}
            <View
              style={[
                styles.viewportContainer,
                {
                  borderColor: isFrozen ? theme.emergency : filterStyle.borderColor,
                },
              ]}
            >
              {isFrozen && frozenPhotoUri ? (
                <Image
                  source={{ uri: frozenPhotoUri }}
                  style={styles.cameraFeed}
                  resizeMode="cover"
                />
              ) : (
                <CameraView
                  ref={cameraRef as any}
                  style={styles.cameraFeed}
                  facing="back"
                  zoom={cameraZoom}
                  enableTorch={isTorchOn}
                />
              )}

              {/* Tinte de filtro visual opcional */}
              {filterStyle.tintOverlay !== 'transparent' && (
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: filterStyle.tintOverlay, pointerEvents: 'none' },
                  ]}
                />
              )}

              {/* Barra superior flotante sobre la cámara con estado */}
              <View style={styles.overlayTopBar}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isFrozen ? theme.emergency : 'rgba(0,0,0,0.75)' },
                  ]}
                >
                  <AccessibleText variant="caption" weight="heavy" color="#FFFFFF">
                    {isFrozen ? '❄️ IMAGEN PAUSADA' : '📷 CÁMARA EN VIVO'}
                  </AccessibleText>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
                  <AccessibleText variant="caption" weight="heavy" color="#FFFFFF">
                    🔍 {zoomLevel}x AUMENTO
                  </AccessibleText>
                </View>

                {isTorchOn && (
                  <View style={[styles.statusBadge, { backgroundColor: '#F59E0B' }]}>
                    <AccessibleText variant="caption" weight="heavy" color="#000000">
                      💡 LUZ
                    </AccessibleText>
                  </View>
                )}
              </View>

              {/* Guía en la base del visor */}
              <View style={styles.overlayBottomBar}>
                <AccessibleText variant="caption" weight="heavy" color="#FFFFFF" align="center">
                  {isFrozen
                    ? 'Imagen congelada. Puedes leer sin que te tiemble la mano.'
                    : 'Apunta hacia letras pequeñas, etiquetas o medicamentos.'}
                </AccessibleText>
              </View>
            </View>

            {/* Fila de Controles de Zoom Gigantes */}
            <View style={styles.zoomRow}>
              <View style={styles.zoomBtnWrapper}>
                <AccessibleButton
                  title="➖ Menos"
                  subtitle={`${zoomLevel}x`}
                  variant="secondary"
                  minHeight={76}
                  onPress={decreaseZoom}
                  disabled={zoomLevel <= 1}
                  accessibilityLabel="Disminuir aumento de la lupa"
                />
              </View>

              <View style={styles.zoomIndicatorWrapper}>
                <AccessibleText
                  variant="caption"
                  weight="heavy"
                  color={theme.textSecondary}
                  align="center"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={styles.zoomLabel}
                >
                  AUMENTO
                </AccessibleText>
                <AccessibleText
                  variant="header"
                  weight="heavy"
                  color={theme.magnifier}
                  align="center"
                  numberOfLines={1}
                >
                  {zoomLevel}x
                </AccessibleText>
              </View>

              <View style={styles.zoomBtnWrapper}>
                <AccessibleButton
                  title="➕ Más"
                  subtitle={`${zoomLevel}x`}
                  variant="magnifier"
                  minHeight={76}
                  onPress={increaseZoom}
                  disabled={zoomLevel >= 5}
                  accessibilityLabel="Aumentar tamaño de la lupa"
                />
              </View>
            </View>

            {/* Fila de Botón de Congelar / Reanudar */}
            <View style={styles.actionRow}>
              <AccessibleButton
                title={isFrozen ? '▶️ REANUDAR CÁMARA' : '❄️ CONGELAR IMAGEN'}
                subtitle={
                  isFrozen
                    ? 'Toca para volver a enfocar la cámara en vivo'
                    : 'Toca para dejar la imagen fija y leer sin movimiento'
                }
                variant={isFrozen ? 'secondary' : 'emergency'}
                minHeight={78}
                onPress={toggleFreeze}
              />
            </View>

            {/* Fila de Utilidades: Linterna de Luz y Modo de Color */}
            <View style={styles.utilityGrid}>
              <View style={{ flex: 1 }}>
                <AccessibleButton
                  title={isTorchOn ? '💡 Apagar Luz' : '💡 Encender Luz'}
                  subtitle={isTorchOn ? 'Luz encendida' : 'Iluminar letras'}
                  variant={isTorchOn ? 'flashlight' : 'secondary'}
                  minHeight={72}
                  onPress={toggleTorch}
                />
              </View>

              <View style={{ flex: 1 }}>
                <AccessibleButton
                  title={`🎨 ${filterStyle.label}`}
                  subtitle="Tono de color"
                  variant="secondary"
                  minHeight={72}
                  onPress={cycleContrastFilter}
                />
              </View>
            </View>

            {/* Fila de Control por Voz */}
            <View style={styles.actionRow}>
              <AccessibleButton
                title={isListeningVoice ? '🎙️ Escuchando orden...' : '🎙️ CONTROL POR VOZ'}
                subtitle={
                  isListeningVoice
                    ? 'Di: "más zoom", "menos zoom", "congelar" o "salir"'
                    : 'Toca y di: "más zoom", "menos zoom" o "congelar"'
                }
                variant={isListeningVoice ? 'secondary' : 'primary'}
                minHeight={76}
                onPress={handleVoiceCommand}
                accessibilityLabel="Controlar lupa con la voz"
              />
            </View>

            {voiceFeedback ? (
              <AccessibleCard style={{ marginTop: spacing.md, borderColor: '#2563EB', backgroundColor: '#EFF6FF' }}>
                <AccessibleText variant="bodyLarge" weight="heavy" color="#1E40AF" align="center">
                  🎙️ {voiceFeedback}
                </AccessibleText>
              </AccessibleCard>
            ) : null}
          </>
        )}
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
    paddingBottom: spacing.xxl,
  },
  permissionCard: {
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderWidth: 2,
    alignItems: 'center',
  },
  viewportContainer: {
    height: 380,
    width: '100%',
    borderRadius: borderRadius.lg,
    borderWidth: 4,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraFeed: {
    width: '100%',
    height: '100%',
  },
  overlayTopBar: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  overlayBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  zoomBtnWrapper: {
    flex: 1.8,
  },
  zoomIndicatorWrapper: {
    flex: 1.6,
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: 4,
  },
  zoomLabel: {
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  actionRow: {
    marginTop: spacing.md,
  },
  utilityGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
