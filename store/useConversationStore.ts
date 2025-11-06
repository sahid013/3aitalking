import { create } from 'zustand';
import {
  ConversationMessage,
  Score,
  PatientScenario,
  SessionResult,
} from '@/types';

interface ConversationStore {
  // State
  isActive: boolean;
  currentScenario: PatientScenario | null;
  conversationHistory: ConversationMessage[];
  score: Score;

  // Actions
  startSession: (scenario: PatientScenario) => void;
  endSession: () => SessionResult | null;
  addMessage: (message: ConversationMessage) => void;
  updateScore: (scoreUpdate: Partial<Score>) => void;
  resetScore: () => void;
  clearHistory: () => void;
}

const INITIAL_SCORE: Score = {
  total: 0,
  empathy: 0,
  diagnosticAccuracy: 0,
  communicationSkills: 0,
  timeManagement: 0,
};

export const useConversationStore = create<ConversationStore>((set, get) => ({
  // Initial state
  isActive: false,
  currentScenario: null,
  conversationHistory: [],
  score: INITIAL_SCORE,

  // Actions
  startSession: (scenario) =>
    set({
      isActive: true,
      currentScenario: scenario,
      conversationHistory: [],
      score: INITIAL_SCORE,
    }),

  endSession: () => {
    const state = get();
    if (!state.isActive) return null;

    const result: SessionResult = {
      score: state.score,
      feedback: {
        overall: 'Session completed',
        strengths: [],
        improvements: [],
      },
      conversationHistory: state.conversationHistory,
      duration: state.conversationHistory.length > 0
        ? state.conversationHistory[state.conversationHistory.length - 1].timestamp -
          state.conversationHistory[0].timestamp
        : 0,
    };

    set({ isActive: false });
    return result;
  },

  addMessage: (message) =>
    set((state) => ({
      conversationHistory: [...state.conversationHistory, message],
    })),

  updateScore: (scoreUpdate) =>
    set((state) => ({
      score: { ...state.score, ...scoreUpdate },
    })),

  resetScore: () => set({ score: INITIAL_SCORE }),

  clearHistory: () => set({ conversationHistory: [] }),
}));
