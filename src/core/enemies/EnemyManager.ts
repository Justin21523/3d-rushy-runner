import * as THREE from 'three';
import { EnemyAI } from './EnemyAI';
import { EnemyTemplate, ENEMY_TYPES } from './EnemyTypes';
import { ObjectPool } from '../engine/ObjectPool';

export class EnemyManager {
  private scene: THREE.Scene;
  private enemies: EnemyAI[] = [];
  private getPlayerZ: () => number;
  private spawnDistance = 50;
  private despawnDistance = 35;

  constructor(scene: THREE.Scene, getPlayerZ: () => number) {
    this.scene = scene;
    this.getPlayerZ = getPlayerZ;
  }

  update(delta: number) {
    const playerZ = this.getPlayerZ();
    const currentChunk = Math.floor(playerZ / 40);

    // spawn enemies based on chunk variety
    if (currentChunk % 2 === 0 && this.enemies.length < 6) {
      this.spawnEnemy(playerZ + this.spawnDistance);
    }

    this.enemies.forEach(e => e.update(delta));

    this.enemies = this.enemies.filter(e => {
      if (e.mesh.position.z < playerZ - this.despawnDistance) {
        e.dispose();
        return false;
      }
      return true;
    });
  }

  private spawnEnemy(z: number) {
    const x = (Math.random() - 0.5) * 12;
    // pick random type based on depth: early grunts, later mixed
    let template: EnemyTemplate;
    if (z < 300) template = ENEMY_TYPES.grub;
    else if (z < 600) template = Math.random() < 0.3 ? ENEMY_TYPES.flyer : ENEMY_TYPES.grunt;
    else template = Math.random() < 0.2 ? ENEMY_TYPES.turret : ENEMY_TYPES.grunt;

    const mesh = new THREE.Mesh(template.geometry.clone(), template.material.clone());
    mesh.position.set(x, 0.8, z);
    const patrolPoints = [
      new THREE.Vector3(x - template.patrolRadius, 0.8, z),
      new THREE.Vector3(x + template.patrolRadius, 0.8, z),
    ];
    const ai = new EnemyAI(mesh, patrolPoints, this.scene);
    this.scene.add(mesh);
    this.enemies.push(ai);
  }

  dispose() {
    this.enemies.forEach(e => e.dispose());
    this.enemies = [];
  }
}