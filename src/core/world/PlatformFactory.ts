import * as THREE from 'three';
import { MotionType } from '../mechanisms/MechanismSystem';

export type PlatformShape = 'box' | 'cylinder' | 'wedge' | 'ring' | 'cross' | 'L' | 'tallPillar' | 'moving';

export interface PlatformConfig {
  shape: PlatformShape;
  position: [number, number, number];
  size?: [number, number, number]; // width, height, depth
  color?: string;
  motion?: {
    type: MotionType;
    params: any; // depends on type
  };
  id?: string; // for mechanism registration
}

export class PlatformFactory {
  static create(config: PlatformConfig): THREE.Mesh {
    let geom: THREE.BufferGeometry;
    const size = config.size || [3, 0.5, 3];
    switch (config.shape) {
      case 'box':
        geom = new THREE.BoxGeometry(...size);
        break;
      case 'cylinder':
        geom = new THREE.CylinderGeometry(size[0]/2, size[0]/2, size[1], 16);
        break;
      case 'wedge':
        geom = new THREE.CylinderGeometry(size[0]/2, 0, size[1], 4);
        break;
      case 'ring':
        geom = new THREE.TorusGeometry(size[0]/2, size[1]/3, 8, 24);
        break;
      case 'cross':
        geom = PlatformFactory.createCrossGeometry(size[0], size[1], size[2]);
        break;
      case 'L':
        geom = PlatformFactory.createLGeometry(size[0], size[1], size[2]);
        break;
      case 'tallPillar':
        geom = new THREE.BoxGeometry(size[0], size[1], size[0]);
        break;
      case 'moving':
      default:
        geom = new THREE.BoxGeometry(2, 0.5, 2);
        break;
    }
    const mat = new THREE.MeshStandardMaterial({ color: config.color || '#888888' });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(config.position[0], config.position[1], config.position[2]);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    return mesh;
  }

  private static createCrossGeometry(w: number, h: number, d: number): THREE.BufferGeometry {
    // simple cross shape using multiple boxes merged
    const group = new THREE.Group();
    group.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d/3)));
    group.add(new THREE.Mesh(new THREE.BoxGeometry(d/3, h, w)));
    // merge (simplified: return a box for now, can be improved)
    return new THREE.BoxGeometry(w, h, d);
  }

  private static createLGeometry(w: number, h: number, d: number): THREE.BufferGeometry {
    return new THREE.BoxGeometry(w*0.7, h, d*0.7);
  }
}