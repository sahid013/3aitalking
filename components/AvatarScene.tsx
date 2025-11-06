'use client';

import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useAvatarStore } from '@/store/useAvatarStore';
import { AvatarManager } from '@/lib/managers/AvatarManager';
import { LipSyncManager } from '@/lib/managers/LipSyncManager_v2';
import * as THREE from 'three';

/**
 * Scene component - handles Three.js scene setup
 */
function Scene() {
  const avatarManagerRef = useRef<AvatarManager | null>(null);
  const lipSyncManagerRef = useRef<LipSyncManager | null>(null);
  const { scene } = useThree();
  const { url, loadTrigger, setLoading, setLoaded, setError, cameraConfig } = useAvatarStore();

  // Initialize managers
  useEffect(() => {
    avatarManagerRef.current = new AvatarManager(scene);
    lipSyncManagerRef.current = new LipSyncManager();

    // Make available globally for debugging and conversation manager access
    if (typeof window !== 'undefined') {
      (window as any).avatarManager = avatarManagerRef.current;
      (window as any).lipSyncManager = lipSyncManagerRef.current;

      // Connect lip sync to speech service if conversation manager exists
      if ((window as any).conversationManager) {
        const speechService = (window as any).conversationManager.speechService;
        if (speechService) {
          speechService.setLipSyncManager(lipSyncManagerRef.current);
        }
      }
    }

    return () => {
      avatarManagerRef.current?.dispose();
    };
  }, [scene]);

  // Load avatar when triggered
  useEffect(() => {
    if (!avatarManagerRef.current || !lipSyncManagerRef.current) {
      console.log('⚠️ Managers not initialized yet');
      return;
    }
    if (loadTrigger === 0) return; // Don't load on initial mount

    const loadAvatar = async () => {
      try {
        console.log('🔄 Loading avatar...');
        console.log('🔄 URL:', url || 'default');
        setLoading(true);
        setError(null);

        // Explicitly remove old avatar first
        if (avatarManagerRef.current) {
          console.log('🗑️ Removing old avatar...');
          avatarManagerRef.current.removeAvatar();
        }

        await avatarManagerRef.current!.loadAvatar(url || undefined);

        console.log('🔗 Connecting lip sync manager to avatar...');
        // Connect lip sync to avatar
        lipSyncManagerRef.current!.setAvatarManager(avatarManagerRef.current!);

        // Also reconnect to speech service
        if (typeof window !== 'undefined' && (window as any).conversationManager) {
          const speechService = (window as any).conversationManager.speechService;
          if (speechService) {
            console.log('🔗 Re-connecting speech service to lip sync manager...');
            speechService.setLipSyncManager(lipSyncManagerRef.current);
          }
        }

        setLoaded(true);
        setError(null);
        console.log('✅ Avatar loaded and lip sync connected');
      } catch (error) {
        console.error('Failed to load avatar:', error);
        setError('Failed to load avatar');
      } finally {
        setLoading(false);
      }
    };

    loadAvatar();
  }, [loadTrigger, url, setLoading, setLoaded, setError]);

  // Animation loop
  useFrame((state, delta) => {
    avatarManagerRef.current?.update(delta);
    lipSyncManagerRef.current?.update(delta);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 3]} intensity={1} castShadow />
      <directionalLight position={[-2, 2, 2]} intensity={0.3} />
      <directionalLight position={[0, 2, -3]} intensity={0.4} color="#8888ff" />
      <hemisphereLight args={['#ffffff', '#444444', 0.3]} position={[0, 10, 0]} />

      {/* Ground grid */}
      <gridHelper args={[10, 10, 0x2a2a2a, 0x1a1a1a]} position={[0, -1, 0]} />

      {/* Fog */}
      <fog attach="fog" args={['#1a2332', 3, 10]} />
    </>
  );
}

/**
 * Camera controller - updates camera based on store
 */
function CameraController() {
  const { camera } = useThree();
  const { cameraConfig } = useAvatarStore();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = cameraConfig.fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, cameraConfig.fov]);

  useEffect(() => {
    camera.position.set(0, cameraConfig.height, cameraConfig.distance);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, cameraConfig.targetHeight, 0);
      controlsRef.current.update();
    }
  }, [camera, cameraConfig]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, cameraConfig.targetHeight, 0]}
      enableDamping
      dampingFactor={0.05}
      minDistance={0.8}
      maxDistance={4}
      maxPolarAngle={Math.PI / 1.5}
    />
  );
}

/**
 * Main AvatarScene component
 */
export default function AvatarScene() {
  const { cameraConfig } = useAvatarStore();

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#1a2332']} />

        <PerspectiveCamera
          makeDefault
          fov={cameraConfig.fov}
          position={[0, cameraConfig.height, cameraConfig.distance]}
          near={0.1}
          far={1000}
        />

        <CameraController />
        <Scene />
      </Canvas>
    </div>
  );
}
