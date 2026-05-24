// src/utils/math.ts

import * as THREE from 'three';

/** Clamp value between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Smooth damping (like exponential decay) */
export function damp(current: number, target: number, smoothing: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-smoothing * dt));
}

/** Convert degrees to radians */
export const degToRad = (deg: number) => (deg * Math.PI) / 180;

/** Returns a random float between min and max */
export function randRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Angle between two vectors in radians (Y-axis considered for 2D) */
export function angleBetween(v1: THREE.Vector3, v2: THREE.Vector3): number {
  return Math.atan2(v2.x - v1.x, v2.y - v1.y);
}

/** Simple 2D distance ignoring Y */
export function horizontalDist(a: THREE.Vector3, b: THREE.Vector3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}