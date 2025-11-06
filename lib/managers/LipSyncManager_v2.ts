import { AvatarManager } from './AvatarManager';
import { enhancedTextToVisemes } from '@/lib/utils/TextToViseme';

/**
 * LipSyncManager - Proper implementation based on TalkingHead
 * Uses animation timeline with interpolated keyframes
 */

interface VisemeKeyframe {
  viseme: string;
  timestamps: [number, number, number]; // [start, peak, end] in seconds
  value: number; // Peak morph value
}

export class LipSyncManager {
  private avatarManager: AvatarManager | null = null;
  private isEnabled: boolean = false;
  private timeline: VisemeKeyframe[] = [];
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private currentTime: number = 0;

  // Map viseme codes to actual morph target names
  private readonly visemeToMorph: Record<string, string> = {
    'sil': 'mouthOpen',
    'PP': 'mouthOpen',
    'FF': 'mouthOpen',
    'TH': 'mouthOpen',
    'DD': 'mouthOpen',
    'kk': 'mouthOpen',
    'CH': 'mouthOpen',
    'SS': 'mouthOpen',
    'nn': 'mouthOpen',
    'RR': 'mouthOpen',
    'aa': 'mouthOpen',
    'E': 'mouthOpen',
    'I': 'mouthOpen',
    'O': 'mouthOpen',
    'U': 'mouthOpen',
  };

  // Peak morph values for each viseme (following TalkingHead)
  private readonly visemeValues: Record<string, number> = {
    'sil': 0.0,
    'PP': 0.9,  // Lip closure
    'FF': 0.9,  // Lip-teeth
    'TH': 0.6,
    'DD': 0.6,
    'kk': 0.6,
    'CH': 0.6,
    'SS': 0.6,
    'nn': 0.6,
    'RR': 0.6,
    'aa': 0.6,  // Open vowels
    'E': 0.6,
    'I': 0.6,
    'O': 0.6,
    'U': 0.6,
  };

  constructor() {
    console.log('✓ LipSyncManager v2 initialized (TalkingHead-based)');
  }

  setAvatarManager(manager: AvatarManager): void {
    this.avatarManager = manager;
    this.isEnabled = true;
    console.log('✅ Avatar manager connected to LipSync v2');
  }

  /**
   * Load text with audio duration and create animation timeline
   * This follows TalkingHead's approach
   */
  loadTextWithDuration(text: string, audioDurationSeconds: number): void {
    console.log('📝 Loading text with duration:', audioDurationSeconds, 'seconds');

    // Convert text to visemes with timing
    const visemeData = enhancedTextToVisemes(text, audioDurationSeconds);

    // Create timeline with interpolated keyframes (TalkingHead style)
    this.timeline = [];

    for (let i = 0; i < visemeData.visemes.length; i++) {
      const viseme = visemeData.visemes[i];
      const startTime = visemeData.times[i];
      const duration = visemeData.durations[i];

      // TalkingHead uses 3 timestamps: [start, peak, end]
      // They ramp UP to the viseme, hold it, then ramp DOWN
      const timestamps: [number, number, number] = [
        startTime - Math.min(0.06, (2 * duration) / 3), // Ramp start (60ms before or 2/3 duration)
        startTime + Math.min(0.025, duration / 2),      // Peak (25ms after or 1/2 duration)
        startTime + duration + Math.min(0.06, duration / 2), // Ramp end
      ];

      this.timeline.push({
        viseme,
        timestamps,
        value: this.visemeValues[viseme] || 0.6,
      });
    }

    console.log(`✅ Timeline created with ${this.timeline.length} keyframes`);
  }

  /**
   * Start playback synchronized with audio
   */
  start(): void {
    this.isPlaying = true;
    this.startTime = performance.now() / 1000;
    this.currentTime = 0;
    console.log('▶️ Lip-sync playback started');
  }

  /**
   * Stop playback
   */
  stop(): void {
    this.isPlaying = false;
    this.resetToNeutral();
    console.log('⏹️ Lip-sync playback stopped');
  }

  /**
   * Update method called every frame (TalkingHead approach)
   * This interpolates between keyframes based on current time
   */
  update(delta: number): void {
    if (!this.isEnabled || !this.avatarManager || !this.isPlaying) return;

    // Calculate current playback time
    this.currentTime = (performance.now() / 1000) - this.startTime;

    // Track active morph targets for this frame
    const activeMorphs: Record<string, number> = {};

    // Process all keyframes to find active visemes
    for (const keyframe of this.timeline) {
      const [startTime, peakTime, endTime] = keyframe.timestamps;

      if (this.currentTime < startTime || this.currentTime > endTime) {
        continue; // Not active
      }

      const morphName = this.visemeToMorph[keyframe.viseme];
      if (!morphName) continue;

      let interpolatedValue = 0;

      if (this.currentTime <= peakTime) {
        // Ramp UP: interpolate from 0 to peak value
        const progress = (this.currentTime - startTime) / (peakTime - startTime);
        interpolatedValue = keyframe.value * progress;
      } else {
        // Ramp DOWN: interpolate from peak to 0
        const progress = (this.currentTime - peakTime) / (endTime - peakTime);
        interpolatedValue = keyframe.value * (1 - progress);
      }

      // Accumulate (in case multiple visemes overlap)
      activeMorphs[morphName] = Math.max(
        activeMorphs[morphName] || 0,
        interpolatedValue
      );
    }

    // Apply morph targets
    for (const [morphName, value] of Object.entries(activeMorphs)) {
      this.avatarManager.setMorphTargetValue(morphName, value);
    }

    // Reset morphs not in the active list
    const allMorphs = new Set(Object.values(this.visemeToMorph));
    for (const morphName of allMorphs) {
      if (!activeMorphs[morphName]) {
        this.avatarManager.setMorphTargetValue(morphName, 0);
      }
    }
  }

  /**
   * Reset all morph targets to neutral
   */
  private resetToNeutral(): void {
    if (!this.avatarManager) return;

    const allMorphs = new Set(Object.values(this.visemeToMorph));
    for (const morphName of allMorphs) {
      this.avatarManager.setMorphTargetValue(morphName, 0);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Check if playback is finished
   */
  isFinished(): boolean {
    if (!this.isPlaying || this.timeline.length === 0) return true;

    const lastKeyframe = this.timeline[this.timeline.length - 1];
    const endTime = lastKeyframe.timestamps[2];

    return this.currentTime > endTime;
  }
}
