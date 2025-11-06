import { Viseme, VisemeConfig } from '@/types';
import { AvatarManager } from './AvatarManager';

/**
 * LipSyncManager - Professional TypeScript implementation
 * Handles lip synchronization using viseme-based animation
 */
export class LipSyncManager {
  private avatarManager: AvatarManager | null = null;
  private isEnabled: boolean = false;
  private visemeQueue: Array<Viseme & { data: VisemeConfig }> = [];
  private currentMorphValues: Record<string, number> = {};
  private targetMorphValues: Record<string, number> = {};
  private smoothing: number = 0.15; // Slower smoothing for more natural movement

  // Viseme mapping - VERY CONSERVATIVE VALUES to prevent full-face morphing
  // Only use minimal mouth movements
  private readonly visemeMap: Record<string, VisemeConfig> = {
    // Silence - closed mouth
    sil: { name: 'mouthOpen', value: 0.0 },

    // Consonants - VERY slight mouth opening
    PP: { name: 'mouthOpen', value: 0.02 },  // P, B, M - lips closed
    FF: { name: 'mouthOpen', value: 0.03 },  // F, V - bottom lip to teeth
    TH: { name: 'mouthOpen', value: 0.03 },  // TH - tongue between teeth
    DD: { name: 'mouthOpen', value: 0.04 },  // D, T - tongue to roof
    kk: { name: 'mouthOpen', value: 0.03 },  // K, G - back of tongue
    CH: { name: 'mouthOpen', value: 0.04 },  // CH, J
    SS: { name: 'mouthOpen', value: 0.03 },  // S, Z
    nn: { name: 'mouthOpen', value: 0.03 },  // N, NG
    RR: { name: 'mouthOpen', value: 0.04 },  // R

    // Vowels - slightly wider but still very conservative
    aa: { name: 'mouthOpen', value: 0.08 },  // AA, AE - wide open
    E: { name: 'mouthOpen', value: 0.06 },   // E, EH - medium open
    I: { name: 'mouthOpen', value: 0.05 },   // I, IH - small open with smile
    O: { name: 'mouthOpen', value: 0.07 },   // O, OW - rounded open
    U: { name: 'mouthOpen', value: 0.05 },   // U, UW - rounded small
  };

  constructor() {
    console.log('✓ LipSyncManager initialized');
  }

  /**
   * Set avatar manager reference
   */
  setAvatarManager(manager: AvatarManager): void {
    console.log('🔗 setAvatarManager called with:', manager);
    console.log('🔗 Manager has morph targets:', Object.keys(manager.morphTargets).length > 0);
    console.log('🔗 Available morph targets:', Object.keys(manager.morphTargets));

    this.avatarManager = manager;
    this.isEnabled = true;

    console.log('✅ Avatar manager connected to LipSync - isEnabled:', this.isEnabled);
  }

  /**
   * Trigger a viseme animation
   */
  triggerViseme(viseme: string, duration: number = 100): void {
    if (!this.isEnabled) {
      return;
    }

    const visemeData = this.visemeMap[viseme];
    if (!visemeData) {
      return;
    }

    this.visemeQueue.push({
      viseme,
      duration,
      startTime: Date.now(),
      data: visemeData,
    });
  }

  /**
   * Play sequence of visemes
   */
  playVisemeSequence(sequence: Viseme[]): void {
    if (!this.isEnabled) return;

    let offset = 0;
    sequence.forEach((item) => {
      setTimeout(() => {
        this.triggerViseme(item.viseme, item.duration);
      }, offset);
      offset += item.duration;
    });

    console.log(`Playing viseme sequence: ${sequence.length} items`);
  }

  /**
   * Update lip sync (called every frame)
   */
  update(delta: number): void {
    if (!this.isEnabled || !this.avatarManager) return;

    const currentTime = Date.now();

    // Process viseme queue
    if (this.visemeQueue.length > 0) {
      const current = this.visemeQueue[0];
      const elapsed = currentTime - current.startTime!;

      if (elapsed >= current.duration) {
        this.visemeQueue.shift();
        this.resetToNeutral();
      } else {
        this.applyViseme(current.data);
      }
    }

    // Smooth transitions
    this.smoothMorphTargets(delta);
  }

