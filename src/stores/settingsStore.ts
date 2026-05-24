// src/stores/settingsStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  motionBlur: boolean;
  cameraDistance: number;
  fov: number;
  setMasterVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  toggleMotionBlur: () => void;
  setCameraDistance: (d: number) => void;
  setFOV: (f: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      masterVolume: 1.0,
      sfxVolume: 1.0,
      musicVolume: 0.8,
      motionBlur: true,
      cameraDistance: 18,
      fov: 60,
      setMasterVolume: (v) => set({ masterVolume: v }),
      setSfxVolume: (v) => set({ sfxVolume: v }),
      setMusicVolume: (v) => set({ musicVolume: v }),
      toggleMotionBlur: () => set((s) => ({ motionBlur: !s.motionBlur })),
      setCameraDistance: (d) => set({ cameraDistance: d }),
      setFOV: (f) => set({ fov: f }),
    }),
    { name: 'game-settings' }
  )
);