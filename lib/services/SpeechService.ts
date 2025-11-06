import { LipSyncManager } from '@/lib/managers/LipSyncManager';
import { enhancedTextToVisemes } from '@/lib/utils/TextToViseme';

/**
 * Speech Service
 * Handles speech recognition and text-to-speech with lip sync
 */
export class SpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private lipSyncManager: LipSyncManager | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize Web Speech API
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }

      this.synthesis = window.speechSynthesis;
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Set lip sync manager for avatar animation
   */
  setLipSyncManager(manager: LipSyncManager): void {
    console.log('🔗 Lip sync manager connected to speech service');
    this.lipSyncManager = manager;
  }

  /**
   * Start listening for speech input
   */
  async startListening(): Promise<string> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(event.error));
      };

      this.recognition.start();
    });
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Speak text with improved lip sync
   * Uses text-to-viseme conversion with estimated timing
   */
  async speak(text: string): Promise<void> {
    console.log('🔊 Speaking with Web Speech API:', text.substring(0, 50) + '...');
    console.log('🎭 Lip sync manager available:', !!this.lipSyncManager);

    if (!this.synthesis) {
      throw new Error('Speech synthesis not supported');
    }

    // Estimate duration based on text length and speech rate
    // Average speaking rate: ~150 words per minute = ~2.5 words per second
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 2.5) + 0.5; // Add 0.5s buffer

    // Generate viseme data
    const visemeData = this.lipSyncManager ?
      enhancedTextToVisemes(text, estimatedDuration) :
      null;

    if (visemeData && this.lipSyncManager) {
      console.log('🎭 Scheduling', visemeData.visemes.length, 'visemes for Web Speech API');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Use a voice if available
      const voices = this.synthesis!.getVoices();
      const femaleVoice = voices.find(
        (v) => v.name.includes('Female') || v.name.includes('Google US English')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      // Start lip sync when speech starts
      utterance.onstart = () => {
        // Schedule visemes if available
        if (visemeData && this.lipSyncManager) {
          this.scheduleVisemes(visemeData, 0);
        }
      };

      utterance.onend = () => {
        if (this.lipSyncManager) {
          this.lipSyncManager.resetToNeutral();
        }
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(event.error));
      };

      this.synthesis!.speak(utterance);
    });
  }

  /**
   * Play audio buffer with precise text-based lip sync
   * Uses text-to-viseme conversion for accurate lip movements (TalkingHead approach)
   */
  async playAudioWithLipSync(audioBuffer: ArrayBuffer, text: string): Promise<void> {
    console.log('🔊 Playing audio with OpenAI TTS:', text.substring(0, 50) + '...');
    console.log('🎭 Lip sync manager available:', !!this.lipSyncManager);
    console.log('🎵 Audio context available:', !!this.audioContext);

    if (!this.audioContext || !this.lipSyncManager) {
      console.warn('⚠️ Missing audio context or lip sync manager, falling back to Web Speech API');
      return this.speak(text);
    }

    try {
      // Decode audio to get duration
      const decodedAudio = await this.audioContext.decodeAudioData(audioBuffer.slice(0));
      const audioDuration = decodedAudio.duration;

      console.log('🎵 Audio duration:', audioDuration, 'seconds');

      // Convert text to viseme sequence with precise timing
      const visemeData = enhancedTextToVisemes(text, audioDuration);

      console.log('🎭 Generated', visemeData.visemes.length, 'visemes');
      console.log('🎭 Viseme sequence:', visemeData.visemes.join(', '));

      // Create audio source
      const source = this.audioContext.createBufferSource();
      source.buffer = decodedAudio;
      source.connect(this.audioContext.destination);

      // Schedule visemes to play at precise times
      const startTime = this.audioContext.currentTime;
      this.scheduleVisemes(visemeData, startTime);

      // Start audio playback
      source.start(0);

      console.log('▶️ Audio playback started with', visemeData.visemes.length, 'scheduled visemes');

      // Wait for audio to finish
      return new Promise((resolve) => {
        source.onended = () => {
          console.log('✅ Audio playback finished');
          this.lipSyncManager?.resetToNeutral();
          resolve();
        };
      });
    } catch (error) {
      console.error('❌ Error playing audio with lip sync:', error);
      // Fallback to basic speak
      return this.speak(text);
    }
  }

  /**
   * Schedule visemes to play at precise times synchronized with audio
   */
  private scheduleVisemes(
    visemeData: { visemes: string[]; times: number[]; durations: number[] },
    _audioStartTime: number
  ): void {
    if (!this.lipSyncManager) return;

    const lipSync = this.lipSyncManager;

    for (let i = 0; i < visemeData.visemes.length; i++) {
      const viseme = visemeData.visemes[i];
      const time = visemeData.times[i];
      const duration = visemeData.durations[i];

      // Schedule viseme to trigger at the correct time
      setTimeout(() => {
        lipSync.triggerViseme(viseme, duration * 1000); // Convert to ms
      }, time * 1000); // Convert to ms
    }

    console.log('📅 Scheduled', visemeData.visemes.length, 'visemes');
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Check if speech recognition is supported
   */
  isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Check if speech synthesis is supported
   */
  isSpeechSynthesisSupported(): boolean {
    return this.synthesis !== null;
  }
}
