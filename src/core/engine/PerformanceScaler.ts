// src/core/engine/PerformanceScaler.ts

import { useFrame } from '@react-three/fiber';
import { usePerformanceStore } from '../../stores/performanceStore';
import { useRef } from 'react';

export function PerformanceScaler() {
  const setFPS = usePerformanceStore((s) => s.setFPS);
  const adjustQuality = usePerformanceStore((s) => s.adjustQuality);
  const lastCheck = useRef(0);

  useFrame((state, delta) => {
    const now = state.clock.elapsedTime;
    if (now - lastCheck.current > 1) {
      lastCheck.current = now;
      const fps = 1 / delta;
      setFPS(fps);
      adjustQuality();
    }
  });

  return null;
}