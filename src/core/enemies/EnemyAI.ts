import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

export enum EnemyState {
  Patrol = 'patrol',
  Chase = 'chase',
  Return = 'return',
}

export class EnemyAI {
  mesh: THREE.Mesh;
  state: EnemyState = EnemyState.Patrol;
  patrolPoints: THREE.Vector3[];
  currentPatrolIndex = 0;
  speed = 4;
  chaseSpeed = 7;
  detectRange = 8;
  attackRange = 2;
  damage = 15;
  health = 1; // 一击必杀（可调整）
  private homePosition: THREE.Vector3;
  private scene: THREE.Scene;
  private attackCooldown = 0;
  private attackInterval = 2; // seconds between attacks
  
  constructor(
    mesh: THREE.Mesh,
    patrolPath: THREE.Vector3[],
    scene: THREE.Scene
  ) {
    this.mesh = mesh;
    this.patrolPoints = patrolPath;
    this.homePosition = patrolPath[0]?.clone() ?? new THREE.Vector3();
    this.scene = scene;
  }

  update(delta: number) {
    const store = useGameStore.getState();
    const playerPos = new THREE.Vector3(
      store.player.position[0],
      store.player.position[1],
      store.player.position[2]
    );
    const enemyPos = this.mesh.position;
    const distToPlayer = enemyPos.distanceTo(playerPos);

    switch (this.state) {
      case EnemyState.Patrol:
        this.patrol(delta);
        if (distToPlayer < this.detectRange) {
          this.state = EnemyState.Chase;
        }
        break;

      case EnemyState.Chase:
        this.chase(delta, playerPos);
        if (distToPlayer < this.attackRange) {
          this.attackPlayer();
        }
        if (distToPlayer > this.detectRange * 1.5) {
          this.state = EnemyState.Return;
        }
        break;

      case EnemyState.Return:
        this.returnHome(delta);
        if (enemyPos.distanceTo(this.homePosition) < 0.5) {
          this.state = EnemyState.Patrol;
        }
        break;
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('magic-burst', this.onMagicBurst as EventListener);
    }
  }
  
  private onMagicBurst = (e: CustomEvent) => {
    const burstPos = e.detail as THREE.Vector3;
    if (this.mesh.position.distanceTo(burstPos) < 8) {
      this.takeDamage(5);
    }
  };
  
  // 增加 takeDamage 方法
  public takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.dispose();
    }
  }

  private patrol(delta: number) {
    const target = this.patrolPoints[this.currentPatrolIndex];
    const dir = new THREE.Vector3().subVectors(target, this.mesh.position);
    const dist = dir.length();
    if (dist < 0.5) {
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    } else {
      dir.normalize();
      this.mesh.position.add(dir.multiplyScalar(this.speed * delta));
    }
  }

  private chase(delta: number, playerPos: THREE.Vector3) {
    const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position);
    dir.normalize();
    this.mesh.position.add(dir.multiplyScalar(this.chaseSpeed * delta));
  }

  private returnHome(delta: number) {
    const dir = new THREE.Vector3().subVectors(this.homePosition, this.mesh.position);
    if (dir.length() > 0.5) {
      dir.normalize();
      this.mesh.position.add(dir.multiplyScalar(this.speed * delta));
    }
  }

  private attackPlayer() {
    // 通过 store 触发伤害并播放音效
    // 实际伤害由 CollisionSystem 或直接调用 controller
    // 这里我们使用自定义事件或直接调用全局方法
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('enemy-attack', { detail: this.damage }));
    }
    // 攻击后稍微后退
    this.state = EnemyState.Return;
  }

  dispose() {
    // 释放资源
    this.mesh.geometry?.dispose();
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach((m) => m.dispose());
    } else {
      (this.mesh.material as THREE.Material)?.dispose();
    }
    this.scene.remove(this.mesh);
  }
}