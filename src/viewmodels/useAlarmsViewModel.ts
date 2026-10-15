import { useState, useEffect, useCallback } from 'react';
import { alarmService } from '../services/AlarmService';
import { MedicationAlarm } from '../models';

export const useAlarmsViewModel = () => {
  const [alarms, setAlarms] = useState<MedicationAlarm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingAlarm, setEditingAlarm] = useState<MedicationAlarm | null>(null);

  const [medName, setMedName] = useState<string>('');
  const [hour12, setHour12] = useState<number>(8);
  const [minute, setMinute] = useState<string>('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const loadAlarms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await alarmService.getAlarms();
      setAlarms(data);
    } catch (err) {
      console.warn('Error al cargar alarmas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlarms();
  }, [loadAlarms]);

  const handleToggleAlarm = async (alarm: MedicationAlarm) => {
    await alarmService.toggleAlarmState(alarm);
    await loadAlarms();
  };

  const handleDeleteAlarm = async (alarm: MedicationAlarm) => {
    await alarmService.removeAlarm(alarm);
    await loadAlarms();
  };

  const openCreateModal = () => {
    setEditingAlarm(null);
    setMedName('');
    setHour12(8);
    setMinute('00');
    setPeriod('AM');
    setErrorMessage('');
    setModalVisible(true);
  };

  const openEditModal = (alarm: MedicationAlarm) => {
    setEditingAlarm(alarm);
    setMedName(alarm.medicationName);
    const converted = alarmService.convert24To12(alarm.time);
    setHour12(converted.hour);
    setMinute(converted.minute);
    setPeriod(converted.period);
    setErrorMessage('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingAlarm(null);
  };

  const handleSaveAlarm = async () => {
    if (!medName.trim()) {
      setErrorMessage('Por favor escribe o dinos el nombre de tu medicamento.');
      return;
    }

    const time24 = alarmService.convert12To24(hour12, minute, period);

    if (editingAlarm) {
      await alarmService.updateAlarm({
        ...editingAlarm,
        medicationName: medName.trim(),
        time: time24,
      });
    } else {
      await alarmService.addAlarm(medName.trim(), time24, 'daily');
    }

    setModalVisible(false);
    setEditingAlarm(null);
    setMedName('');
    setErrorMessage('');
    await loadAlarms();
  };

  const changeHour = (delta: number) => {
    let next = hour12 + delta;
    if (next < 1) next = 12;
    if (next > 12) next = 1;
    setHour12(next);
  };

  const changeMinute = (delta: number) => {
    let current = parseInt(minute, 10) || 0;
    let next = current + delta;
    if (next < 0) next = 59;
    if (next > 59) next = 0;
    setMinute(next < 10 ? `0${next}` : `${next}`);
  };

  const setMinuteDirect = (raw: string) => {
    const clean = raw.replace(/\D/g, '').slice(0, 2);
    if (!clean) {
      setMinute('00');
      return;
    }
    const val = parseInt(clean, 10);
    if (val >= 0 && val <= 59) {
      setMinute(clean.length === 1 ? `0${clean}` : clean);
    }
  };

  const [alarmRingingMedication, setAlarmRingingMedication] = useState<string | null>(null);

  useEffect(() => {
    const unsub = alarmService.onAlarmTriggered((medName) => {
      setAlarmRingingMedication(medName);
    });
    return () => {
      unsub();
    };
  }, []);

  const dismissAlarmModal = useCallback(() => {
    setAlarmRingingMedication(null);
  }, []);

  const handleTestSound = async (alarm: MedicationAlarm) => {
    await alarmService.testAlarmSound(alarm.medicationName);
  };

  return {
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
    formatTime: (time24: string) => alarmService.formatTimeForDisplay(time24),
    alarmRingingMedication,
    dismissAlarmModal,
  };
};
