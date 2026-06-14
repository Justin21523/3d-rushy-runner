// src/core/collectibles/CollectibleManager.ts

import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { ChunkManager } from '../world/ChunkManager';
import { SCORE_RING, SCORE_CORE } from '../combat/CombatSettings';

export class CollectibleManager {
  private scene: THREE.Scene;
  private playerMesh: THREE.Object3D;
  private chunkManager: ChunkManager;

  constructor(scene: THREE.Scene, playerMesh: THREE.Object3D, chunkManager: ChunkManager) {
    this.scene = scene;
    this.playerMesh = playerMesh;
    this.chunkManager = chunkManager;
  }

  update() {
    const store = useGameStore.getState();
    const playerPos = this.playerMesh.position;
    const collectRadius = 1.5;
    const NEAR_Z = 30;

    // Collect first, mutate after — modifying scene during traverse is unsafe.
    const toCollect: { obj: THREE.Object3D; type: string }[] = [];

    // Iterate top-level scene children and skip far groups outright.
    for (const child of this.scene.children) {
      if ((child as THREE.Group).isGroup) {
        let anyClose = false;
        for (const inner of (child as THREE.Group).children) {
          if (Math.abs(inner.position.z - playerPos.z) <= NEAR_Z) { anyClose = true; break; }
        }
        if (!anyClose) continue;
      }
      child.traverse((obj) => {
        if (!obj.userData?.collectible) return;
        const dist = obj.position.distanceTo(playerPos);
        if (dist < collectRadius) {
          toCollect.push({ obj, type: obj.userData.type as string });
        }
      });
    }

    for (const { obj, type } of toCollect) {
      this.collect(obj, type, store);
    }
  }

  private collect(obj: THREE.Object3D, type: string, store: any) {
    switch (type) {
      case 'ring':
        store.addRings(1);
        store.addScore(SCORE_RING);
        store.addCombo();
        this.chunkManager.releaseCollectible(obj as THREE.Mesh, 'ring');
        break;
      case 'energyCore':
        store.addEnergyCores(1);
        store.addScore(SCORE_CORE);
        this.chunkManager.releaseCollectible(obj as THREE.Mesh, 'energyCore');
        break;
      case 'shard': {
        const shardId = obj.userData.id || 'unknown';
        store.addShard(shardId);
        // shards are not pooled — remove and dispose inline.
        obj.parent?.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          (obj.material as THREE.Material)?.dispose();
        }
        return;
      }
    }
  }
}
