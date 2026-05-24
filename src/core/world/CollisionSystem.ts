// src/core/world/CollisionSystem.ts (处理障碍物伤害、加速板触发)

import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { CharacterController } from '../controller/CharacterController';

export class CollisionSystem {
  private scene: THREE.Scene;
  private playerPosRef: () => THREE.Vector3;
  controller: CharacterController;

  constructor(scene: THREE.Scene, controller: CharacterController, playerPosGetter: () => THREE.Vector3) {
    this.scene = scene;
    this.controller = controller;
    this.playerPosRef = playerPosGetter;
  }

  update() {
    const playerPos = this.playerPosRef();
    const store = useGameStore.getState();

    this.scene.traverse((obj) => {
      if (!obj.userData?.type) return;
      const type = obj.userData.type as string;
      const objPos = obj.position;

      // 简单的 AABB 碰撞检测（基于距离）
      const dist = playerPos.distanceTo(objPos);
      if (dist > 2.5) return; // 超过范围忽略

      if (type === 'obstacle') {
        // 检查玩家是否太靠近 (近距离碰撞)
        if (dist < 1.2) {
          if (!store.player.invincible) {
            store.setPlayerState({ hp: Math.max(0, store.player.hp - 10) });
          }
          // 短暂无敌？这里简单处理：退后一步并弹起
          this.controller.vel.y = 5;
          const pushDir = new THREE.Vector3()
            .subVectors(playerPos, objPos)
            .normalize();
          this.controller.vel.x += pushDir.x * 6;
          this.controller.vel.z += pushDir.z * 6;
          // 避免连续伤害（将障碍物暂时禁用或设置冷却）
          obj.userData.lastHit = performance.now();
        }
      }

      if (type === 'boostPad') {
        // 加速板：玩家踩上去 (Y 接近)
        if (dist < 1.5 && Math.abs(playerPos.y - objPos.y) < 1.0) {
          // 给玩家一个 Z 轴正向的大速度
          this.controller.vel.z = this.controller.config.dashSpeed;
          this.controller.vel.y = 6; // 轻微弹起
          // 可以在 boostPad 上播放特效，但这里只做物理效果
        }
      }
    });
  }
}