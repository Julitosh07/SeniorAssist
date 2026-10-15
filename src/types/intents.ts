import { AllowedActionType } from '../constants/actions';

export interface VoiceIntentParameters {
  contact?: string;
  phone_number?: string;
  message?: string;
  medication?: string;
  time?: string;
  frequency?: string;
  station?: string;
  lesson_id?: string;
  module?: string;
  [key: string]: string | undefined;
}

export interface VoiceIntentResponse {
  action: AllowedActionType;
  parameters: VoiceIntentParameters;
  confidence?: number;
  spoken_response?: string;
}

export type AssistantState = 
  | 'idle'
  | 'listening'
  | 'processing'
  | 'success'
  | 'error'
  | 'offline'
  | 'permission_denied';
