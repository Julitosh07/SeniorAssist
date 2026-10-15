import React from 'react';
import { View, StyleSheet, ScrollView, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAlarmsViewModel } from '../../viewmodels/useAlarmsViewModel';
import { HeaderBar } from '../../components/HeaderBar';
import { AccessibleText } from '../../components/AccessibleText';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleCard } from '../../components/AccessibleCard';
import { AlarmTriggerModal } from '../../components/AlarmTriggerModal';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius } from '../../constants/theme';

export const AlarmsView: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const {
    alarms,
    loading,
    modalVisible,
    editingAlarm,
    medName,
    setMedName,
    hour12,
    setHour12,
    minute,
    setMinute,
    period,
    setPeriod,
    changeHour,
    changeMinute,
    setMinuteDirect,
    handleTestSound,
    errorMessage,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveAlarm,
    handleToggleAlarm,
    handleDeleteAlarm,
    formatTime,
    alarmRingingMedication,
    dismissAlarmModal,
  } = useAlarmsViewModel();

  const minuteOptions = ['00', '15', '30', '45'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Recordatorios" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <AccessibleCard style={{ borderColor: theme.alarms }}>
          <AccessibleText variant="title" weight="heavy" color={theme.alarms}>
            💊 Tus Medicamentos a Tiempo
          </AccessibleText>
          <AccessibleText variant="bodyLarge" weight="medium" style={styles.cardText}>
            Tus alarmas sonarán a la hora exacta con sonido y vibración, incluso con la aplicación cerrada.
          </AccessibleText>
        </AccessibleCard>

        <View style={styles.addButtonWrapper}>
          <AccessibleButton
            title="➕ AGREGAR NUEVA ALARMA"
            subtitle="Configurar recordatorio de pastilla"
            variant="alarms"
            minHeight={76}
            onPress={openCreateModal}
          />
        </View>

        <AccessibleText variant="title" weight="heavy" color={theme.textPrimary} style={styles.sectionTitle}>
          Tus Recordatorios:
        </AccessibleText>

        {loading ? (
          <AccessibleText variant="bodyLarge" align="center" color={theme.textSecondary}>
            Cargando tus alarmas...
          </AccessibleText>
        ) : alarms.length === 0 ? (
          <AccessibleCard elevated>
            <AccessibleText variant="bodyLarge" weight="medium" align="center" color={theme.textSecondary}>
              Aún no tienes recordatorios guardados. Presiona el botón verde de arriba para agregar uno.
            </AccessibleText>
          </AccessibleCard>
        ) : (
          alarms.map(alarm => (
            <View key={alarm.id} style={styles.alarmCardWrapper}>
              <AccessibleCard
                elevated
                style={{
                  borderColor: alarm.isActive ? theme.alarms : theme.border,
                  opacity: alarm.isActive ? 1 : 0.7,
                }}
              >
                <View style={styles.alarmRow}>
                  <View style={styles.alarmInfo}>
                    <AccessibleText variant="hero" weight="heavy" color={alarm.isActive ? theme.alarms : theme.textSecondary}>
                      ⏰ {formatTime(alarm.time)}
                    </AccessibleText>
                    <AccessibleText variant="title" weight="bold">
                      {alarm.medicationName}
                    </AccessibleText>
                    <AccessibleText variant="body" weight="medium" color={theme.textSecondary}>
                      {alarm.isActive ? '✅ Sonará todos los días' : '⏸️ Desactivado temporalmente'}
                    </AccessibleText>
                  </View>
                </View>

                {/* Fila de acciones: Editar, Alternar, Eliminar */}
                <View style={styles.alarmActionsRow}>
                  <TouchableOpacity
                    style={[styles.editButton, { borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                    onPress={() => openEditModal(alarm)}
                    accessibilityLabel={`Editar alarma de ${alarm.medicationName}`}
                  >
                    <AccessibleText variant="body" weight="bold" color={theme.textPrimary}>
                      ✏️ Editar
                    </AccessibleText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      {
                        backgroundColor: alarm.isActive ? theme.surfaceElevated : theme.alarms,
                        borderColor: alarm.isActive ? theme.border : theme.alarms,
                      },
                    ]}
                    onPress={() => handleToggleAlarm(alarm)}
                    accessibilityLabel={alarm.isActive ? 'Desactivar alarma' : 'Activar alarma'}
                  >
                    <AccessibleText
                      variant="body"
                      weight="bold"
                      color={alarm.isActive ? theme.textSecondary : theme.alarmsContrast}
                    >
                      {alarm.isActive ? '⏸️ Desactivar' : '▶️ Activar'}
                    </AccessibleText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}
                    onPress={() => handleDeleteAlarm(alarm)}
                    accessibilityLabel={`Eliminar alarma de ${alarm.medicationName}`}
                  >
                    <AccessibleText variant="body" weight="bold" color="#DC2626">
                      🗑️ Eliminar
                    </AccessibleText>
                  </TouchableOpacity>
                </View>

                {/* Botón para verificar que suene la alarma de inmediato */}
                <View style={{ marginTop: spacing.sm }}>
                  <AccessibleButton
                    title="🔔 Probar sonido de alarma"
                    subtitle="Escucha cómo sonará tu recordatorio"
                    variant="secondary"
                    minHeight={50}
                    onPress={() => handleTestSound(alarm)}
                  />
                </View>
              </AccessibleCard>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal accesible para agregar o editar alarma */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.alarms }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <AccessibleText variant="header" weight="heavy" align="center" color={theme.alarms}>
                {editingAlarm ? '✏️ Editar Alarma' : '⏰ Nueva Alarma'}
              </AccessibleText>

              <AccessibleText variant="bodyLarge" weight="bold" style={styles.inputLabel}>
                Nombre del medicamento:
              </AccessibleText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="Ejemplo: Losartán, Aspirina..."
                placeholderTextColor={theme.textSecondary}
                value={medName}
                onChangeText={setMedName}
                accessibilityLabel="Nombre del medicamento"
              />

              {/* Selector de Hora en Formato 12 Horas (1 a 12) */}
              <AccessibleText variant="bodyLarge" weight="bold" style={styles.inputLabel}>
                Hora (de 1 a 12):
              </AccessibleText>

              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                  onPress={() => changeHour(-1)}
                  accessibilityLabel="Restar una hora"
                >
                  <AccessibleText variant="hero" weight="heavy" color={theme.textPrimary}>
                    -
                  </AccessibleText>
                </TouchableOpacity>

                <View style={[styles.hourBadge, { backgroundColor: theme.surfaceElevated, borderColor: theme.alarms }]}>
                  <AccessibleText variant="hero" weight="heavy" color={theme.alarms}>
                    {hour12}
                  </AccessibleText>
                  <AccessibleText variant="caption" weight="bold" color={theme.textSecondary}>
                    HORA
                  </AccessibleText>
                </View>

                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                  onPress={() => changeHour(1)}
                  accessibilityLabel="Sumar una hora"
                >
                  <AccessibleText variant="hero" weight="heavy" color={theme.textPrimary}>
                    +
                  </AccessibleText>
                </TouchableOpacity>
              </View>

              {/* Selector de Minutos con Stepper (+/-) y campo editable */}
              <AccessibleText variant="bodyLarge" weight="bold" style={styles.inputLabel}>
                Minutos (personalizable de 00 a 59):
              </AccessibleText>

              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                  onPress={() => changeMinute(-1)}
                  accessibilityLabel="Restar un minuto"
                >
                  <AccessibleText variant="hero" weight="heavy" color={theme.textPrimary}>
                    -
                  </AccessibleText>
                </TouchableOpacity>

                <View style={[styles.hourBadge, { backgroundColor: theme.surfaceElevated, borderColor: theme.alarms }]}>
                  <TextInput
                    style={[styles.minuteTextInput, { color: theme.alarms }]}
                    value={minute}
                    onChangeText={setMinuteDirect}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectTextOnFocus
                    accessibilityLabel="Escribir minutos exactos"
                  />
                  <AccessibleText variant="caption" weight="bold" color={theme.textSecondary}>
                    MINUTOS
                  </AccessibleText>
                </View>

                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                  onPress={() => changeMinute(1)}
                  accessibilityLabel="Sumar un minuto"
                >
                  <AccessibleText variant="hero" weight="heavy" color={theme.textPrimary}>
                    +
                  </AccessibleText>
                </TouchableOpacity>
              </View>

              {/* Botones de acceso rápido para minutos */}
              <View style={styles.minuteRow}>
                {minuteOptions.map(m => {
                  const isSelected = minute === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.minuteOptionBtn,
                        {
                          backgroundColor: isSelected ? theme.alarms : theme.surfaceElevated,
                          borderColor: isSelected ? theme.alarms : theme.border,
                        },
                      ]}
                      onPress={() => setMinute(m)}
                      accessibilityLabel={`Minuto :${m}`}
                    >
                      <AccessibleText
                        variant="title"
                        weight="bold"
                        color={isSelected ? theme.alarmsContrast : theme.textPrimary}
                      >
                        :{m}
                      </AccessibleText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selector de Horario: AM vs PM */}
              <AccessibleText variant="bodyLarge" weight="bold" style={styles.inputLabel}>
                Momento del día:
              </AccessibleText>
              <View style={styles.periodRow}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor: period === 'AM' ? '#FEF3C7' : theme.surfaceElevated,
                      borderColor: period === 'AM' ? '#D97706' : theme.border,
                    },
                  ]}
                  onPress={() => setPeriod('AM')}
                  accessibilityLabel="Seleccionar AM mañana"
                >
                  <AccessibleText variant="title" weight="heavy" color={period === 'AM' ? '#B45309' : theme.textSecondary}>
                    ☀️ AM
                  </AccessibleText>
                  <AccessibleText variant="body" weight="bold" color={period === 'AM' ? '#B45309' : theme.textSecondary}>
                    (Mañana)
                  </AccessibleText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor: period === 'PM' ? '#E0E7FF' : theme.surfaceElevated,
                      borderColor: period === 'PM' ? '#4F46E5' : theme.border,
                    },
                  ]}
                  onPress={() => setPeriod('PM')}
                  accessibilityLabel="Seleccionar PM tarde o noche"
                >
                  <AccessibleText variant="title" weight="heavy" color={period === 'PM' ? '#4338CA' : theme.textSecondary}>
                    🌙 PM
                  </AccessibleText>
                  <AccessibleText variant="body" weight="bold" color={period === 'PM' ? '#4338CA' : theme.textSecondary}>
                    (Tarde/Noche)
                  </AccessibleText>
                </TouchableOpacity>
              </View>

              {/* Resumen grande de la hora elegida */}
              <View style={[styles.previewBadge, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                <AccessibleText variant="body" weight="bold" color={theme.textSecondary}>
                  Hora programada:
                </AccessibleText>
                <AccessibleText variant="hero" weight="heavy" color={theme.alarms}>
                  {hour12 < 10 ? `0${hour12}` : hour12}:{minute} {period}
                </AccessibleText>
              </View>

              {errorMessage ? (
                <AccessibleText variant="body" weight="bold" color={theme.error} align="center" style={styles.errorText}>
                  {errorMessage}
                </AccessibleText>
              ) : null}

              <View style={styles.modalButtonsContainer}>
                <AccessibleButton
                  title={editingAlarm ? '💾 GUARDAR CAMBIOS' : '🔔 GUARDAR RECORDATORIO'}
                  variant="alarms"
                  minHeight={64}
                  onPress={handleSaveAlarm}
                />
                <View style={{ marginTop: spacing.sm }}>
                  <AccessibleButton
                    title="Cancelar"
                    variant="secondary"
                    minHeight={52}
                    onPress={closeModal}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Alarma Sonora de Medicamento con Botón Gigante */}
      <AlarmTriggerModal
        visible={Boolean(alarmRingingMedication)}
        medicationName={alarmRingingMedication || 'tu medicamento'}
        onDismiss={dismissAlarmModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  cardText: {
    marginTop: spacing.xs,
  },
  addButtonWrapper: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  alarmCardWrapper: {
    marginBottom: spacing.md,
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alarmInfo: {
    flex: 1,
  },
  alarmActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  editButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  toggleButton: {
    flex: 1.2,
    minHeight: 50,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  deleteButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    padding: spacing.lg,
  },
  inputLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 20,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  stepperBtn: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourBadge: {
    minWidth: 120,
    height: 68,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  minuteTextInput: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    textAlign: 'center',
    padding: 0,
    minWidth: 60,
  },
  minuteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
    gap: spacing.xs,
  },
  minuteOptionBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  previewBadge: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: spacing.sm,
  },
  modalButtonsContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});
