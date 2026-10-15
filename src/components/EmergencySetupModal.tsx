import React, { useState, useEffect, useCallback } from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Platform,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AccessibleText } from './AccessibleText';
import { AccessibleButton } from './AccessibleButton';
import { AccessibleCard } from './AccessibleCard';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing } from '../constants/theme';
import { deviceContactsService, SimpleDeviceContact } from '../services/DeviceContactsService';
import { onboardingService } from '../services/OnboardingService';
import { voiceService } from '../services/VoiceService';

export interface EmergencySetupModalProps {
  visible: boolean;
  onSaved: () => void;
}

export const EmergencySetupModal: React.FC<EmergencySetupModalProps> = ({
  visible,
  onSaved,
}) => {
  const { theme } = useTheme();

  const [tab, setTab] = useState<'device' | 'manual'>('device');
  const [deviceContacts, setDeviceContacts] = useState<SimpleDeviceContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState<boolean>(false);
  const [contactFilter, setContactFilter] = useState<string>('');

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('Hijo/a');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const loadDeviceContacts = useCallback(async (forceRefresh: boolean = false) => {
    setLoadingContacts(true);
    setErrorMsg('');
    try {
      const contacts = await deviceContactsService.getAllContacts(forceRefresh);
      setDeviceContacts(contacts);
    } catch (err) {
      console.warn('Error cargando contactos en setup de emergencia:', err);
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  // Al abrir el modal, dar la bienvenida y explicar por voz
  useEffect(() => {
    if (visible) {
      voiceService.speak(
        '¡Hola! Te damos la bienvenida a SeniorAssist. Por tu seguridad, por favor indícanos a quién debemos llamar si necesitas auxilio.',
        true
      );

      // Cargar contactos del celular de forma automática
      loadDeviceContacts(false);
    }
  }, [visible, loadDeviceContacts]);

  const handleSelectDeviceContact = async (dc: SimpleDeviceContact) => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }
    setSaving(true);
    try {
      await onboardingService.saveEmergencyContact(dc.name, dc.phoneNumber, 'Familiar de confianza');
      onSaved();
    } catch (e) {
      setErrorMsg('No fue posible guardar el contacto.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveManual = async () => {
    if (!name.trim()) {
      setErrorMsg('Por favor escribe el nombre de la persona.');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 7) {
      setErrorMsg('Por favor ingresa un número de teléfono válido (mínimo 7 dígitos).');
      return;
    }

    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }

    setSaving(true);
    try {
      await onboardingService.saveEmergencyContact(name, phone, relationship);
      onSaved();
    } catch (e) {
      setErrorMsg('No fue posible guardar el contacto.');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  // Filtrado fonético y por dígitos en tiempo real
  const normFilter = deviceContactsService.normalize(contactFilter);
  const filterDigits = normFilter.replace(/\D/g, '');
  const filterTokens = normFilter.split(/\s+/).filter(t => t.length > 0);

  const filteredContacts = deviceContacts.filter(c => {
    if (!normFilter) return true;
    const normName = deviceContactsService.normalize(c.name);
    const cleanPhone = c.phoneNumber.replace(/\D/g, '');

    if (filterDigits.length >= 3 && cleanPhone.includes(filterDigits)) {
      return true;
    }
    if (normName.includes(normFilter)) {
      return true;
    }
    if (filterTokens.length > 0 && filterTokens.every(tok => normName.includes(tok))) {
      return true;
    }
    return false;
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={() => {}}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Barra Superior con Icono Escudo */}
        <View style={[styles.header, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <AccessibleText variant="title" weight="heavy" color="#DC2626" align="center">
            🛡️ Bienvenido a SeniorAssist
          </AccessibleText>
          <AccessibleText variant="bodyLarge" weight="bold" color={theme.textPrimary} align="center" style={styles.headerSubtitle}>
            Configura a tu persona de auxilio
          </AccessibleText>
          <AccessibleText variant="body" weight="medium" color={theme.textSecondary} align="center">
            Esta persona recibirá tu llamada y ubicación GPS si tocas Auxilio o dices "Auxilio".
          </AccessibleText>
        </View>

        {/* Selector de pestañas: Del Celular o Manual */}
        <View style={styles.tabContainer}>
          <View style={styles.tabButtonWrapper}>
            <AccessibleButton
              title="📱 Del Celular"
              subtitle="Elegir de tu agenda"
              variant={tab === 'device' ? 'primary' : 'secondary'}
              minHeight={62}
              onPress={() => {
                setTab('device');
                if (deviceContacts.length === 0) {
                  loadDeviceContacts(false);
                }
              }}
            />
          </View>
          <View style={styles.tabButtonWrapper}>
            <AccessibleButton
              title="✍️ Escribir a Mano"
              subtitle="Ingresar nombre y número"
              variant={tab === 'manual' ? 'primary' : 'secondary'}
              minHeight={62}
              onPress={() => setTab('manual')}
            />
          </View>
        </View>

        {errorMsg ? (
          <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#DC2626' }]}>
            <AccessibleText variant="body" weight="bold" color="#991B1B" align="center">
              ⚠️ {errorMsg}
            </AccessibleText>
          </View>
        ) : null}

        {/* Contenido Pestaña 1: Contactos del Celular */}
        {tab === 'device' ? (
          <View style={styles.tabContent}>
            {/* Buscador de contactos */}
            <View style={styles.searchWrapper}>
              <AccessibleText variant="body" weight="bold" color={theme.textPrimary}>
                Buscar en tu celular:
              </AccessibleText>
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                  value={contactFilter}
                  onChangeText={setContactFilter}
                  placeholder="Escribe el nombre o número de tu familiar..."
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {contactFilter ? (
                  <TouchableOpacity onPress={() => setContactFilter('')} style={styles.clearSearchBtn}>
                    <AccessibleText variant="title" weight="heavy" color={theme.textSecondary}>
                      ✕
                    </AccessibleText>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {loadingContacts ? (
                <View style={styles.loadingWrapper}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <AccessibleText variant="bodyLarge" weight="bold" align="center" color={theme.primary} style={{ marginTop: spacing.md }}>
                    Leyendo los contactos de tu teléfono...
                  </AccessibleText>
                </View>
              ) : deviceContacts.length === 0 ? (
                <AccessibleCard style={styles.emptyCard}>
                  <AccessibleText variant="title" weight="heavy" align="center" color={theme.textPrimary}>
                    📱 No pudimos acceder a los contactos
                  </AccessibleText>
                  <AccessibleText variant="body" weight="medium" align="center" color={theme.textSecondary} style={{ marginTop: spacing.xs }}>
                    Asegúrate de conceder el permiso de contactos en tu teléfono o escribe a la persona a mano.
                  </AccessibleText>
                  <View style={{ marginTop: spacing.md, width: '100%' }}>
                    <AccessibleButton
                      title="🔄 REINTENTAR Y CONCEDER PERMISO"
                      subtitle="Volver a buscar contactos en tu teléfono"
                      variant="primary"
                      minHeight={62}
                      onPress={() => loadDeviceContacts(true)}
                    />
                  </View>
                  <View style={{ marginTop: spacing.sm, width: '100%' }}>
                    <AccessibleButton
                      title="✍️ Escribir contacto a mano"
                      subtitle="Ingresar nombre y número sin agenda"
                      variant="secondary"
                      minHeight={56}
                      onPress={() => setTab('manual')}
                    />
                  </View>
                </AccessibleCard>
              ) : filteredContacts.length === 0 ? (
                <AccessibleCard style={styles.emptyCard}>
                  <AccessibleText variant="bodyLarge" weight="bold" align="center" color={theme.textPrimary}>
                    No encontramos contactos para "{contactFilter}"
                  </AccessibleText>
                  <AccessibleText variant="body" weight="medium" align="center" color={theme.textSecondary} style={{ marginTop: 4 }}>
                    Revisa cómo está guardado en tu agenda o intenta con otro nombre.
                  </AccessibleText>
                  <View style={{ marginTop: spacing.md }}>
                    <AccessibleButton
                      title="✕ Borrar búsqueda"
                      variant="secondary"
                      minHeight={52}
                      onPress={() => setContactFilter('')}
                    />
                  </View>
                </AccessibleCard>
              ) : (
                filteredContacts.slice(0, 60).map((contact) => (
                  <View key={contact.id} style={styles.contactItemWrapper}>
                    <AccessibleCard elevated>
                      <AccessibleText variant="title" weight="heavy" color={theme.textPrimary}>
                        {contact.name}
                      </AccessibleText>
                      <AccessibleText variant="bodyLarge" weight="semibold" color={theme.primary} style={{ marginTop: 4 }}>
                        📞 {contact.phoneNumber}
                      </AccessibleText>
                      <View style={{ marginTop: spacing.md }}>
                        <AccessibleButton
                          title="✅ ELEGIR ESTE CONTACTO"
                          variant="emergency"
                          minHeight={60}
                          disabled={saving}
                          onPress={() => handleSelectDeviceContact(contact)}
                        />
                      </View>
                    </AccessibleCard>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        ) : (
          /* Contenido Pestaña 2: Escribir a Mano */
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.manualFormContent} keyboardShouldPersistTaps="handled">
            <AccessibleCard elevated>
              <AccessibleText variant="bodyLarge" weight="bold" color={theme.textPrimary}>
                Nombre de la persona:
              </AccessibleText>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                value={name}
                onChangeText={setName}
                placeholder="Ejemplo: María (Hija)"
                placeholderTextColor={theme.textSecondary}
              />

              <AccessibleText variant="bodyLarge" weight="bold" color={theme.textPrimary} style={styles.inputLabel}>
                Número de teléfono móvil:
              </AccessibleText>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Ejemplo: 300 123 4567"
                keyboardType="phone-pad"
                placeholderTextColor={theme.textSecondary}
              />

              <AccessibleText variant="bodyLarge" weight="bold" color={theme.textPrimary} style={styles.inputLabel}>
                Parentesco o relación:
              </AccessibleText>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                value={relationship}
                onChangeText={setRelationship}
                placeholder="Ejemplo: Hija, Hijo, Esposo, Vecino"
                placeholderTextColor={theme.textSecondary}
              />

              <View style={styles.saveBtnWrapper}>
                <AccessibleButton
                  title={saving ? '⏳ GUARDANDO...' : '💾 GUARDAR Y CONTINUAR'}
                  subtitle="Quedará asignado como tu contacto de auxilio"
                  variant="emergency"
                  minHeight={76}
                  disabled={saving}
                  onPress={handleSaveManual}
                />
              </View>
            </AccessibleCard>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: spacing.md,
  },
  header: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    marginBottom: spacing.md,
  },
  headerSubtitle: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tabButtonWrapper: {
    flex: 1,
  },
  errorBox: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  tabContent: {
    flex: 1,
  },
  searchWrapper: {
    marginBottom: spacing.sm,
  },
  searchInputContainer: {
    position: 'relative',
    justifyContent: 'center',
    marginTop: 6,
  },
  searchInput: {
    height: 54,
    borderWidth: 2,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingRight: 45,
    fontSize: 18,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactsList: {
    flex: 1,
  },
  contactItemWrapper: {
    marginBottom: spacing.sm,
  },
  loadingWrapper: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  manualFormContent: {
    paddingBottom: spacing.xxl,
  },
  textInput: {
    height: 56,
    borderWidth: 2,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    fontSize: 20,
    marginTop: 6,
  },
  inputLabel: {
    marginTop: spacing.md,
  },
  saveBtnWrapper: {
    marginTop: spacing.xl,
  },
});
