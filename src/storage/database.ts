import { Platform } from 'react-native';

export interface DatabaseInterface {
  execAsync(sql: string): Promise<void>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
  runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
}

let dbInstance: DatabaseInterface | null = null;

/**
 * Fallback para navegador web (utilizando localStorage como almacén persistente)
 */
class WebDatabaseFallback implements DatabaseInterface {
  private tables: Record<string, any[]> = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('senior_assist_sqlite_store');
        if (stored) {
          this.tables = JSON.parse(stored);
        }
      }
    } catch {
      this.tables = {};
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('senior_assist_sqlite_store', JSON.stringify(this.tables));
      }
    } catch {}
  }

  async execAsync(sql: string): Promise<void> {
    // Inicialización básica de esquemas en memoria
    if (!this.tables['alarms']) this.tables['alarms'] = [];
    if (!this.tables['medications']) this.tables['medications'] = [];
    if (!this.tables['contacts']) this.tables['contacts'] = [];
    this.saveToStorage();
  }

  async getAllAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    this.loadFromStorage();
    if (sql.includes('FROM alarms')) {
      return (this.tables['alarms'] || []) as T[];
    }
    if (sql.includes('FROM medications')) {
      return (this.tables['medications'] || []) as T[];
    }
    if (sql.includes('FROM contacts')) {
      return (this.tables['contacts'] || []) as T[];
    }
    if (sql.includes('FROM lessons')) {
      return (this.tables['lessons'] || []) as T[];
    }
    if (sql.includes('FROM learning_progress')) {
      return (this.tables['learning_progress'] || []) as T[];
    }
    if (sql.includes('FROM learning_events')) {
      return (this.tables['learning_events'] || []) as T[];
    }
    return [] as T[];
  }

  async getFirstAsync<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const list = await this.getAllAsync<T>(sql, params);
    return list.length > 0 ? list[0] : null;
  }

  async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    this.loadFromStorage();
    if (sql.includes('INSERT INTO alarms')) {
      if (!this.tables['alarms']) this.tables['alarms'] = [];
      const [id, medicationId, medicationName, time, frequency, daysOfWeek, isActive, androidAlarmId] = params;
      this.tables['alarms'].push({
        id,
        medication_id: medicationId,
        medication_name: medicationName,
        time,
        frequency,
        days_of_week: daysOfWeek,
        is_active: isActive !== undefined ? isActive : 1,
        android_alarm_id: androidAlarmId,
      });
      this.saveToStorage();
      return { lastInsertRowId: this.tables['alarms'].length, changes: 1 };
    }

    if (sql.includes('UPDATE alarms SET is_active = ? WHERE id = ?')) {
      const [isActive, id] = params;
      const alarm = (this.tables['alarms'] || []).find(a => a.id === id);
      if (alarm) {
        alarm.is_active = isActive;
        this.saveToStorage();
        return { lastInsertRowId: 0, changes: 1 };
      }
    }

    if (sql.includes('DELETE FROM alarms WHERE id = ?')) {
      const [id] = params;
      this.tables['alarms'] = (this.tables['alarms'] || []).filter(a => a.id !== id);
      this.saveToStorage();
      return { lastInsertRowId: 0, changes: 1 };
    }

    if (sql.includes('INSERT INTO contacts')) {
      if (!this.tables['contacts']) this.tables['contacts'] = [];
      const [id, name, relationship, phoneNumber, isEmergencyContact] = params;
      this.tables['contacts'].push({
        id,
        name,
        relationship,
        phone_number: phoneNumber,
        is_emergency_contact: isEmergencyContact !== undefined ? isEmergencyContact : 0,
        created_at: new Date().toISOString(),
      });
      this.saveToStorage();
      return { lastInsertRowId: this.tables['contacts'].length, changes: 1 };
    }

    if (sql.includes('DELETE FROM contacts WHERE id = ?')) {
      const [id] = params;
      this.tables['contacts'] = (this.tables['contacts'] || []).filter(c => c.id !== id);
      this.saveToStorage();
      return { lastInsertRowId: 0, changes: 1 };
    }

    if (sql.includes('INSERT INTO lessons')) {
      if (!this.tables['lessons']) this.tables['lessons'] = [];
      const [id, module, title, description, totalSteps, orderIndex] = params;
      this.tables['lessons'].push({
        id,
        module,
        title,
        description,
        total_steps: totalSteps,
        order_index: orderIndex,
      });
      this.saveToStorage();
      return { lastInsertRowId: this.tables['lessons'].length, changes: 1 };
    }

    if (sql.includes('INSERT OR REPLACE INTO learning_progress') || sql.includes('INSERT INTO learning_progress')) {
      if (!this.tables['learning_progress']) this.tables['learning_progress'] = [];
      const [lessonId, completed, score, attempts, lastStep, difficulty] = params;
      this.tables['learning_progress'] = this.tables['learning_progress'].filter(p => p.lesson_id !== lessonId);
      this.tables['learning_progress'].push({
        lesson_id: lessonId,
        completed,
        score,
        attempts,
        last_step_completed: lastStep,
        difficulty_level: difficulty,
        updated_at: new Date().toISOString(),
      });
      this.saveToStorage();
      return { lastInsertRowId: 1, changes: 1 };
    }

    if (sql.includes('INSERT INTO learning_events')) {
      if (!this.tables['learning_events']) this.tables['learning_events'] = [];
      const [id, lessonId, stepIndex, eventType, timeSpent, errorDetails] = params;
      this.tables['learning_events'].push({
        id,
        lesson_id: lessonId,
        step_index: stepIndex,
        event_type: eventType,
        time_spent_seconds: timeSpent,
        error_details: errorDetails,
        created_at: new Date().toISOString(),
      });
      this.saveToStorage();
      return { lastInsertRowId: this.tables['learning_events'].length, changes: 1 };
    }

    return { lastInsertRowId: 1, changes: 1 };
  }
}

