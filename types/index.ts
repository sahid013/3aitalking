import * as THREE from 'three';

/**
 * Camera configuration interface
 */
export interface CameraConfig {
  distance: number;
  height: number;
  targetHeight: number;
  fov: number;
}

/**
 * Avatar state and configuration
 */
export interface AvatarState {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  url: string | null;
  morphTargets: Record<string, MorphTargetReference[]>;
}

/**
 * Morph target reference for facial animations
 */
export interface MorphTargetReference {
  mesh: THREE.Mesh;
  index: number;
  influences: number[];
}

/**
 * Viseme data for lip sync
 */
export interface Viseme {
  viseme: string;
  duration: number;
  startTime?: number;
}

/**
 * Viseme map configuration
 */
export interface VisemeConfig {
  name: string;
  value: number;
}

/**
 * Audio manager state
 */
export interface AudioState {
  isRecording: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  volume: number;
}

/**
 * Conversation message
 */
export interface ConversationMessage {
  role: 'student' | 'patient' | 'system';
  text: string;
  timestamp: number;
}

/**
 * Scoring criteria
 */
export interface Score {
  total: number;
  empathy: number;
  diagnosticAccuracy: number;
  communicationSkills: number;
  timeManagement: number;
}

/**
 * Patient scenario configuration
 */
export interface PatientScenario {
  id: string;
  name: string;
  type: string;
  condition: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  learningObjectives: string[];
  patientProfile: PatientProfile;
  requiredQuestions?: RequiredQuestion[];
}

/**
 * Patient profile
 */
export interface PatientProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  chiefComplaint: string;
  medicalHistory: string[];
  familyHistory?: string[];
  medications: string[];
  allergies?: string[];
}

/**
 * Required questions for scoring
 */
export interface RequiredQuestion {
  keyword: string;
  question: string;
  points: number;
  asked: boolean;
}

/**
 * Session feedback
 */
export interface SessionFeedback {
  overall: string;
  strengths: string[];
  improvements: string[];
}

/**
 * Session result
 */
export interface SessionResult {
  score: Score;
  feedback: SessionFeedback;
  conversationHistory: ConversationMessage[];
  duration: number;
}

/**
 * App configuration
 */
export interface AppConfig {
  camera: CameraConfig;
  avatar: {
    defaultUrl: string;
    fallbackEnabled: boolean;
  };
  audio: {
    enabled: boolean;
    sampleRate: number;
  };
  lipSync: {
    enabled: boolean;
    smoothing: number;
  };
}
