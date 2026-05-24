// Global state shape (Zustand)
export interface GameState {
  phase: 'menu' | 'playing' | 'paused' | 'gameover';
  currentZone: string;
  player: PlayerState;
  abilities: AbilityState[];
  collectibles: CollectibleProgress;
}

export interface PlayerState {
  position: [number, number, number];
  velocity: [number, number, number];
  grounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  hp: number;
  rings: number;
  energy: number;
}

export interface AbilityState {
  id: string;
  unlocked: boolean;
  cooldown: number;
  currentCooldown: number;
  level: number;
}

export interface CollectibleProgress {
  rings: number;
  energyCores: number;
  shards: Set<string>;
}

export interface ChunkData {
  id: string;
  position: [number, number, number];
  loaded: boolean;
  objects: InstanceDef[];
}

export interface InstanceDef {
  type: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}