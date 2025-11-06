/**
 * Application configuration
 * Centralizes all config values and environment variables
 */

export const config = {
  openai: {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    model: 'gpt-4o-mini', // Fast and cost-effective
    maxTokens: 150,
    temperature: 0.8,
  },

  azure: {
    speechKey: process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || '',
    speechRegion: process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || 'eastus',
    voiceName: 'en-US-JennyNeural', // Female voice
  },

  conversation: {
    defaultPatientRole:
      process.env.NEXT_PUBLIC_DEFAULT_PATIENT_ROLE ||
      'You are a patient experiencing symptoms. Respond naturally to the doctor\'s questions.',
    maxHistoryLength: 20,
  },

  audio: {
    sampleRate: 16000,
    channels: 1,
  },
} as const;

/**
 * Validate required configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.openai.apiKey) {
    errors.push('OpenAI API key is missing. Please set NEXT_PUBLIC_OPENAI_API_KEY in .env.local');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
