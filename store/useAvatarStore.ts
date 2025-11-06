import { create } from 'zustand';
import { AvatarState, CameraConfig } from '@/types';

interface AvatarStore extends AvatarState {
  // Camera config
  cameraConfig: CameraConfig;

  // Load trigger
  loadTrigger: number;

  // Actions
  setLoading: (loading: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  setError: (error: string | null) => void;
  setUrl: (url: string | null) => void;
  triggerLoad: (url?: string) => void;
  setCameraConfig: (config: Partial<CameraConfig>) => void;
  resetCamera: () => void;
}

const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  distance: 1.5,
  height: 1.6,
  targetHeight: 1.5,
  fov: 45,
};

export const useAvatarStore = create<AvatarStore>((set) => ({
  // Initial state
  isLoading: false,
  isLoaded: false,
  error: null,
  url: null,
  morphTargets: {},
  cameraConfig: DEFAULT_CAMERA_CONFIG,
  loadTrigger: 0,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  setError: (error) => set({ error }),
  setUrl: (url) => set({ url }),

  triggerLoad: (url) =>
    set((state) => ({
      url: url || null,
      loadTrigger: state.loadTrigger + 1,
    })),

  setCameraConfig: (config) =>
    set((state) => ({
      cameraConfig: { ...state.cameraConfig, ...config },
    })),

  resetCamera: () => set({ cameraConfig: DEFAULT_CAMERA_CONFIG }),
}));
