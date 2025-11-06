import { LipSyncManager } from '@/lib/managers/LipSyncManager_v2';

/**
 * Speech Service - Updated to work with TalkingHead-style lip-sync
 */
export class SpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private lipSyncManager: LipSyncManager | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
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

  setLipSyncManager(manager: LipSyncManager): void {
    console.log('🔗 Lip sync manager connected to speech service (v2)');
    this.lipSyncManager = manager;
  }

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

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Play audio with TalkingHead-style lip sync
   */
  async playAudioWithLipSync(audioBuffer: ArrayBuffer, text: string): Promise<void> {
    console.log('🔊 Playing audio with TalkingHead-style lip-sync');
    console.log('📝 Text:', text.substring(0, 50) + '...');

    if (!this.audioContext || !this.lipSyncManager) {
      console.warn('⚠️ Missing audio context or lip sync manager');
      return this.speak(text);
    }

    try {
      // Decode audio to get duration
      const decodedAudio = await this.audioContext.decodeAudioData(audioBuffer.slice(0));
      const audioDuration = decodedAudio.duration;

      console.log('🎵 Audio duration:', audioDuration.toFixed(2), 'seconds');

      // Load text and create animation timeline
      this.lipSyncManager.loadTextWithDuration(text, audioDuration);

      // Create and configure audio source
      const source = this.audioContext.createBufferSource();
      source.buffer = decodedAudio;
      source.connect(this.audioContext.destination);

      // Start lip-sync animation BEFORE audio starts
      this.lipSyncManager.start();

      // Start audio playback
      source.start(0);

      console.log('▶️ Audio + lip-sync playback started');

      // Wait for audio to finish
      return new Promise((resolve) => {
        source.onended = () => {
          console.log('✅ Audio playback finished');
          this.lipSyncManager?.stop();
          resolve();
        };
      });
    } catch (error) {
      console.error('❌ Error playing audio with lip sync:', error);
      return this.speak(text);
    }
  }

  /**
   * Speak with Web Speech API (fallback)
   */
  async speak(text: string): Promise<void> {
    console.log('🔊 Speaking with Web Speech API (fallback)');

    if (!this.synthesis) {
      throw new Error('Speech synthesis not supported');
    }

    // Estimate duration for timeline
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 2.5) + 0.5;

    if (this.lipSyncManager) {
      this.lipSyncManager.loadTextWithDuration(text, estimatedDuration);
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = this.synthesis!.getVoices();
      const femaleVoice = voices.find(
        (v) => v.name.includes('Female') || v.name.includes('Google US English')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => {
        // Start lip-sync when speech starts
        this.lipSyncManager?.start();
      };

      utterance.onend = () => {
        this.lipSyncManager?.stop();
        resolve();
      };

      utterance.onerror = (event) => {
        this.lipSyncManager?.stop();
        reject(new Error(event.error));
      };

      this.synthesis!.speak(utterance);
    });
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  isSpeechSynthesisSupported(): boolean {
    return this.synthesis !== null;
  }
}
