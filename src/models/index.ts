export interface Contact {
  id: string;
  name: string;
  relationship?: string;
  phoneNumber: string;
  isEmergencyContact: boolean;
  photoUri?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  instructions?: string;
  createdAt: string;
}

export interface MedicationAlarm {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string; // 'HH:MM' 24h
  frequency: 'daily' | 'specific_days';
  daysOfWeek?: number[];
  isActive: boolean;
  androidAlarmId?: number;
}

export interface Lesson {
  id: string;
  module: 'whatsapp' | 'camera' | 'gallery' | 'security' | 'calls' | 'audio' | string;
  title: string;
  description: string;
  totalSteps: number;
  orderIndex: number;
}

export interface LearningProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  lastStepCompleted: number;
  difficultyLevel: 'easy' | 'normal' | 'challenging';
  updatedAt: string;
}

export interface DeviceSession {
  deviceUuid: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: string | null;
  createdAt: string;
}

export interface SimulatorStep {
  stepIndex: number;
  title: string;
  instruction: string;
  hint: string;
  targetAction: string;
  completedExplanation: string;
}

export interface LearningEvent {
  id: string;
  lessonId: string;
  stepIndex: number;
  eventType: 'success' | 'error' | 'retry' | 'hint_requested';
  timeSpentSeconds: number;
  errorDetails?: string;
  createdAt?: string;
}

export interface PedagogyProfile {
  difficultyRecommended: 'easy' | 'normal' | 'challenging';
  speechRate: number;
  showInstantHints: boolean;
  feedbackMessage: string;
  encouragementText: string;
}

export interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  streamUrl: string;
  genre?: string;
}

export type RadioPlaybackState = 'stopped' | 'loading' | 'playing' | 'paused' | 'error';


