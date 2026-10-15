import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Modal, TextInput, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeaderBar } from '../../components/HeaderBar';
import { AccessibleText } from '../../components/AccessibleText';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleCard } from '../../components/AccessibleCard';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius } from '../../constants/theme';
import { contactRepository } from '../../repositories/ContactRepository';
import { callService } from '../../services/CallService';
import { whatsAppService } from '../../services/WhatsAppService';
import { voiceService } from '../../services/VoiceService';
import { deviceContactsService, SimpleDeviceContact } from '../../services/DeviceContactsService';
import { Contact } from '../../models';

export const ContactsView: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState<string>('Hola, te escribo desde mi aplicación SeniorAssist.');
  const [whatsappModalVisible, setWhatsappModalVisible] = useState<boolean>(false);

  // Estados para nuevo contacto
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newRelation, setNewRelation] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newIsEmergency, setNewIsEmergency] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Estados para importar de la agenda del teléfono
  const [deviceContactsModalVisible, setDeviceContactsModalVisible] = useState<boolean>(false);
  const [deviceContacts, setDeviceContacts] = useState<SimpleDeviceContact[]>([]);
  const [deviceSearchQuery, setDeviceSearchQuery] = useState<string>('');
  const [loadingDeviceContacts, setLoadingDeviceContacts] = useState<boolean>(false);

  const loadContacts = useCallback(async () => {
    const list = await contactRepository.getAllContacts();
    setContacts(list);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleOpenDeviceContacts = async () => {
    setDeviceContactsModalVisible(true);
    setDeviceSearchQuery('');
    setLoadingDeviceContacts(true);
    const list = await deviceContactsService.getAllContacts();
    setDeviceContacts(list);
    setLoadingDeviceContacts(false);

    if (list.length > 0) {
      await voiceService.speak(`Encontré ${list.length} contactos en tu teléfono.`);
    } else {
      await voiceService.speak('No se encontraron contactos en tu teléfono o falta conceder el permiso.');
    }
  };

  const handleImportContactFromDevice = async (devContact: SimpleDeviceContact) => {
    await contactRepository.addContact({
      name: devContact.name,
      phoneNumber: devContact.phoneNumber,
      isEmergencyContact: false,
    });
    await voiceService.speak(`Contacto ${devContact.name} agregado a tus favoritos.`);
    setDeviceContactsModalVisible(false);
    await loadContacts();
  };

  const handleCall = async (contact: Contact) => {
    await callService.makeCall(contact.phoneNumber, contact.name);
  };

  const handleOpenWhatsAppModal = (contact: Contact) => {
    setSelectedContact(contact);
    setWhatsappModalVisible(true);
  };

  const handleSendWhatsApp = async () => {
    if (!selectedContact) return;
    await whatsAppService.prepareMessage(selectedContact.name, messageText);
    setWhatsappModalVisible(false);
  };

  const handleCreateContact = async () => {
    if (!newName.trim()) {
      setFormError('Por favor ingresa el nombre de la persona.');
      return;
    }
    if (!newPhone.trim()) {
      setFormError('Por favor ingresa el número de teléfono.');
      return;
    }

    await contactRepository.addContact({
      name: newName.trim(),
      relationship: newRelation.trim() || undefined,
      phoneNumber: newPhone.trim(),
      isEmergencyContact: newIsEmergency,
    });

    await voiceService.speak(`Contacto ${newName} guardado con éxito.`);
    setAddModalVisible(false);
    setNewName('');
    setNewRelation('');
    setNewPhone('');
    setNewIsEmergency(false);
    setFormError('');
    await loadContacts();
  };

  const handleDeleteContact = async (contact: Contact) => {
    await contactRepository.deleteContact(contact.id);
    await voiceService.speak(`Contacto ${contact.name} eliminado.`);
    await loadContacts();
  };

  // Normalizador sin acentos ni mayúsculas para búsquedas en español (ej: "maria" encuentra "María")
  const normalizeText = (text: string) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Filtrado en tiempo real de contactos guardados
  const filteredContacts = contacts.filter(c => {
    const q = normalizeText(searchQuery);
    if (!q) return true;
    const nameNorm = normalizeText(c.name);
    const relNorm = normalizeText(c.relationship || '');
    const cleanPhone = (c.phoneNumber || '').replace(/\D/g, '');
    const cleanQ = q.replace(/\D/g, '');

    if (cleanQ.length >= 3 && cleanPhone.includes(cleanQ)) {
      return true;
    }
    return nameNorm.includes(q) || relNorm.includes(q);
  });

  // Filtrado de contactos del teléfono
  const filteredDeviceContacts = deviceContacts.filter(c => {
    const q = normalizeText(deviceSearchQuery);
    if (!q) return true;
    const nameNorm = normalizeText(c.name);
    const cleanPhone = (c.phoneNumber || '').replace(/\D/g, '');
    const cleanQ = q.replace(/\D/g, '');

    if (cleanQ.length >= 3 && cleanPhone.includes(cleanQ)) {
      return true;
    }
    const tokens = q.split(/\s+/).filter(t => t.length > 0);
    return tokens.length > 0 && tokens.every(token => nameNorm.includes(token));
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar title="Llamadas y WhatsApp" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <AccessibleCard style={{ borderColor: theme.primary }}>
          <AccessibleText variant="title" weight="heavy" color={theme.primary}>
            👥 Tus Seres Queridos
          </AccessibleText>
          <AccessibleText variant="bodyLarge" weight="medium" style={styles.cardText}>
            Presiona el botón de llamada para llamar de inmediato o el de WhatsApp para escribir un mensaje.
          </AccessibleText>
        </AccessibleCard>

        {/* Botones para registrar o importar contactos */}
        <View style={styles.addContactWrapper}>
          <AccessibleButton
            title="📲 TRAER DE MI CELULAR"
            subtitle="Elige un contacto de tu agenda sin escribir"
            variant="learning"
            minHeight={72}
            onPress={handleOpenDeviceContacts}
          />
          <View style={{ marginTop: spacing.sm }}>
            <AccessibleButton
              title="➕ AGREGAR NUEVO MANUALMENTE"
              subtitle="Escribir nombre y número"
              variant="primary"
              minHeight={64}
              onPress={() => {
                setFormError('');
                setAddModalVisible(true);
              }}
            />
          </View>
        </View>

        <AccessibleText variant="title" weight="heavy" color={theme.textPrimary} style={styles.sectionTitle}>
          Lista de Contactos Frecuentes:
        </AccessibleText>

        {/* Barra de búsqueda de contactos */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.primary,
                color: theme.textPrimary,
              },
            ]}
            placeholder="🔍 Buscar contacto por nombre o parentesco..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Buscar contacto en tu lista"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <AccessibleText variant="title" weight="heavy" color={theme.textSecondary}>
                ✕
              </AccessibleText>
            </TouchableOpacity>
          ) : null}
        </View>

        {filteredContacts.length === 0 ? (
          <AccessibleCard elevated>
            <AccessibleText variant="bodyLarge" weight="medium" align="center" color={theme.textSecondary}>
              {contacts.length === 0
                ? 'Aún no tienes contactos agregados. Presiona "Traer de mi celular" para añadirlos sin escribir.'
                : `No se encontró ningún contacto con "${searchQuery}".`}
            </AccessibleText>
          </AccessibleCard>
        ) : (
          filteredContacts.map(contact => (
            <View key={contact.id} style={styles.contactItemWrapper}>
              <AccessibleCard elevated style={styles.contactCard}>
                <View style={styles.contactHeader}>
                  <View style={{ flex: 1 }}>
                    <AccessibleText variant="title" weight="heavy">
                      {contact.name}
                    </AccessibleText>
                    <AccessibleText variant="body" weight="medium" color={theme.textSecondary}>
                      {contact.relationship ? `Parentesco: ${contact.relationship}` : 'Contacto guardado'}
                    </AccessibleText>
                    <AccessibleText variant="bodyLarge" weight="bold" color={theme.primary} style={styles.phoneText}>
                      {contact.phoneNumber}
                    </AccessibleText>
                  </View>

                  {contact.isEmergencyContact ? (
                    <View style={[styles.emergencyBadge, { backgroundColor: theme.emergency }]}>
                      <AccessibleText variant="caption" weight="bold" color="#FFFFFF">
                        🚨 SOS
                      </AccessibleText>
                    </View>
                  ) : null}
                </View>

                <View style={styles.actionsRow}>
                  <View style={styles.actionBtnItem}>
                    <AccessibleButton
                      title="📞 Llamar"
                      variant="primary"
                      minHeight={60}
                      onPress={() => handleCall(contact)}
                      accessibilityHint={`Inicia de inmediato una llamada telefónica a ${contact.name}`}
                    />
                  </View>
                  <View style={styles.actionBtnItem}>
                    <AccessibleButton
                      title="💬 WhatsApp"
                      variant="learning"
                      minHeight={60}
                      onPress={() => handleOpenWhatsAppModal(contact)}
                      accessibilityHint={`Abre WhatsApp para enviar mensaje a ${contact.name}`}
                    />
                  </View>
                </View>

                <View style={styles.deleteWrapper}>
                  <AccessibleButton
                    title="🗑️ Eliminar de la lista"
                    variant="secondary"
                    minHeight={46}
                    onPress={() => handleDeleteContact(contact)}
                  />
                </View>
              </AccessibleCard>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para escribir / enviar mensaje de WhatsApp */}
      <Modal
        visible={whatsappModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWhatsappModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.learning }]}>
            <AccessibleText variant="header" weight="heavy" align="center" color={theme.learning}>
              Mensaje de WhatsApp
            </AccessibleText>
            <AccessibleText variant="bodyLarge" weight="bold" align="center" style={styles.modalSub}>
              Para: {selectedContact?.name}
            </AccessibleText>

            <AccessibleText variant="body" weight="semibold" style={styles.inputLabel}>
              Mensaje a enviar:
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
              multiline
              numberOfLines={3}
              value={messageText}
              onChangeText={setMessageText}
            />

            <View style={styles.modalButtons}>
              <AccessibleButton
                title="ABRIR EN WHATSAPP 💬"
                variant="learning"
                minHeight={64}
                onPress={handleSendWhatsApp}
              />
              <View style={{ marginTop: spacing.sm }}>
                <AccessibleButton
                  title="Cancelar"
                  variant="secondary"
                  minHeight={52}
                  onPress={() => setWhatsappModalVisible(false)}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para crear un nuevo contacto manualmente */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
            <AccessibleText variant="header" weight="heavy" align="center" color={theme.primary}>
              Nuevo Contacto
            </AccessibleText>

            <AccessibleText variant="bodyLarge" weight="bold" style={styles.inputLabel}>
              Nombre completo:
            </AccessibleText>
            <TextInput
              style={[styles.textInputSimple, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Ejemplo: Carlos Gómez"
              placeholderTextColor={theme.textSecondary}
              value={newName}
              onChangeText={setNewName}
            />

            <AccessibleText variant="bodyLarge" weight="bold" style={styles.inputLabel}>
              Parentesco o relación:
            </AccessibleText>
            <TextInput
              style={[styles.textInputSimple, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Ejemplo: Hijo, Hija, Vecino, Doctor"
              placeholderTextColor={theme.textSecondary}
              value={newRelation}
              onChangeText={setNewRelation}
            />

            <AccessibleText variant="bodyLarge" weight="bold" style={styles.inputLabel}>
              Número de teléfono:
            </AccessibleText>
            <TextInput
              style={[styles.textInputSimple, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Ejemplo: 3001234567"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
              value={newPhone}
              onChangeText={setNewPhone}
            />

            <View style={styles.emergencySwitchRow}>
              <AccessibleText variant="bodyLarge" weight="bold">
                ¿Es contacto de auxilio SOS?
              </AccessibleText>
              <Switch
                value={newIsEmergency}
                onValueChange={setNewIsEmergency}
                thumbColor={newIsEmergency ? theme.emergency : '#ccc'}
              />
            </View>

            {formError ? (
              <AccessibleText variant="body" weight="bold" color={theme.error} style={{ marginTop: spacing.sm }}>
                {formError}
              </AccessibleText>
            ) : null}

            <View style={styles.modalButtons}>
              <AccessibleButton
                title="GUARDAR CONTACTO"
                variant="primary"
                minHeight={64}
                onPress={handleCreateContact}
              />
              <View style={{ marginTop: spacing.sm }}>
                <AccessibleButton
                  title="Cancelar"
                  variant="secondary"
                  minHeight={52}
                  onPress={() => setAddModalVisible(false)}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para importar contactos de la agenda del teléfono */}
      <Modal
        visible={deviceContactsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeviceContactsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, maxHeight: '90%' }]}>
            <AccessibleText variant="title" weight="heavy" color={theme.learning}>
              📲 Agenda de tu Teléfono
            </AccessibleText>
            <AccessibleText variant="body" weight="medium" style={{ marginVertical: spacing.xs }}>
              Toca "Agregar" en el familiar o amigo que desees añadir a tu pantalla:
            </AccessibleText>

            {/* Buscador dentro de los contactos del teléfono */}
            <View style={styles.searchContainer}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.learning,
                    color: theme.textPrimary,
                  },
                ]}
                placeholder="🔍 Escribe nombre o número..."
                placeholderTextColor={theme.textSecondary}
                value={deviceSearchQuery}
                onChangeText={setDeviceSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {deviceSearchQuery ? (
                <TouchableOpacity onPress={() => setDeviceSearchQuery('')} style={styles.clearSearchBtn}>
                  <AccessibleText variant="title" weight="heavy" color={theme.textSecondary}>
                    ✕
                  </AccessibleText>
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView
              style={{ maxHeight: 380, marginVertical: spacing.sm }}
              keyboardShouldPersistTaps="handled"
            >
              {loadingDeviceContacts ? (
                <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={theme.learning} />
                  <AccessibleText variant="bodyLarge" weight="bold" align="center" color={theme.learning} style={{ marginTop: spacing.md }}>
                    Cargando contactos de tu teléfono...
                  </AccessibleText>
                </View>
              ) : deviceContacts.length === 0 ? (
                <View style={{ padding: spacing.md, alignItems: 'center' }}>
                  <AccessibleText variant="bodyLarge" weight="bold" align="center" color={theme.textPrimary}>
                    📱 No pudimos acceder a tus contactos
                  </AccessibleText>
                  <AccessibleText variant="body" align="center" color={theme.textSecondary} style={{ marginTop: spacing.xs, marginBottom: spacing.md }}>
                    Asegúrate de conceder el permiso de lectura de contactos en tu teléfono.
                  </AccessibleText>
                  <AccessibleButton
                    title="🔄 REINTENTAR Y CONCEDER PERMISO"
                    variant="primary"
                    minHeight={58}
                    onPress={async () => {
                      setLoadingDeviceContacts(true);
                      const list = await deviceContactsService.getAllContacts(true);
                      setDeviceContacts(list);
                      setLoadingDeviceContacts(false);
                    }}
                  />
                </View>
              ) : filteredDeviceContacts.length === 0 ? (
                <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
                  <AccessibleText variant="bodyLarge" weight="bold" align="center" color={theme.textPrimary}>
                    No se encontraron contactos para "{deviceSearchQuery}".
                  </AccessibleText>
                  <View style={{ marginTop: spacing.md }}>
                    <AccessibleButton
                      title="✕ Borrar búsqueda"
                      variant="secondary"
                      minHeight={48}
                      onPress={() => setDeviceSearchQuery('')}
                    />
                  </View>
                </View>
              ) : (
                filteredDeviceContacts.map(devC => (
                  <View
                    key={devC.id}
                    style={[
                      styles.devContactCard,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.devContactInfo}>
                      <AccessibleText variant="title" weight="heavy" color={theme.textPrimary} numberOfLines={2}>
                        👤 {devC.name}
                      </AccessibleText>
                      <AccessibleText variant="bodyLarge" weight="heavy" color={theme.primary} style={styles.devPhoneText}>
                        📞 {devC.phoneNumber}
                      </AccessibleText>
                    </View>

                    <View style={styles.devContactActions}>
                      <AccessibleButton
                        title="📞 LLAMAR DIRECTAMENTE"
                        subtitle={`Toca para llamar a ${devC.name}`}
                        variant="primary"
                        minHeight={56}
                        onPress={() => {
                          setDeviceContactsModalVisible(false);
                          callService.makeCall(devC.phoneNumber, devC.name);
                        }}
                        accessibilityHint={`Llama directamente a ${devC.name}`}
                      />

                      <AccessibleButton
                        title="💬 ENVIAR WHATSAPP"
                        subtitle={`Escribe un mensaje de WhatsApp a ${devC.name}`}
                        variant="learning"
                        minHeight={56}
                        onPress={() => {
                          setDeviceContactsModalVisible(false);
                          whatsAppService.openWhatsAppToNumber(devC.phoneNumber, devC.name);
                        }}
                        accessibilityHint={`Escribe por WhatsApp a ${devC.name}`}
                      />

                      <AccessibleButton
                        title="➕ GUARDAR EN FAVORITOS"
                        subtitle="Añadir a tu lista principal de SeniorAssist"
                        variant="secondary"
                        minHeight={54}
                        onPress={() => handleImportContactFromDevice(devC)}
                        accessibilityHint={`Guarda a ${devC.name} en tus contactos frecuentes`}
                      />
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <AccessibleButton
              title="Cerrar"
              variant="secondary"
              minHeight={52}
              onPress={() => setDeviceContactsModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
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
  addContactWrapper: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  searchContainer: {
    position: 'relative',
    marginVertical: spacing.sm,
    justifyContent: 'center',
  },
  searchInput: {
    borderWidth: 2,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingRight: 45,
    fontSize: 18,
    fontWeight: '600',
    minHeight: 52,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactItemWrapper: {
    marginBottom: spacing.sm,
  },
  contactCard: {
    marginVertical: spacing.xs,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  emergencyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  phoneText: {
    marginVertical: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionBtnItem: {
    flex: 1,
  },
  deleteWrapper: {
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    padding: spacing.lg,
  },
  modalSub: {
    marginTop: 4,
    marginBottom: spacing.md,
  },
  inputLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 18,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textInputSimple: {
    borderWidth: 2,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 18,
    fontWeight: '600',
  },
  emergencySwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  modalButtons: {
    marginTop: spacing.lg,
  },
  devContactCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  devContactInfo: {
    marginBottom: spacing.xs,
  },
  devPhoneText: {
    marginTop: 2,
  },
  devContactActions: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  devContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
});
