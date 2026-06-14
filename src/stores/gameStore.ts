// src/stores/gameStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COMBO_WINDOW } from '../core/combat/CombatSettings';

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

export interface RunStats {
  score: number;
  combo: number;          // current combo count (0 = no combo)
  comboTimer: number;     // seconds left before the combo resets
  distance: number;       // synced from controller.maxReachedZ
  time: number;           // elapsed seconds this run
  enemiesDefeated: number;
  deaths: number;
}

export interface BestRecords {
  highScore: number;
  longestDistance: number;
  mostRings: number;
}

export interface GameState {
  phase: GamePhase;
  currentZone: string;
  player: PlayerState;
  abilities: AbilityState[];
  collectibles: CollectibleProgress;
  runStats: RunStats;
  bestRecords: BestRecords;
  timeScale: number;
  setPhase: (p: GamePhase) => void;
  setPlayerState: (partial: Partial<PlayerState>) => void;
  setAbility: (id: string, updates: Partial<AbilityState>) => void;
  unlockAbility: (id: string) => void;
  addRings: (n: number) => void;
  addEnergyCores: (n: number) => void;
  addShard: (id: string) => void;
  loseRings: () => void;
  addScore: (base: number) => void;
  addCombo: () => void;
  resetCombo: () => void;
  addEnemyDefeated: () => void;
  setDistance: (d: number) => void;
  tickRun: (dt: number) => void;
  commitRecords: () => void;
  resetRun: () => void;
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

const initialRunStats: RunStats = {
  score: 0,
  combo: 0,
  comboTimer: 0,
  distance: 0,
  time: 0,
  enemiesDefeated: 0,
  deaths: 0,
};

const initialBestRecords: BestRecords = {
  highScore: 0,
  longestDistance: 0,
  mostRings: 0,
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
      runStats: { ...initialRunStats },
      bestRecords: { ...initialBestRecords },
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
      loseRings: () =>
        set((s) => ({
          collectibles: { ...s.collectibles, rings: 0 },
        })),
      addScore: (base) =>
        set((s) => ({
          runStats: {
            ...s.runStats,
            score: s.runStats.score + Math.round(base * (1 + s.runStats.combo * 0.1)),
          },
        })),
      addCombo: () =>
        set((s) => ({
          runStats: { ...s.runStats, combo: s.runStats.combo + 1, comboTimer: COMBO_WINDOW },
        })),
      resetCombo: () =>
        set((s) => ({
          runStats: { ...s.runStats, combo: 0, comboTimer: 0 },
        })),
      addEnemyDefeated: () =>
        set((s) => ({
          runStats: { ...s.runStats, enemiesDefeated: s.runStats.enemiesDefeated + 1 },
        })),
      setDistance: (d) =>
        set((s) =>
          d > s.runStats.distance ? { runStats: { ...s.runStats, distance: d } } : {}
        ),
      tickRun: (dt) =>
        set((s) => {
          const time = s.runStats.time + dt;
          let combo = s.runStats.combo;
          let comboTimer = s.runStats.comboTimer;
          if (comboTimer > 0) {
            comboTimer = Math.max(0, comboTimer - dt);
            if (comboTimer === 0) combo = 0;
          }
          return { runStats: { ...s.runStats, time, combo, comboTimer } };
        }),
      commitRecords: () =>
        set((s) => ({
          bestRecords: {
            highScore: Math.max(s.bestRecords.highScore, s.runStats.score),
            longestDistance: Math.max(s.bestRecords.longestDistance, s.runStats.distance),
            mostRings: Math.max(s.bestRecords.mostRings, s.collectibles.rings),
          },
        })),
      resetRun: () => set({ runStats: { ...initialRunStats } }),
      setTimeScale: (scale) => set({ timeScale: scale }),
      resetPlayer: () =>
        set({ player: { ...initialPlayer }, phase: 'playing' }),
    }),
    {
      name: 'game-progress',
      partialize: (state) => ({
        collectibles: state.collectibles,
        abilities: state.abilities,
        bestRecords: state.bestRecords,
      }),
    }
  )
);
