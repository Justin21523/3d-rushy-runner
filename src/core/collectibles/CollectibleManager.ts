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

    // Traverse scene to find collectibles (tagged via userData)
    this.scene.traverse((child) => {
      if (!child.userData?.collectible) return;
      const type = child.userData.type as string;
      const dist = child.position.distanceTo(playerPos);
      if (dist < collectRadius) {
        this.collect(child, type, store);
      }
    });
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
      case 'shard':
        const shardId = obj.userData.id || 'unknown';
        store.addShard(shardId);
        obj.parent?.remove(obj);
        break;
    }
  }
}