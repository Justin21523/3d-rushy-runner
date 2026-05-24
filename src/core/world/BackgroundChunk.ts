import * as THREE from 'three';
import type { BgChunkData, BgObjectDef } from './BackgroundGenerator';

export class BackgroundChunk {
  id: string;
  group: THREE.Group;
  private meshes: THREE.Mesh[] = [];

  constructor(id: string) {
    this.id = id;
    this.group = new THREE.Group();
  }

  build(data: BgChunkData) {
    this.group.renderOrder = -1;
    data.objects.forEach((def) => {
      const mesh = this.createMesh(def);
      if (mesh) {
        mesh.position.set(def.position[0], def.position[1], def.position[2]);
        if (def.scale && def.type !== 'building') mesh.scale.setScalar(def.scale);
        mesh.renderOrder = -1;
        this.group.add(mesh);
        this.meshes.push(mesh);
      }
    });
  }

  private createMesh(def: BgObjectDef): THREE.Mesh | null {
    let geom: THREE.BufferGeometry;
    let mat: THREE.Material;

    switch (def.type) {
      case 'building':
        geom = new THREE.BoxGeometry(4, def.scale ?? 5, 4);
        mat = new THREE.MeshStandardMaterial({ color: def.color ?? '#445588' });
        break;
      case 'mountain':
        geom = new THREE.ConeGeometry(4, 1, 8);
        mat = new THREE.MeshStandardMaterial({ color: '#3a5a3a' });
        return new THREE.Mesh(geom, mat);
      case 'cloud':
        geom = new THREE.SphereGeometry(1.5, 7, 7);
        mat = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 });
        return new THREE.Mesh(geom, mat);
      case 'tree':
        geom = new THREE.ConeGeometry(1, 3, 8);
        mat = new THREE.MeshStandardMaterial({ color: '#2d5a27' });
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2), new THREE.MeshStandardMaterial({ color: '#5a3a1a' }));
        const treeGroup = new THREE.Group();
        treeGroup.add(trunk);
        const top = new THREE.Mesh(geom, mat);
        top.position.y = 2;
        treeGroup.add(top);
        return treeGroup as unknown as THREE.Mesh;
      case 'lamp':
        geom = new THREE.CylinderGeometry(0.3, 0.5, 3);
        mat = new THREE.MeshStandardMaterial({ color: '#cccccc' });
        return new THREE.Mesh(geom, mat);
      default:
        return null;
    }
    return new THREE.Mesh(geom, mat);
  }

  dispose() {
    this.meshes.forEach(m => {
      m.geometry?.dispose();
      if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose());
      else m.material.dispose();
    });
    this.group.clear();
  }
}