// src/stores/gameStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Inline type definitions for store
export interface PlayerState {
  position: [number, number, number];
  velocity: [number, number, number];
  grounded: boolean;
  hp: number;
  maxHp: number;
  rings: number;
  energy: number;
  action: string; // 'idle' | 'run' | 'jump' | 'fall' | 'slide' | 'dash' | 'wall'
  invincible: boolean;
}

export interface AbilityState {
  id: string;
  unlocked: boolean;
  cooldown: number;
  currentCooldown: number;
  level: number;
  active: boolean;
  remainingDuration: number;
}

export interface CollectibleProgress {
  rings: number;
  energyCores: number;
  shards: string[];
}

export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover' | 'levelComplete';

export interface GameState {
  phase: GamePhase;
  currentZone: string;
  player: PlayerState;
  abilities: AbilityState[];
  collectibles: CollectibleProgress;
  timeScale: number;
  setPhase: (p: GamePhase) => void;
  setPlayerState: (partial: Partial<PlayerState>) => void;
  setAbility: (id: string, updates: Partial<AbilityState>) => void;
  unlockAbility: (id: string) => void;
  addRings: (n: number) => void;
  addEnergyCores: (n: number) => void;
  addShard: (id: string) => void;
  setTimeScale: (s: number) => void;
  resetPlayer: () => void;

}

const initialPlayer: PlayerState = {
  position: [0, 1, 0],
  velocity: [0, 0, 0],
  grounded: false,
  hp: 100,
  maxHp: 100,
  rings: 0,
  energy: 0,
  action: 'idle',
  invincible: false,
};

const initialAbilities: AbilityState[] = [
  { id: 'timeSlow', unlocked: true, cooldown: 5, currentCooldown: 0, level: 1, active: false, remainingDuration: 0 },
  { id: 'blastDash', unlocked: true, cooldown: 3, currentCooldown: 0, level: 1, active: false, remainingDuration: 0 },
  { id: 'roll', unlocked: true, cooldown: 1, currentCooldown: 0, level: 1, active: false, remainingDuration: 0 },
  { id: 'doubleJump', unlocked: true, cooldown: 0.5, currentCooldown: 0, level: 1, active: false, remainingDuration: 0 },
  { id: 'magicBurst', unlocked: true, cooldown: 6, currentCooldown: 0, level: 1, active: false, remainingDuration: 0 },
  { id: 'gravityInvert', unlocked: false, cooldown: 8, currentCooldown: 0, level: 0, active: false, remainingDuration: 0 },
  { id: 'invincible', unlocked: false, cooldown: 15, currentCooldown: 0, level: 0, active: false, remainingDuration: 0 },
];

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      phase: 'playing',
      currentZone: 'Neon Metro',
      player: { ...initialPlayer },
      abilities: initialAbilities,
      collectibles: {
        rings: 0,
        energyCores: 0,
        shards: [],
      },
      timeScale: 1.0,
      setPhase: (phase) => set({ phase }),
      setPlayerState: (partial) =>
        set((s) => ({ player: { ...s.player, ...partial } })),
      setAbility: (id, updates) =>
        set((s) => ({
          abilities: s.abilities.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),
      unlockAbility: (id) =>
        set((s) => ({
          abilities: s.abilities.map((a) =>
            a.id === id ? { ...a, unlocked: true, level: Math.max(a.level, 1) } : a
          ),
        })),
      addRings: (n) =>
        set((s) => ({
          collectibles: { ...s.collectibles, rings: s.collectibles.rings + n },
        })),
      addEnergyCores: (n) =>
        set((s) => ({
          collectibles: {
            ...s.collectibles,
            energyCores: Math.max(0, s.collectibles.energyCores + n),
          },
        })),
      addShard: (id) =>
        set((s) => ({
          collectibles: {
            ...s.collectibles,
            shards: [...s.collectibles.shards, id],
          },
        })),
      setTimeScale: (scale) => set({ timeScale: scale }),
      resetPlayer: () =>
        set({ player: { ...initialPlayer }, phase: 'playing' }),
    }),
    {
      name: 'game-progress',
      partialize: (state) => ({
        collectibles: state.collectibles,
        abilities: state.abilities,
      }),
    }
  )
);
