import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MorphTargetReference } from '@/types';

/**
 * AvatarManager - Professional TypeScript implementation
 * Handles loading, managing, and controlling 3D avatars with morph targets
 */
export class AvatarManager {
  private scene: THREE.Scene;
  private gltfLoader: GLTFLoader;

  public currentAvatar: THREE.Group | null = null;
  public mixer: THREE.AnimationMixer | null = null;
  public animations: THREE.AnimationClip[] = [];
  public morphTargets: Record<string, MorphTargetReference[]> = {};

  private currentAnimation: THREE.AnimationAction | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.gltfLoader = new GLTFLoader();
  }

  /**
   * Load avatar from URL
   */
  async loadAvatar(url?: string): Promise<THREE.Group> {
    const avatarUrl = url || this.getDefaultAvatarUrl();

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        avatarUrl,
        (gltf) => {
          this.onAvatarLoaded(gltf);
          resolve(gltf.scene);
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`Loading avatar: ${percent.toFixed(2)}%`);
        },
        (error) => {
          console.error('Failed to load avatar:', error);
          this.loadFallbackAvatar();
          reject(error);
        }
      );
    });
  }

  /**
   * Handle successful avatar load
   */
  private onAvatarLoaded(gltf: any): void {
    // Remove existing avatar
    if (this.currentAvatar) {
      this.removeAvatar();
    }

    this.currentAvatar = gltf.scene;

    // Configure avatar meshes
    if (!this.currentAvatar) return;

    this.currentAvatar.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Extract morph targets for lip sync (VERY SELECTIVE - only mouth-related)
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          // STRICT filtering: Only apply to head mesh, NOT eyes, NOT entire face
          const meshNameLower = mesh.name.toLowerCase();

          // Skip eye meshes completely
          if (meshNameLower.includes('eye')) {
            console.log('⏭️ Skipping eye mesh:', mesh.name);
            return;
          }

          // Only extract from head/teeth meshes that contain mouth morphs
          const isRelevantMesh = meshNameLower.includes('head') ||
                                 meshNameLower.includes('teeth');

          if (isRelevantMesh) {
            console.log('✅ Extracting morphs from:', mesh.name);
            this.extractMorphTargets(mesh);

            // CRITICAL: Enable morph targets on the material!
            if (mesh.material) {
              console.log('🔍 Checking material for', mesh.name);
              console.log('  Is Array:', Array.isArray(mesh.material));

              if (Array.isArray(mesh.material)) {
                // Handle multiple materials
                mesh.material = mesh.material.map((oldMat: any, idx: number) => {
                  const newMat = oldMat.clone();
                  newMat.morphTargets = true;
                  newMat.morphNormals = true;
                  oldMat.dispose();
                  console.log('  ✓ Recreated material', idx, 'with morph targets for', mesh.name);
                  return newMat;
                });
              } else {
                // Single material - clone it with morphTargets enabled
                const oldMaterial = mesh.material as any;
                const newMaterial = oldMaterial.clone();
                newMaterial.morphTargets = true;
                newMaterial.morphNormals = true;

                // Replace material
                mesh.material = newMaterial;
                oldMaterial.dispose();

                console.log('  ✓ Recreated material with morph targets for', mesh.name);
              }
            }
          }
        }

        // Improve material rendering
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.needsUpdate = true);
          } else {
            mesh.material.needsUpdate = true;
          }
        }
      }
    });

    // Position avatar
    this.currentAvatar.position.set(0, 0, 0);
    this.scene.add(this.currentAvatar);

    // Setup animations
    if (gltf.animations && gltf.animations.length > 0) {
      this.setupAnimations(gltf.animations);
    }

    // Center avatar on ground
    this.centerAvatar();

    console.log('✓ Avatar loaded successfully');
    console.log('📋 Available morph targets:', Object.keys(this.morphTargets));
    console.log('📋 Total morph target count:', Object.keys(this.morphTargets).length);
  }

  /**
   * Extract morph targets from mesh for facial animations
   * ONLY extract mouth-related morphs to prevent full-face deformation
   */
  private extractMorphTargets(mesh: THREE.Mesh): void {
    const dictionary = mesh.morphTargetDictionary!;
    const influences = mesh.morphTargetInfluences!;

    console.log('📋 Morph targets found on', mesh.name + ':', Object.keys(dictionary));
    console.log('📋 Mesh has', influences.length, 'influence values');

    // List of mouth-related morph targets we want to use
    const mouthMorphs = [
      'mouthOpen', 'mouthSmile', 'mouthFrown',
      'jawOpen', 'jawForward', 'jawLeft', 'jawRight',
      'mouthClose', 'mouthFunnel', 'mouthPucker',
      'mouthLeft', 'mouthRight', 'mouthRollLower', 'mouthRollUpper',
      'mouthShrugLower', 'mouthShrugUpper', 'mouthStretchLeft', 'mouthStretchRight',
      'viseme_sil', 'viseme_PP', 'viseme_FF', 'viseme_TH', 'viseme_DD',
      'viseme_kk', 'viseme_CH', 'viseme_SS', 'viseme_nn', 'viseme_RR',
      'viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U'
    ];

    for (const name in dictionary) {
      const index = dictionary[name];

      // ONLY register mouth-related morphs, skip everything else (eyes, brows, cheeks, etc.)
      const isMouthMorph = mouthMorphs.some(m => name.toLowerCase().includes(m.toLowerCase()));

      if (!isMouthMorph) {
        console.log('  ⏭️ Skipping non-mouth morph:', name);
        continue;
      }

      if (!this.morphTargets[name]) {
        this.morphTargets[name] = [];
      }

      // Store reference to mesh and index only - access influences directly when needed
      this.morphTargets[name].push({
        mesh,
        index,
        influences, // Keep for compatibility but we'll access mesh.morphTargetInfluences directly
      });

      console.log('  ✅ Registered mouth morph:', name, 'at index', index);
    }
  }

  /**
   * Setup animation system
   */
  private setupAnimations(animations: THREE.AnimationClip[]): void {
    this.animations = animations;
    this.mixer = new THREE.AnimationMixer(this.currentAvatar!);

    if (animations.length > 0) {
      this.playAnimation(0);
    }

    console.log(`Loaded ${animations.length} animations`);
  }

  /**
   * Play animation by index
   */
  playAnimation(index: number): void {
    if (!this.mixer || !this.animations[index]) return;

    if (this.currentAnimation) {
      this.currentAnimation.stop();
    }

    this.currentAnimation = this.mixer.clipAction(this.animations[index]);
    this.currentAnimation.play();
  }

  /**
   * Center avatar on ground
   */
  private centerAvatar(): void {
    if (!this.currentAvatar) return;

    const box = new THREE.Box3().setFromObject(this.currentAvatar);
    this.currentAvatar.position.y = -box.min.y;
  }

  /**
   * Load fallback avatar (simple geometric shape)
   */
  private loadFallbackAvatar(): void {
    console.log('Loading fallback avatar...');

    const group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.85;
    head.castShadow = true;
    group.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 1.9, 0.2);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 1.9, 0.2);
    group.add(rightEye);

    this.currentAvatar = group;
    this.scene.add(group);
  }

  /**
   * Get default avatar URL
   */
  private getDefaultAvatarUrl(): string {
    return 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb';
  }

  /**
   * Remove current avatar
   */
  removeAvatar(): void {
    if (this.currentAvatar) {
      this.scene.remove(this.currentAvatar);

      // Dispose geometries and materials
      this.currentAvatar.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();

          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => mat.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });

      this.currentAvatar = null;
    }

    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }

    this.animations = [];
    this.currentAnimation = null;
    this.morphTargets = {};
  }

  /**
   * Update animations
   */
  update(delta: number): void {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  /**
   * Get morph targets by name
   */
  getMorphTarget(name: string): MorphTargetReference[] {
    return this.morphTargets[name] || [];
  }

  /**
   * Set morph target value with safety limits
   */
  setMorphTargetValue(name: string, value: number): void {
    const targets = this.getMorphTarget(name);

    if (targets.length === 0) {
      // Only log once per missing morph target to avoid spam
      if (!(window as any).__missingMorphTargets) {
        (window as any).__missingMorphTargets = new Set();
      }
      if (!(window as any).__missingMorphTargets.has(name)) {
        console.warn('⚠️ Morph target not found:', name);
        (window as any).__missingMorphTargets.add(name);
      }
      return;
    }

    // SAFETY: Clamp to 0-1 range, and apply an additional safety limit of 0.15
    // to prevent excessive deformation
    const clampedValue = Math.max(0, Math.min(0.15, Math.max(0, Math.min(1, value))));

    // Log if we're applying a significant value (for debugging)
    if (clampedValue > 0.01) {
      console.log(`🎭 Setting ${name} = ${clampedValue.toFixed(3)}`);
    }

    targets.forEach((target) => {
      // CRITICAL: Access morphTargetInfluences directly from mesh, not stored reference
      if (!target.mesh.morphTargetInfluences) {
        console.error('❌ Mesh has no morphTargetInfluences:', target.mesh.name);
        return;
      }

      // Set the value directly on the mesh
      target.mesh.morphTargetInfluences[target.index] = clampedValue;

      // Mark mesh for update
      if (target.mesh.geometry) {
        target.mesh.geometry.morphTargetsRelative = false;
      }
    });
  }

  /**
   * Get all morph target names
   */
  getMorphTargetNames(): string[] {
    return Object.keys(this.morphTargets);
  }

  /**
   * Direct test - manually control mouth for debugging
   */
  testMouthDirect(value: number): void {
    console.log('🧪 Direct mouth test - setting mouthOpen to', value);

    if (!this.currentAvatar) {
      console.error('❌ No avatar loaded');
      return;
    }

    // Only apply to Wolf3D_Head and Wolf3D_Teeth, skip eyes
    this.currentAvatar.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // Skip eye meshes - they shouldn't have mouth morphs
        if (mesh.name === 'EyeLeft' || mesh.name === 'EyeRight') {
          console.log('  ⏭️ Skipping', mesh.name, '- not a mouth mesh');
          return;
        }

        if (mesh.morphTargetInfluences && mesh.morphTargetDictionary) {
          const mouthOpenIndex = mesh.morphTargetDictionary['mouthOpen'];
          if (mouthOpenIndex !== undefined) {
            console.log('  ✓ Setting mouthOpen on', mesh.name, 'to', value);
            mesh.morphTargetInfluences[mouthOpenIndex] = value;
          }
        }
      }
    });
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.removeAvatar();
  }
}