/**
 * Inicializa y retorna la base de datos SQLite
 */
export async function getDatabase(): Promise<DatabaseInterface> {
  if (dbInstance) {
    return dbInstance;
  }

  if (Platform.OS === 'web') {
    dbInstance = new WebDatabaseFallback();
    await initDatabaseSchema(dbInstance);
    return dbInstance;
  }

  try {
    const SQLite = await import('expo-sqlite');
    const nativeDb = await SQLite.openDatabaseAsync('senior_assist.db');
    dbInstance = nativeDb as unknown as DatabaseInterface;
    await initDatabaseSchema(dbInstance);
    return dbInstance;
  } catch (error) {
    console.warn('Fallback a WebDatabaseFallback por error en SQLite nativo:', error);
    dbInstance = new WebDatabaseFallback();
    await initDatabaseSchema(dbInstance);
    return dbInstance;
  }
}

/**
 * Crea las tablas del modelo relacional requeridas en el documento IEEE 830
 */
async function initDatabaseSchema(db: DatabaseInterface): Promise<void> {
  const initSql = `
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      relationship TEXT,
      phone_number TEXT NOT NULL,
      is_emergency_contact INTEGER DEFAULT 0,
      photo_uri TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      priority INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dosage TEXT,
      instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alarms (
      id TEXT PRIMARY KEY,
      medication_id TEXT NOT NULL,
      medication_name TEXT NOT NULL,
      time TEXT NOT NULL,
      frequency TEXT DEFAULT 'daily',
      days_of_week TEXT,
      is_active INTEGER DEFAULT 1,
      android_alarm_id INTEGER UNIQUE
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      module TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      total_steps INTEGER NOT NULL,
      order_index INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS learning_progress (
      lesson_id TEXT PRIMARY KEY,
      completed INTEGER DEFAULT 0,
      score REAL DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      last_step_completed INTEGER DEFAULT 0,
      difficulty_level TEXT DEFAULT 'normal',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS learning_events (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      step_index INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      time_spent_seconds REAL NOT NULL,
      error_details TEXT,
      synced_with_backend INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS device_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      device_uuid TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      token_expiry DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await db.execAsync(initSql);

  // Limpiar cualquier contacto de prueba o ficticio previo ('contact-1', 'contact-2', 'contact-3')
  try {
    await db.execAsync(`
      DELETE FROM contacts 
      WHERE id IN ('contact-1', 'contact-2', 'contact-3') 
         OR phone_number IN ('+573001234567', '+573109876543', '+573155554321')
         OR name IN ('María Gómez', 'Carlos Gómez', 'Dr. Ramírez');
    `);
  } catch (e) {
    console.warn('Advertencia limpiando contactos de prueba:', e);
  }
}
