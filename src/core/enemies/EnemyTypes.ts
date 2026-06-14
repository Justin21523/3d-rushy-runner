import * as THREE from 'three';

export interface EnemyTemplate {
  type: string;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  health: number;
  speed: number;
  chaseSpeed: number;
  damage: number;
  detectRange: number;
  patrolRadius: number;
  halfHeight: number; // vertical half-extent for stomp detection
  color: string;
}

export const ENEMY_TYPES: Record<string, EnemyTemplate> = {
  grunt: {
    type: 'grunt',
    geometry: new THREE.BoxGeometry(1, 1.6, 1),
    material: new THREE.MeshStandardMaterial({ color: '#ff4444' }),
    health: 1, speed: 4, chaseSpeed: 7, damage: 10,
    detectRange: 8, patrolRadius: 4, halfHeight: 0.8, color: '#ff4444',
  },
  flier: {
    type: 'flier',
    geometry: new THREE.SphereGeometry(0.8),
    material: new THREE.MeshStandardMaterial({ color: '#ff8844' }),
    health: 2, speed: 5, chaseSpeed: 9, damage: 15,
    detectRange: 10, patrolRadius: 3, halfHeight: 0.8, color: '#ff8844',
  },
  turret: {
    type: 'turret',
    geometry: new THREE.CylinderGeometry(0.6, 0.8, 2),
    material: new THREE.MeshStandardMaterial({ color: '#cc44cc' }),
    health: 3, speed: 0, chaseSpeed: 0, damage: 20,
    detectRange: 12, patrolRadius: 0, halfHeight: 1.0, color: '#cc44cc',
  },
  boss: {
    type: 'boss',
    geometry: new THREE.ConeGeometry(1.5, 3, 8),
    material: new THREE.MeshStandardMaterial({ color: '#ff0000' }),
    health: 10, speed: 3, chaseSpeed: 6, damage: 30,
    detectRange: 15, patrolRadius: 6, halfHeight: 1.5, color: '#ff0000',
  },
};