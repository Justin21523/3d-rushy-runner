import * as THREE from 'three';
import type { ChunkData } from './ProceduralGen';
import type { ChunkManager } from './ChunkManager';
import { MechanismSystem } from '../mechanisms/MechanismSystem';
import { PlatformFactory, PlatformConfig, PlatformShape } from './PlatformFactory';


export class Chunk {
  id: string;
  group: THREE.Group;
  private objects: { mesh: THREE.Object3D; type: string }[] = [];

  constructor(id: string) {
    this.id = id;
    this.group = new THREE.Group();
  }

  build(data: ChunkData, manager: ChunkManager, mechanismSystem?: MechanismSystem) {
    // 建立道路平台網格
    const roadMaterial = new THREE.MeshStandardMaterial({ color: '#5a5a5a', roughness: 0.7 });
    // 在建立道路時：
    const shape: PlatformShape = (data.terrainType === TerrainType.MovingPlatforms) ? 'moving' :
                                  (data.terrainType === TerrainType.Hills) ? 'wedge' : 'box';
    const platformMesh = PlatformFactory.create({
      shape,
      position: [mid.x, mid.y + 0.2, mid.z],
      size: [curr.width, 0.5, length],
      color: shape === 'moving' ? '#aaaaff' : '#5a5a5a',
      motion: shape === 'moving' ? { type: MotionType.Linear, params: { start: prev.pos, end: curr.pos } } : undefined,
      id: shape === 'moving' ? `moving_${this.id}_${i}` : undefined,
    });
    this.group.add(platformMesh);
    // 如果是移動平台，則注冊到 mechanismSystem
    if (shape === 'moving' && mechanismSystem) {
      mechanismSystem.registerPlatform(`moving_${this.id}_${i}`, platformMesh, MotionType.Linear, {
        start: prev.pos.clone().add(new THREE.Vector3(0, 0.2, 0)),
        end: curr.pos.clone().add(new THREE.Vector3(0, 0.2, 0)),
        speed: 0.5,
      });
    }
    
    data.pathPoints.forEach((point, i) => {
      if (i === 0) return; // 需要兩個點才能建平台
      const prev = data.pathPoints[i - 1];
      const curr = point;

      // 計算兩個點之間的中點和長度
      const mid = new THREE.Vector3().addVectors(prev.pos, curr.pos).multiplyScalar(0.5);
      const direction = new THREE.Vector3().subVectors(curr.pos, prev.pos);
      const length = direction.length();
      const angle = Math.atan2(direction.x, direction.z);

      // 建立平台塊
      const geom = new THREE.BoxGeometry(curr.width, 0.4, length);
      const mesh = new THREE.Mesh(geom, roadMaterial);
      mesh.position.copy(mid);
      mesh.position.y += 0.2; // 將平台稍微抬高，使頂面在 pos.y
      mesh.rotation.y = angle;
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.userData = { type: 'road' };

      this.group.add(mesh);
    });

    // 放置收集品、障礙物等 (從 ChunkManager 的物件池取得)
    data.objects.forEach((inst) => {
      let mesh: THREE.Object3D | null = null;
      switch (inst.type) {
       case 'ring': mesh = manager.acquireRing(); break;
        case 'energyCore': mesh = manager.acquireCore(); break;
        case 'obstacle': mesh = manager.acquireObstacle(inst.subtype); break;
        case 'boostPad': mesh = manager.acquireBoost(); break;
        case 'bouncePad': mesh = manager.acquireBouncePad(); break;
        case 'movingPlatform': {
          const plat = manager.acquireMovingPlatform();
          // register for motion
          if (mechanismSystem && inst.pathId) {
            const start = new THREE.Vector3(inst.position[0], inst.position[1], inst.position[2]);
            const end = start.clone();
            end.x += 4; // move horizontally by 4 units
            mechanismSystem.registerMovingPlatform(inst.pathId, plat, start, end, 0.8);
          }
          mesh = plat;
          break;
        }
        case 'spinner': {
          const spinner = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.5, 0.5),
            new THREE.MeshStandardMaterial({ color: '#ff8800' })
          );
          if (mechanismSystem && inst.axis) {
            mechanismSystem.registerSpinner(spinner, inst.axis as 'x'|'y'|'z', 3);
          }
          mesh = spinner;
          break;
        }
        case 'shard': {
          const geom = new THREE.OctahedronGeometry(0.5);
          const mat = new THREE.MeshStandardMaterial({ color: '#ff00ff', emissive: '#330033' });
          const shard = new THREE.Mesh(geom, mat);
          shard.userData = { collectible: true, type: 'shard', id: inst.shardId };
          mesh = shard;
          break;
        }
        default: break;
      }
      if (mesh) {
        mesh.position.set(inst.position[0], inst.position[1], inst.position[2]);
        if (inst.rotation) mesh.rotation.set(inst.rotation[0], inst.rotation[1], inst.rotation[2]);
        if (inst.scale) mesh.scale.setScalar(inst.scale);
        this.group.add(mesh);
        this.objects.push({ mesh, type: inst.type });
      }
    });
  }

  releaseObjects(manager: ChunkManager) {
    this.objects.forEach(({ mesh, type }) => {
      // Remove from group first so Chunk.dispose() doesn't also destroy pooled meshes
      this.group.remove(mesh);
      if (type === 'ring') manager.releaseRing(mesh as THREE.Mesh);
      else if (type === 'energyCore') manager.releaseCore(mesh as THREE.Mesh);
      else if (type === 'obstacle') manager.releaseObstacle(mesh as THREE.Mesh);
      else if (type === 'boostPad') manager.releaseBoost(mesh as THREE.Mesh);
      else if (type === 'bouncePad') manager.releaseBouncePad(mesh as THREE.Mesh);
      else if (type === 'movingPlatform') manager.releaseMovingPlatform(mesh as THREE.Mesh);
      else {
        // Non-pooled objects (spinners, shards): dispose inline
        if (mesh instanceof THREE.Mesh) {
          mesh.geometry?.dispose();
          (mesh.material as THREE.Material)?.dispose();
        }
      }
    });
    this.objects = [];
  }

  dispose() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else (child.material as THREE.Material)?.dispose();
      }
    }
  }
}