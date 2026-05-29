import * as THREE from 'three';
import { ObjectPool } from '../engine/ObjectPool';
import { Chunk } from './Chunk';
import { generateChunkData } from './ProceduralGen';
import { generateChunkPath, type ChunkPath } from './RoadGenerator';
import { MechanismSystem } from '../mechanisms/MechanismSystem';

const CHUNK_LENGTH = 40;
const VIEW_AHEAD = 5;
const VIEW_BEHIND = 1;

export class ChunkManager {
  private scene: THREE.Scene;
  private chunks: Map<string, Chunk> = new Map();
  private ringPool: ObjectPool<THREE.Mesh>;
  private corePool: ObjectPool<THREE.Mesh>;
  private obstaclePool: ObjectPool<THREE.Mesh>;
  private boostPool: ObjectPool<THREE.Mesh>;
  private bouncePool: ObjectPool<THREE.Mesh>;
  private movingPlatformPool: ObjectPool<THREE.Mesh>;
  private getPlayerPos: () => THREE.Vector3;
  private previousEndPoint = new THREE.Vector3(0, 0, 0);
  public mechanismSystem: MechanismSystem;

  constructor(scene: THREE.Scene, getPlayerPos: () => THREE.Vector3, mechanism: MechanismSystem) {
    this.scene = scene;
    this.getPlayerPos = getPlayerPos;
    this.mechanismSystem = mechanism;

    this.ringPool = new ObjectPool<THREE.Mesh>(() => {
      const g = new THREE.TorusGeometry(0.4, 0.15, 8, 16);
      const m = new THREE.MeshStandardMaterial({ color: '#FFD700', emissive: '#332200' });
      const mesh = new THREE.Mesh(g, m);
      mesh.userData = { collectible: true, type: 'ring' };
      return mesh;
    }, 60);

    this.corePool = new ObjectPool<THREE.Mesh>(() => {
      const g = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const m = new THREE.MeshStandardMaterial({ color: '#00ffff', emissive: '#003333' });
      const mesh = new THREE.Mesh(g, m);
      mesh.userData = { collectible: true, type: 'energyCore' };
      return mesh;
    }, 20);

    this.obstaclePool = new ObjectPool<THREE.Mesh>(() => {
      const g = new THREE.ConeGeometry(0.5, 1.5, 8);
      const m = new THREE.MeshStandardMaterial({ color: '#ff4444' });
      const mesh = new THREE.Mesh(g, m);
      mesh.userData = { type: 'obstacle' };
      return mesh;
    }, 40);

    this.boostPool = new ObjectPool<THREE.Mesh>(() => {
      const g = new THREE.BoxGeometry(1.8, 0.2, 1.8);
      const m = new THREE.MeshStandardMaterial({ color: '#44ff44', emissive: '#004400' });
      const mesh = new THREE.Mesh(g, m);
      mesh.userData = { type: 'boostPad' };
      return mesh;
    }, 30);

    this.bouncePool = new ObjectPool<THREE.Mesh>(() => {
      const g = new THREE.CylinderGeometry(1, 1, 0.3, 8);
      const m = new THREE.MeshStandardMaterial({ color: '#ff8844', emissive: '#331100' });
      const mesh = new THREE.Mesh(g, m);
      mesh.userData = { type: 'bouncePad' };
      return mesh;
    }, 15);

    this.movingPlatformPool = new ObjectPool<THREE.Mesh>(() => {
      const g = new THREE.BoxGeometry(2, 0.3, 2);
      const m = new THREE.MeshStandardMaterial({ color: '#aaaaff' });
      return new THREE.Mesh(g, m);
    }, 10);
  }

  /** 每幀呼叫，根據玩家位置管理 Chunk */
  update() {
    const playerZ = this.getPlayerPos().z;
    const currentIndex = Math.floor(playerZ / CHUNK_LENGTH);

    // 確保生成前方所有需要的 chunk
    for (let i = currentIndex - VIEW_BEHIND; i <= currentIndex + VIEW_AHEAD; i++) {
      if (i < 0) continue;
      const id = `chunk_${i}`;
      if (!this.chunks.has(id)) {
        this.generateChunk(i);
      }
    }

    // 卸載太遠的 chunk
    this.chunks.forEach((_chunk, id) => {
      const idx = parseInt(id.split('_')[1]);
      if (idx < currentIndex - VIEW_BEHIND - 2 || idx > currentIndex + VIEW_AHEAD + 2) {
        this.unloadChunk(id);
      }
    });
  }

  private generateChunk(index: number) {
    // 取得前一塊的終點，若無則從原點開始
    const prevEnd = this.previousEndPoint.clone();
    const path: ChunkPath = generateChunkPath(index, prevEnd);
    const data = generateChunkData(index, path);
    const chunk = new Chunk(data.id);
    chunk.build(data, this);
    this.scene.add(chunk.group);
    this.chunks.set(data.id, chunk);

    // 更新下一塊的起點 (取最後一個點)
    const lastPoint = path.points[path.points.length - 1];
    this.previousEndPoint.copy(lastPoint.pos);
    this.previousEndPoint.z += 0.1;
  }

  private unloadChunk(id: string) {
    const chunk = this.chunks.get(id);
    if (!chunk) return;
    // remove moving platforms from mechanism system
    chunk.releaseObjects(this);
    this.scene.remove(chunk.group);
    chunk.dispose();
    this.chunks.delete(id);
  }

  // Pool 存取方法
  acquireRing() { return this.ringPool.acquire(); }
  releaseRing(m: THREE.Mesh) { this.ringPool.release(m); }
  acquireCore() { return this.corePool.acquire(); }
  releaseCore(m: THREE.Mesh) { this.corePool.release(m); }
  acquireObstacle(subtype?: string) {
    const mesh = this.obstaclePool.acquire();
    mesh.userData.subtype = subtype;
    return mesh;
  }
  releaseObstacle(m: THREE.Mesh) { this.obstaclePool.release(m); }
  acquireBoost() { return this.boostPool.acquire(); }
  releaseBoost(m: THREE.Mesh) { this.boostPool.release(m); }
  acquireBouncePad() { return this.bouncePool.acquire(); }
  releaseBouncePad(m: THREE.Mesh) { this.bouncePool.release(m); }
  acquireMovingPlatform() { return this.movingPlatformPool.acquire(); }
  releaseMovingPlatform(m: THREE.Mesh) { this.movingPlatformPool.release(m); }

  dispose() {
    this.chunks.forEach((_, id) => this.unloadChunk(id));
    this.ringPool.disposeAll();
    this.corePool.disposeAll();
    this.obstaclePool.disposeAll();
    this.boostPool.disposeAll();
    this.bouncePool.disposeAll();
    this.movingPlatformPool.disposeAll();
  }
}
