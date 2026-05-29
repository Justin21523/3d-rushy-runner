// src/core/collectibles/CollectibleManager.ts

import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

export class CollectibleManager {
  private scene: THREE.Scene;
  private playerMesh: THREE.Object3D;

  constructor(scene: THREE.Scene, playerMesh: THREE.Object3D) {
    this.scene = scene;
    this.playerMesh = playerMesh;
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
        // remove from scene (parent might be chunk group)
        obj.parent?.remove(obj);
        // optional: add back to pool handled by ChunkManager
        break;
      case 'energyCore':
        store.addEnergyCores(1);
        obj.parent?.remove(obj);
        break;
      case 'shard': {
        const shardId = obj.userData.id || 'unknown';
        store.addShard(shardId);
        obj.parent?.remove(obj);
        break;
      }
    }
  }
}
