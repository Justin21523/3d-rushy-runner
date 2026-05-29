import * as THREE from 'three';
import type { BgChunkData, BgObjectDef } from './BackgroundGenerator';

export class BackgroundChunk {
  id: string;
  group: THREE.Group;
  private objects: THREE.Object3D[] = [];

  constructor(id: string) {
    this.id = id;
    this.group = new THREE.Group();
  }

  build(data: BgChunkData) {
    this.group.renderOrder = -1;
    data.objects.forEach((def) => {
      const obj = this.createObject(def);
      if (obj) {
        obj.position.set(def.position[0], def.position[1], def.position[2]);
        if (def.scale && def.type !== 'building') obj.scale.setScalar(def.scale);
        obj.renderOrder = -1;
        this.group.add(obj);
        this.objects.push(obj);
      }
    });
  }

  private createObject(def: BgObjectDef): THREE.Object3D | null {
    switch (def.type) {
      case 'building': {
        const geom = new THREE.BoxGeometry(4, def.scale ?? 5, 4);
        const mat = new THREE.MeshStandardMaterial({ color: def.color ?? '#445588' });
        return new THREE.Mesh(geom, mat);
      }
      case 'mountain': {
        const geom = new THREE.ConeGeometry(4, 1, 8);
        const mat = new THREE.MeshStandardMaterial({ color: '#3a5a3a' });
        return new THREE.Mesh(geom, mat);
      }
      case 'cloud': {
        const geom = new THREE.SphereGeometry(1.5, 7, 7);
        const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 });
        return new THREE.Mesh(geom, mat);
      }
      case 'tree': {
        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.4, 2),
          new THREE.MeshStandardMaterial({ color: '#5a3a1a' })
        );
        treeGroup.add(trunk);
        const top = new THREE.Mesh(
          new THREE.ConeGeometry(1, 3, 8),
          new THREE.MeshStandardMaterial({ color: '#2d5a27' })
        );
        top.position.y = 2;
        treeGroup.add(top);
        return treeGroup;
      }
      case 'lamp': {
        const geom = new THREE.CylinderGeometry(0.3, 0.5, 3);
        const mat = new THREE.MeshStandardMaterial({ color: '#cccccc' });
        return new THREE.Mesh(geom, mat);
      }
      default:
        return null;
    }
  }

  dispose() {
    this.objects.forEach((obj) => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) child.material.forEach((m) => m?.dispose());
          else (child.material as THREE.Material | undefined)?.dispose();
        }
      });
    });
    this.objects = [];
    this.group.clear();
  }
}