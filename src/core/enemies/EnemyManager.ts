import * as THREE from 'three';
import { EnemyAI } from './EnemyAI';
import { ObjectPool } from '../engine/ObjectPool';

export class EnemyManager {
  private scene: THREE.Scene;
  private enemies: EnemyAI[] = [];
  private enemyPool: ObjectPool<THREE.Mesh>;
  private getPlayerZ: () => number;
  private spawnDistance = 40; // 在玩家前方多远生成
  private despawnDistance = 30; // 落后玩家多远销毁

  constructor(scene: THREE.Scene, getPlayerZ: () => number) {
    this.scene = scene;
    this.getPlayerZ = getPlayerZ;

    this.enemyPool = new ObjectPool<THREE.Mesh>(() => {
      const geom = new THREE.BoxGeometry(1, 1.6, 1);
      const mat = new THREE.MeshStandardMaterial({ color: '#ff4444' });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.userData = { type: 'enemy' };
      return mesh;
    }, 10);
  }

  update(delta: number) {
    const playerZ = this.getPlayerZ();

    // 生成新敌人 (简单逻辑：每 3 个 chunk 生成一只)
    const currentChunk = Math.floor(playerZ / 40);
    const shouldSpawn = currentChunk % 3 === 0 && currentChunk > 0;
    // 为避免重复生成，检查是否已经有敌人在附近
    const alreadySpawned = this.enemies.some(
      (e) => Math.abs(e.mesh.position.z - playerZ) < 20
    );

    if (shouldSpawn && !alreadySpawned && this.enemies.length < 8) {
      this.spawnEnemy(playerZ + this.spawnDistance);
    }

    // 更新所有敌人
    this.enemies.forEach((enemy) => enemy.update(delta));

    // 销毁落后太多的敌人
    this.enemies = this.enemies.filter((enemy) => {
      if (enemy.mesh.position.z < playerZ - this.despawnDistance) {
        this.enemyPool.release(enemy.mesh);
        return false;
      }
      return true;
    });
  }

  private spawnEnemy(z: number) {
    const x = (Math.random() - 0.5) * 10; // 道路宽度内
    const mesh = this.enemyPool.acquire();
    mesh.position.set(x, 0.8, z);

    // 巡逻路径 (在生成点附近移动)
    const patrolPoints = [
      new THREE.Vector3(x - 3, 0.8, z),
      new THREE.Vector3(x + 3, 0.8, z),
      new THREE.Vector3(x, 0.8, z + 4),
      new THREE.Vector3(x, 0.8, z - 2),
    ];

    const enemyAI = new EnemyAI(mesh, patrolPoints, this.scene);
    this.scene.add(mesh);
    this.enemies.push(enemyAI);
  }

  dispose() {
    this.enemies.forEach((e) => e.dispose());
    this.enemies = [];
    this.enemyPool.disposeAll();
  }
}