import { useState, useEffect, useCallback } from 'react';
import { sosService, SOSEventDetails } from '../services/SOSService';
import { contactRepository } from '../repositories/ContactRepository';
import { Contact } from '../models';

export const useSOSViewModel = () => {
  const [emergencyContact, setEmergencyContact] = useState<Contact | null>(null);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [sosResult, setSosResult] = useState<SOSEventDetails | null>(null);

  useEffect(() => {
    contactRepository.getPrimaryEmergencyContact().then(setEmergencyContact);
  }, []);

  const triggerSOS = useCallback(async () => {
    setIsActivating(true);
    try {
      const result = await sosService.triggerEmergencyProtocol();
      setSosResult(result);
    } catch (err) {
      console.warn('Error en protocolo SOS:', err);
    } finally {
      setIsActivating(false);
    }
  }, []);

  return {
    emergencyContact,
    isActivating,
    sosResult,
    triggerSOS,
  };
};
