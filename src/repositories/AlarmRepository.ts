import { getDatabase } from '../storage/database';
import { MedicationAlarm } from '../models';

export class AlarmRepository {
  private static instance: AlarmRepository;

  private constructor() {}

  public static getInstance(): AlarmRepository {
    if (!AlarmRepository.instance) {
      AlarmRepository.instance = new AlarmRepository();
    }
    return AlarmRepository.instance;
  }

  private hasCheckedInitialSeed: boolean = false;

  /**
   * Obtiene todas las alarmas de medicamentos configuradas
   */
  public async getAllAlarms(): Promise<MedicationAlarm[]> {
    const db = await getDatabase();

    // Solo sembrar en la primera instalación, nunca al borrar
    if (!this.hasCheckedInitialSeed) {
      this.hasCheckedInitialSeed = true;
      try {
        const settings = await db.getAllAsync<any>('SELECT value FROM app_settings WHERE key = ?', ['alarms_seeded']);
        if (settings.length === 0) {
          await this.seedInitialData();
          await db.runAsync('INSERT INTO app_settings (key, value) VALUES (?, ?)', ['alarms_seeded', 'true']);
        }
      } catch {}
    }

    const rows = await db.getAllAsync<any>(
      'SELECT id, medication_id, medication_name, time, frequency, days_of_week, is_active, android_alarm_id FROM alarms ORDER BY time ASC'
    );

    return rows.map(r => ({
      id: r.id,
      medicationId: r.medication_id,
      medicationName: r.medication_name,
      time: r.time,
      frequency: r.frequency as 'daily' | 'specific_days',
      daysOfWeek: r.days_of_week ? JSON.parse(r.days_of_week) : undefined,
      isActive: Boolean(r.is_active),
      androidAlarmId: r.android_alarm_id,
    }));
  }

  /**
   * Actualiza una alarma existente (hora, nombre, etc.)
   */
  public async updateAlarm(alarm: MedicationAlarm): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE alarms SET medication_name = ?, time = ?, frequency = ?, is_active = ? WHERE id = ?',
      [alarm.medicationName, alarm.time, alarm.frequency, alarm.isActive ? 1 : 0, alarm.id]
    );
  }

  /**
   * Inserta una nueva alarma de medicamento
   */
  public async createAlarm(alarm: Omit<MedicationAlarm, 'id'>): Promise<MedicationAlarm> {
    const db = await getDatabase();
    const id = Date.now().toString();
    const daysJson = alarm.daysOfWeek ? JSON.stringify(alarm.daysOfWeek) : null;
    const androidAlarmId = Math.floor(Math.random() * 100000);

    await db.runAsync(
      `INSERT INTO alarms (id, medication_id, medication_name, time, frequency, days_of_week, is_active, android_alarm_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        alarm.medicationId,
        alarm.medicationName,
        alarm.time,
        alarm.frequency,
        daysJson,
        alarm.isActive ? 1 : 0,
        androidAlarmId,
      ]
    );

    return {
      ...alarm,
      id,
      androidAlarmId,
    };
  }

  /**
   * Activa o desactiva una alarma
   */
  public async toggleAlarm(id: string, isActive: boolean): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE alarms SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  }

  /**
   * Elimina una alarma por ID
   */
  public async deleteAlarm(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM alarms WHERE id = ?', [id]);
  }

  /**
   * Semilla inicial con medicamentos comunes para adultos mayores
   */
  public async seedInitialData(): Promise<void> {
    const db = await getDatabase();
    const existing = await db.getAllAsync('SELECT id FROM alarms LIMIT 1');
    if (existing.length === 0) {
      await db.runAsync(
        `INSERT INTO alarms (id, medication_id, medication_name, time, frequency, days_of_week, is_active, android_alarm_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['alarm-1', 'med-1', 'Losartán 50mg', '08:00', 'daily', null, 1, 101]
      );
      await db.runAsync(
        `INSERT INTO alarms (id, medication_id, medication_name, time, frequency, days_of_week, is_active, android_alarm_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['alarm-2', 'med-2', 'Metformina 850mg', '14:00', 'daily', null, 1, 102]
      );
    }
  }
}

export const alarmRepository = AlarmRepository.getInstance();
