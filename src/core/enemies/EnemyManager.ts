import * as THREE from 'three';
import { EnemyAI } from './EnemyAI';
import { EnemyTemplate, ENEMY_TYPES } from './EnemyTypes';
import { CharacterController } from '../controller/CharacterController';
import { useGameStore } from '../../stores/gameStore';
import {
  STOMP_RADIUS, STOMP_BOUNCE, STOMP_MIN_FALL_SPEED,
  STOMP_DAMAGE, STOMP_BOSS_DAMAGE, SCORE_STOMP,
} from '../combat/CombatSettings';

export class EnemyManager {
  private scene: THREE.Scene;
  private enemies: EnemyAI[] = [];
  private getPlayerZ: () => number;
  private controller: CharacterController;
  private spawnDistance = 50;
  private despawnDistance = 35;
  private spawnedChunks = new Set<number>();
  private spawnedBossStages = new Set<number>();
  private onBossEncounter = (event: Event) => {
    const stage = (event as CustomEvent<{ stage: number; z: number }>).detail;
    if (!stage || this.spawnedBossStages.has(stage.stage)) return;
    this.spawnedBossStages.add(stage.stage);
    this.spawnEnemy(stage.z + 25, ENEMY_TYPES.boss);
  };

  constructor(scene: THREE.Scene, getPlayerZ: () => number, controller: CharacterController) {
    this.scene = scene;
    this.getPlayerZ = getPlayerZ;
    this.controller = controller;
    window.addEventListener('boss-encounter', this.onBossEncounter);
  }

  update(delta: number) {
    const playerZ = this.getPlayerZ();
    const currentChunk = Math.floor(playerZ / 40);

    // spawn enemies based on chunk variety
    if (currentChunk % 2 === 0 && !this.spawnedChunks.has(currentChunk) && this.enemies.length < 6) {
      this.spawnedChunks.add(currentChunk);
      this.spawnEnemy(playerZ + this.spawnDistance);
    }

    this.enemies.forEach(e => e.update(delta));

    this.resolvePlayerCollisions();

    this.enemies = this.enemies.filter(e => {
      if (e.disposed || e.mesh.position.z < playerZ - this.despawnDistance) {
        if (!e.disposed) e.dispose();
        return false;
      }
      return true;
    });
  }

  /** Player ↔ enemy contact: stomp from above kills, side contact hurts. */
  private resolvePlayerCollisions() {
    const store = useGameStore.getState();
    const p = store.player;
    const px = p.position[0], py = p.position[1], pz = p.position[2];
    const playerFalling = this.controller.vel.y < STOMP_MIN_FALL_SPEED;

    for (const enemy of this.enemies) {
      if (enemy.disposed) continue;
      const ex = enemy.mesh.position.x, ey = enemy.mesh.position.y, ez = enemy.mesh.position.z;
      const dx = px - ex, dz = pz - ez;
      const horizDist = Math.hypot(dx, dz);
      if (horizDist > STOMP_RADIUS) continue;

      const fromAbove = playerFalling && py > ey + enemy.halfHeight * 0.5;
      if (fromAbove) {
        enemy.takeDamage(enemy.isBoss ? STOMP_BOSS_DAMAGE : STOMP_DAMAGE);
        this.controller.vel.y = STOMP_BOUNCE;
        store.addScore(SCORE_STOMP);
        store.addCombo();
        if (enemy.disposed) store.addEnemyDefeated();
        window.dispatchEvent(new CustomEvent('enemy-stomp', {
          detail: new THREE.Vector3(ex, ey, ez),
        }));
      } else if (!p.invincible) {
        window.dispatchEvent(new CustomEvent('enemy-attack', { detail: enemy.damage }));
      }
    }
  }

  private spawnEnemy(z: number, forcedTemplate?: EnemyTemplate) {
    const x = (Math.random() - 0.5) * 12;
    // pick random type based on depth: early grunts, later mixed
    let template: EnemyTemplate = forcedTemplate ?? ENEMY_TYPES.grunt;
    if (!forcedTemplate) {
      if (z < 300) template = ENEMY_TYPES.grunt;
      else if (z < 600) template = Math.random() < 0.3 ? ENEMY_TYPES.flier : ENEMY_TYPES.grunt;
      else template = Math.random() < 0.2 ? ENEMY_TYPES.turret : Math.random() < 0.35 ? ENEMY_TYPES.flier : ENEMY_TYPES.grunt;
    }

    const mesh = new THREE.Mesh(template.geometry.clone(), template.material.clone());
    const y = template.type === 'flier' ? 3.5 : template.type === 'boss' ? 1.5 : 0.8;
    mesh.position.set(x, y, z);
    const patrolPoints = [
      new THREE.Vector3(x - template.patrolRadius, y, z),
      new THREE.Vector3(x + template.patrolRadius, y, z),
    ];
    const ai = new EnemyAI(mesh, patrolPoints, this.scene);
    ai.configure({
      health: template.health,
      speed: template.speed,
      chaseSpeed: template.chaseSpeed,
      detectRange: template.detectRange,
      damage: template.damage,
      halfHeight: template.halfHeight,
      isBoss: template.type === 'boss',
    });
    this.scene.add(mesh);
    this.enemies.push(ai);
  }

  dispose() {
    window.removeEventListener('boss-encounter', this.onBossEncounter);
    this.enemies.forEach(e => e.dispose());
    this.enemies = [];
    this.spawnedChunks.clear();
    this.spawnedBossStages.clear();
  }
}
