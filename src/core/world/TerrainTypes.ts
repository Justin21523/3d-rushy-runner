export enum TerrainType {
  Flat = 'flat',
  Hills = 'hills',           // small height variations (visual only for now)
  ObstacleDense = 'obstacle_dense',
  CoinRush = 'coin_rush',
  SpeedBoost = 'speed_boost',
  Mixed = 'mixed',
}

export interface TerrainConfig {
  type: TerrainType;
  weight: number;             // probability weight
  obstacleChance: number;     // per object slot
  ringChance: number;
  energyChance: number;
  shardChance: number;
  boostChance: number;
  platformCount: number;      // number of floating platforms to generate
}

export const TERRAIN_CONFIGS: Record<TerrainType, TerrainConfig> = {
  [TerrainType.Flat]: {
    type: TerrainType.Flat,
    weight: 30,
    obstacleChance: 0.1,
    ringChance: 0.3,
    energyChance: 0.05,
    shardChance: 0.02,
    boostChance: 0.05,
    platformCount: 0,
  },
  [TerrainType.Hills]: {
    type: TerrainType.Hills,
    weight: 20,
    obstacleChance: 0.2,
    ringChance: 0.2,
    energyChance: 0.05,
    shardChance: 0.03,
    boostChance: 0.1,
    platformCount: 3,
  },
  [TerrainType.ObstacleDense]: {
    type: TerrainType.ObstacleDense,
    weight: 25,
    obstacleChance: 0.6,
    ringChance: 0.1,
    energyChance: 0.02,
    shardChance: 0.01,
    boostChance: 0.0,
    platformCount: 1,
  },
  [TerrainType.CoinRush]: {
    type: TerrainType.CoinRush,
    weight: 15,
    obstacleChance: 0.0,
    ringChance: 0.8,
    energyChance: 0.2,
    shardChance: 0.05,
    boostChance: 0.0,
    platformCount: 0,
  },
  [TerrainType.SpeedBoost]: {
    type: TerrainType.SpeedBoost,
    weight: 10,
    obstacleChance: 0.1,
    ringChance: 0.2,
    energyChance: 0.05,
    shardChance: 0.0,
    boostChance: 0.4,
    platformCount: 0,
  },
  [TerrainType.Mixed]: {
    type: TerrainType.Mixed,
    weight: 20,
    obstacleChance: 0.3,
    ringChance: 0.3,
    energyChance: 0.05,
    shardChance: 0.03,
    boostChance: 0.15,
    platformCount: 2,
  },
};

/** Pick a terrain type based on weights */
export function pickTerrainType(): TerrainType {
  const total = Object.values(TERRAIN_CONFIGS).reduce((sum, c) => sum + c.weight, 0);
  let r = Math.random() * total;
  for (const config of Object.values(TERRAIN_CONFIGS)) {
    r -= config.weight;
    if (r <= 0) return config.type;
  }
  return TerrainType.Flat;
}