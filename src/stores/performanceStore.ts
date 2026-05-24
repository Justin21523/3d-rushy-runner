// src/stores/performanceStore.ts

import { create } from 'zustand';

interface PerformanceState {
  fps: number;
  quality: number; // 0-3 (off-low-high-ultra)
  frameTimeHistory: number[];
  setFPS: (fps: number) => void;
  adjustQuality: () => void;
  getQuality: () => number;
}

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  fps: 60,
  quality: 3, // start high
  frameTimeHistory: new Array(10).fill(16.67), // ms
  setFPS: (fps) =>
    set((state) => ({
      fps,
      frameTimeHistory: [...state.frameTimeHistory.slice(1), 1000 / fps],
    })),
  adjustQuality: () => {
    const state = get();
    const avgTime = state.frameTimeHistory.reduce((a, b) => a + b) / state.frameTimeHistory.length;
    if (avgTime > 22) {
      // drop quality
      set({ quality: Math.max(0, state.quality - 1) });
    } else if (avgTime < 13 && state.quality < 3) {
      set({ quality: Math.min(3, state.quality + 1) });
    }
  },
  getQuality: () => get().quality,
}));