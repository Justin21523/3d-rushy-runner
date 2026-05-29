import * as THREE from 'three';
import { BackgroundChunk } from './BackgroundChunk';
import { generateBackgroundChunk } from './BackgroundGenerator';

const BG_CHUNK_LENGTH = 80;
const VIEW_AHEAD = 3;
const VIEW_BEHIND = 1;

export class BackgroundManager {
  private scene: THREE.Scene;
  private chunks: Map<string, BackgroundChunk> = new Map();
  private getPlayerZ: () => number;

  constructor(scene: THREE.Scene, getPlayerZ: () => number) {
    this.scene = scene;
    this.getPlayerZ = getPlayerZ;
  }

  update() {
    const playerZ = this.getPlayerZ();
    const currentIdx = Math.floor(playerZ / BG_CHUNK_LENGTH);

    for (let i = currentIdx - VIEW_BEHIND; i <= currentIdx + VIEW_AHEAD; i++) {
      if (i < 0) continue;
      const id = `bg_${i}`;
      if (!this.chunks.has(id)) {
        this.loadChunk(i);
      }
    }

    this.chunks.forEach((_chunk, id) => {
      const idx = parseInt(id.split('_')[1]);
      if (idx < currentIdx - VIEW_BEHIND - 2 || idx > currentIdx + VIEW_AHEAD + 2) {
        this.unloadChunk(id);
      }
    });
  }

  private loadChunk(index: number) {
    const data = generateBackgroundChunk(index);
    const chunk = new BackgroundChunk(data.id);
    chunk.build(data);
    this.scene.add(chunk.group);
    this.chunks.set(data.id, chunk);
  }

  private unloadChunk(id: string) {
    const chunk = this.chunks.get(id);
    if (!chunk) return;
    // Remove from tracking first so a dispose error can never re-enter on the next frame.
    this.chunks.delete(id);
    this.scene.remove(chunk.group);
    try {
      chunk.dispose();
    } catch (e) {
      console.warn('BackgroundChunk dispose failed:', e);
    }
  }

  dispose() {
    this.chunks.forEach((_, id) => this.unloadChunk(id));
  }
}