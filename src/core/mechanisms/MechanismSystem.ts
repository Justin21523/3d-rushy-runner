import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

export enum MotionType {
  Linear = 'linear',
  Circular = 'circular',
  Pendulum = 'pendulum',
  Rotate = 'rotate',
}

interface MovingPlatform {
  mesh: THREE.Mesh;
  motionType: MotionType;
  params: {
    start: THREE.Vector3;
    end: THREE.Vector3;        // for linear/pendulum
    center: THREE.Vector3;     // for circular
    radius: number;
    axis: THREE.Vector3;
    speed: number;
    phase: number;             // initial phase [0,1]
  };
  t: number;
}

interface Spinner {
  mesh: THREE.Mesh;
  axis: THREE.Vector3;
  speed: number;
}

export class MechanismSystem {
  private platforms: Map<string, MovingPlatform> = new Map();
  private spinners: Spinner[] = [];

  registerPlatform(id: string, mesh: THREE.Mesh, motionType: MotionType, config: any) {
    if (motionType === MotionType.Linear) {
      this.platforms.set(id, {
        mesh, motionType,
        params: {
          start: new THREE.Vector3().copy(config.start),
          end: new THREE.Vector3().copy(config.end),
          center: new THREE.Vector3(),
          radius: 0,
          axis: new THREE.Vector3(0,1,0),
          speed: config.speed || 1,
          phase: config.phase || 0,
        },
        t: config.phase || 0,
      });
    } else if (motionType === MotionType.Circular) {
      this.platforms.set(id, {
        mesh, motionType,
        params: {
          start: new THREE.Vector3(),
          end: new THREE.Vector3(),
          center: new THREE.Vector3().copy(config.center),
          radius: config.radius || 3,
          axis: new THREE.Vector3(0,1,0),
          speed: config.speed || 1,
          phase: config.phase || 0,
        },
        t: config.phase || 0,
      });
    } else if (motionType === MotionType.Pendulum) {
      this.platforms.set(id, {
        mesh, motionType,
        params: {
          start: new THREE.Vector3().copy(config.start),
          end: new THREE.Vector3().copy(config.end),
          center: new THREE.Vector3(),
          radius: 0,
          axis: new THREE.Vector3(0,1,0),
          speed: config.speed || 1,
          phase: config.phase || 0,
        },
        t: config.phase || 0,
      });
    }
    // Rotate is handled separately via spinners
  }

  registerSpinner(mesh: THREE.Mesh, axis: 'x'|'y'|'z', speed = 2) {
    const vec = new THREE.Vector3(axis==='x'?1:0, axis==='y'?1:0, axis==='z'?1:0);
    this.spinners.push({ mesh, axis: vec, speed });
  }

  update(delta: number) {
    const dt = delta * useGameStore.getState().timeScale;

    // Update moving platforms
    this.platforms.forEach((plat) => {
      const { motionType, params } = plat;
      plat.t += params.speed * dt;
      if (plat.t > 1) plat.t -= 1;

      switch (motionType) {
        case MotionType.Linear:
          plat.mesh.position.lerpVectors(params.start, params.end, plat.t);
          break;
        case MotionType.Pendulum: {
          const val = Math.sin(plat.t * Math.PI * 2);
          plat.mesh.position.lerpVectors(params.start, params.end, (val + 1) / 2);
          break;
        }
        case MotionType.Circular: {
          const angle = plat.t * Math.PI * 2;
          plat.mesh.position.set(
            params.center.x + Math.cos(angle) * params.radius,
            params.center.y,
            params.center.z + Math.sin(angle) * params.radius
          );
          break;
        }
      }
    });

    // Update spinners
    this.spinners.forEach(sp => {
      sp.mesh.rotateOnWorldAxis(sp.axis, sp.speed * dt);
    });
  }

  removePlatform(id: string) {
    this.platforms.delete(id);
  }

  clear() {
    this.platforms.clear();
    this.spinners = [];
  }
}