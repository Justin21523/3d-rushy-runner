// src/core/engine/ObjectPool.ts

import * as THREE from 'three';

/**
 * Generic object pool for THREE.js objects.
 * Recycles meshes to avoid GC pressure.
 */
export class ObjectPool<T extends THREE.Object3D> {
  private pool: T[] = [];
  private active: T[] = [];
  private factory: () => T;

  constructor(factory: () => T, initialSize = 20) {
    this.factory = factory;
    for (let i = 0; i < initialSize; i++) {
      const obj = factory();
      obj.visible = false;
      this.pool.push(obj);
    }
  }

  acquire(): T {
    let obj: T;
    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else {
      obj = this.factory();
    }
    obj.visible = true;
    this.active.push(obj);
    return obj;
  }

  release(obj: T) {
    obj.visible = false;
    // reset position/scale if needed
    obj.position.set(0, 0, 0);
    obj.scale.set(1, 1, 1);
    this.active = this.active.filter((a) => a !== obj);
    this.pool.push(obj);
  }

  releaseAll() {
    while (this.active.length > 0) {
      this.release(this.active[0]);
    }
  }

  getActive(): T[] {
    return this.active;
  }

  disposeAll() {
    this.pool.forEach((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material?.dispose();
      }
    });
    this.active.forEach((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material?.dispose();
      }
    });
    this.pool = [];
    this.active = [];
  }
}