  /**
   * Apply viseme to avatar
   */
  private applyViseme(visemeData: VisemeConfig): void {
    // Set target value - smoothing will gradually move towards it
    this.targetMorphValues[visemeData.name] = visemeData.value;

    // Initialize current value if needed
    if (!this.currentMorphValues[visemeData.name]) {
      this.currentMorphValues[visemeData.name] = 0;
    }
  }

  /**
   * Smooth morph target transitions
   */
  private smoothMorphTargets(delta: number): void {
    if (!this.avatarManager) return;

    // Get all morph names from both current and target
    const allMorphNames = new Set([
      ...Object.keys(this.currentMorphValues),
      ...Object.keys(this.targetMorphValues)
    ]);

    for (const morphName of allMorphNames) {
      const targetValue = this.targetMorphValues[morphName] || 0;
      const currentValue = this.currentMorphValues[morphName] || 0;

      // Smooth lerp towards target (framerate-independent)
      const lerpFactor = 1 - Math.pow(1 - this.smoothing, delta * 60);
      const newValue = currentValue + (targetValue - currentValue) * lerpFactor;

      // Apply to avatar (only if value is significant)
      if (Math.abs(newValue) > 0.01) {
        this.avatarManager.setMorphTargetValue(morphName, newValue);
        this.currentMorphValues[morphName] = newValue;
      } else {
        // Clean up near-zero values
        this.avatarManager.setMorphTargetValue(morphName, 0);
        delete this.currentMorphValues[morphName];
        delete this.targetMorphValues[morphName];
      }
    }
  }

  /**
   * Get current morph value
   */
  private getCurrentMorphValue(morphName: string): number {
    return this.currentMorphValues[morphName] || 0;
  }

  /**
   * Reset to neutral expression
   */
  resetToNeutral(): void {
    // Set all targets to zero, smoothing will gradually close the mouth
    for (const morphName in this.targetMorphValues) {
      this.targetMorphValues[morphName] = 0;
    }
  }

  /**
   * Enable/disable lip sync
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.resetToNeutral();
      this.visemeQueue = [];
    }
  }

  /**
   * Test lip sync with sample animation
   */
  testLipSync(): void {
    console.log('🧪 Testing lip sync with mouthOpen morph target...');
    console.log('🧪 Avatar manager available:', !!this.avatarManager);
    console.log('🧪 Lip sync enabled:', this.isEnabled);

    // Direct test: manually set mouthOpen to see if it works
    if (this.avatarManager) {
      console.log('🧪 Testing direct morph target control...');
      this.avatarManager.setMorphTargetValue('mouthOpen', 1.0);

      setTimeout(() => {
        this.avatarManager!.setMorphTargetValue('mouthOpen', 0.0);
        console.log('🧪 Direct test complete - if mouth didn\'t move, morph targets aren\'t working');
      }, 1000);
    }

    const testSequence: Viseme[] = [
      { viseme: 'sil', duration: 200 },
      { viseme: 'aa', duration: 500 },
      { viseme: 'sil', duration: 200 },
      { viseme: 'O', duration: 500 },
      { viseme: 'sil', duration: 200 },
    ];

    this.playVisemeSequence(testSequence);
  }

  /**
   * Integrate external viseme data
   */
  integrateExternalVisemeData(data: {
    visemes: Array<{ viseme: string; time: number }>;
    duration: number;
  }): void {
    console.log(`Loading ${data.visemes.length} visemes`);

    for (let i = 0; i < data.visemes.length; i++) {
      const current = data.visemes[i];
      const next = data.visemes[i + 1];

      const duration = next ? (next.time - current.time) * 1000 : 100;

      setTimeout(() => {
        this.triggerViseme(current.viseme, duration);
      }, current.time * 1000);
    }
  }
}
