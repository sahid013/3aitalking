import { OpenAIService } from '@/lib/services/OpenAIService';
import { SpeechService } from '@/lib/services/SpeechService_v2';
import { ConversationMessage, PatientScenario } from '@/types';

/**
 * Conversation Manager
 * Orchestrates conversation flow between student and AI patient
 */
export class ConversationManager {
  private openAIService: OpenAIService;
  public speechService: SpeechService; // Made public for lip sync connection
  private conversationHistory: ConversationMessage[] = [];
  private currentScenario: PatientScenario | null = null;
  private isActive: boolean = false;

  // Callbacks
  private onMessageCallback?: (message: ConversationMessage) => void;
  private onStateChangeCallback?: (state: 'idle' | 'listening' | 'thinking' | 'speaking') => void;

  constructor(speechService: SpeechService) {
    this.openAIService = new OpenAIService();
    this.speechService = speechService;
  }

  /**
   * Set message callback
   */
  onMessage(callback: (message: ConversationMessage) => void): void {
    this.onMessageCallback = callback;
  }

  /**
   * Set state change callback
   */
  onStateChange(callback: (state: 'idle' | 'listening' | 'thinking' | 'speaking') => void): void {
    this.onStateChangeCallback = callback;
  }

  /**
   * Start a conversation session
   */
  async startSession(scenario?: PatientScenario): Promise<void> {
    console.log('🚀 Starting conversation session...');

    this.isActive = true;
    this.currentScenario = scenario || null;
    this.conversationHistory = [];

    // Ensure lip sync manager is connected to speech service
    if (typeof window !== 'undefined' && (window as any).lipSyncManager) {
      console.log('🔗 Connecting lip sync manager to speech service...');
      this.speechService.setLipSyncManager((window as any).lipSyncManager);
    } else {
      console.warn('⚠️ Lip sync manager not available - avatar may not be loaded');
    }

    // Generate initial greeting
    console.log('💬 Generating patient greeting...');
    const greeting = await this.getPatientGreeting();

    const greetingMessage: ConversationMessage = {
      role: 'patient',
      text: greeting,
      timestamp: Date.now(),
    };

    this.addMessage(greetingMessage);
    console.log('🔊 Speaking greeting:', greeting);
    await this.speakMessage(greeting);
    console.log('✅ Session started successfully');
  }

  /**
   * Process student's voice input
   */
  async processStudentVoiceInput(): Promise<void> {
    try {
      console.log('🎤 Starting voice input...');

      // Ensure lip sync manager is still connected
      if (typeof window !== 'undefined' && (window as any).lipSyncManager) {
        this.speechService.setLipSyncManager((window as any).lipSyncManager);
      }

      this.setState('listening');

      // Listen for speech
      console.log('👂 Listening for speech...');
      const transcript = await this.speechService.startListening();

      console.log('📝 Transcript received:', transcript);

      if (!transcript) {
        console.warn('⚠️ No transcript received');
        this.setState('idle');
        return;
      }

      // Add to conversation
      const studentMessage: ConversationMessage = {
        role: 'student',
        text: transcript,
        timestamp: Date.now(),
      };

      this.addMessage(studentMessage);
      console.log('✅ Student message added:', transcript);

      // Get AI response
      this.setState('thinking');
      console.log('🤔 Getting AI response...');
      const response = await this.getAIResponse();

      console.log('💬 AI response:', response);

      const patientMessage: ConversationMessage = {
        role: 'patient',
        text: response,
        timestamp: Date.now(),
      };

      this.addMessage(patientMessage);

      // Speak response
      console.log('🔊 Speaking response...');
      await this.speakMessage(response);

      console.log('✅ Voice interaction complete');
      this.setState('idle');
    } catch (error) {
      console.error('❌ Error processing voice input:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.setState('idle');
    }
  }

  /**
   * Process text input from student
   */
  async processTextInput(text: string): Promise<void> {
    try {
      const studentMessage: ConversationMessage = {
        role: 'student',
        text,
        timestamp: Date.now(),
      };

      this.addMessage(studentMessage);

      // Get AI response
      this.setState('thinking');
      const response = await this.getAIResponse();

      const patientMessage: ConversationMessage = {
        role: 'patient',
        text: response,
        timestamp: Date.now(),
      };

      this.addMessage(patientMessage);

      // Speak response
      await this.speakMessage(response);

      this.setState('idle');
    } catch (error) {
      console.error('Error processing text input:', error);
      this.setState('idle');
    }
  }

  /**
   * Get AI response from OpenAI
   */
  private async getAIResponse(): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();
    return await this.openAIService.chat(this.conversationHistory, systemPrompt);
  }

  /**
   * Speak a message with lip sync
   */
  private async speakMessage(text: string): Promise<void> {
    this.setState('speaking');

    try {
      // Try to use OpenAI TTS for better quality
      try {
        const audioBuffer = await this.openAIService.generateSpeech(text, 'nova');
        await this.speechService.playAudioWithLipSync(audioBuffer, text);
      } catch (error) {
        console.warn('OpenAI TTS failed, falling back to Web Speech API:', error);
        await this.speechService.speak(text);
      }
    } catch (error) {
      console.error('Error speaking message:', error);
    }

    this.setState('idle');
  }

  /**
   * Build system prompt based on scenario
   */
  private buildSystemPrompt(): string {
    if (!this.currentScenario) {
      return `You are a patient experiencing medical symptoms.
      Respond naturally and realistically to the doctor's questions.
      Do not provide medical diagnoses yourself - you are the patient, not the doctor.
      Show appropriate emotion and concern about your symptoms.`;
    }

    const profile = this.currentScenario.patientProfile;

    return `You are a ${profile.age}-year-old ${profile.gender} patient.

Chief Complaint: ${profile.chiefComplaint}
Medical History: ${profile.medicalHistory.join(', ')}
Current Medications: ${profile.medications.join(', ')}
${profile.allergies ? `Allergies: ${profile.allergies.join(', ')}` : ''}

Condition: ${this.currentScenario.condition}

Instructions:
- Respond naturally and realistically to the doctor's questions
- Show appropriate emotion and concern about your symptoms
- Provide information when asked, but don't volunteer everything at once
- Remember your medical history and be consistent
- Do NOT provide medical diagnoses - you are the patient
- Stay in character throughout the conversation`;
  }

  /**
   * Generate patient greeting
   */
  private async getPatientGreeting(): Promise<string> {
    if (!this.currentScenario) {
      return 'Hello doctor, thank you for seeing me today.';
    }

    const greetings = [
      `Hello doctor, I've been experiencing ${this.currentScenario.patientProfile.chiefComplaint.toLowerCase()}.`,
      `Good morning doctor, I'm here because ${this.currentScenario.patientProfile.chiefComplaint.toLowerCase()}.`,
      `Hi doctor, I need help with ${this.currentScenario.patientProfile.chiefComplaint.toLowerCase()}.`,
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Add message to history
   */
  private addMessage(message: ConversationMessage): void {
    this.conversationHistory.push(message);
    this.onMessageCallback?.(message);
  }

  /**
   * Set conversation state
   */
  private setState(state: 'idle' | 'listening' | 'thinking' | 'speaking'): void {
    this.onStateChangeCallback?.(state);
  }

  /**
   * End conversation session
   */
  endSession(): void {
    this.isActive = false;
    this.speechService.stopListening();
    this.setState('idle');
  }

  /**
   * Get conversation history
   */
  getHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Check if session is active
   */
  isSessionActive(): boolean {
    return this.isActive;
  }
}
