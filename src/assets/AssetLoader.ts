// src/assets/AssetLoader.ts

import * as THREE from 'three';

/**
 * Centralized asset loader with fallback procedural generation.
 * All external GLTF/Texture loads are abstracted here.
 */
export class AssetLoader {
  private textureCache = new Map<string, THREE.Texture>();
  private geometryCache = new Map<string, THREE.BufferGeometry>();

  /** Load a GLTF model (supports both real and fallback) */
  async loadModel(path: string): Promise<THREE.Group> {
    // Attempt to use useGLTF preloading (client-side only)
    // But here we'll simulate with a simple fallback.
    // In production, you'd call useGLTF.preload(path) but this is not async-friendly.
    // Fallback: return a basic cube with color.
    const group = new THREE.Group();
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: this.getColorFromPath(path) })
    );
    group.add(cube);
    return group;
  }

  /** Load a texture with fallback solid color */
  getTexture(path: string): THREE.Texture {
    if (this.textureCache.has(path)) return this.textureCache.get(path)!;
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = this.getColorFromPath(path);
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    this.textureCache.set(path, tex);
    return tex;
  }

  /** Get or create a shared geometry (e.g., rings, coins) */
  getGeometry(key: string): THREE.BufferGeometry {
    if (this.geometryCache.has(key)) return this.geometryCache.get(key)!;
    let geom: THREE.BufferGeometry;
    switch (key) {
      case 'ring': geom = new THREE.TorusGeometry(0.4, 0.15, 8, 16); break;
      case 'coin': geom = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16); break;
      case 'spike': geom = new THREE.ConeGeometry(0.4, 1, 8); break;
      default: geom = new THREE.SphereGeometry(0.5, 8, 8);
    }
    this.geometryCache.set(key, geom);
    return geom;
  }

  private getColorFromPath(path: string): string {
    if (path.includes('player')) return '#00aaff';
    if (path.includes('ring')) return '#FFD700';
    if (path.includes('enemy')) return '#ff4444';
    return '#aaaaaa';
  }

  /** Cleanup all cached assets */
  dispose() {
    this.textureCache.forEach((t) => t.dispose());
    this.geometryCache.forEach((g) => g.dispose());
    this.textureCache.clear();
    this.geometryCache.clear();
  }
}

// Singleton instance for easy import
export const assetLoader = new AssetLoader();