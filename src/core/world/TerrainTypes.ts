export enum TerrainType {
  Flat = 'flat',
  Hills = 'hills',           // small height variations (visual only for now)
  ObstacleDense = 'obstacle_dense',
  CoinRush = 'coin_rush',
  SpeedBoost = 'speed_boost',
  Mixed = 'mixed',
  BounceWorld = 'bounce_world',        // 大量弹跳板
  MovingPlatforms = 'moving_platforms', // 移动平台区域
  SpinnerAlley = 'spinner_alley',      // 旋转障碍物
}

export interface TerrainConfig {
  type: TerrainType;
  weight: number;             // probability weight
  obstacleChance: number;     // per object slot
  ringChance: number;
  energyChance: number;
  shardChance: number;
  boostChance: number;
  bounceChance: number;          // 新增：弹跳板机率
  movingPlatformCount: number;   // 新增：移动平台数量
  spinnerCount: number;          // 新增：旋转障碍物数量
  platformCount: number;      // number of floating platforms to generate
}

export const TERRAIN_CONFIGS: Record<TerrainType, TerrainConfig> = {
  [TerrainType.Flat]: {
    type: TerrainType.Flat, weight: 25,
    obstacleChance: 0.1, ringChance: 0.3, energyChance: 0.05, shardChance: 0.02,
    boostChance: 0.05, bounceChance: 0.0, movingPlatformCount: 0, spinnerCount: 0, platformCount: 0,
  },
  [TerrainType.Hills]: {
    type: TerrainType.Hills, weight: 15,
    obstacleChance: 0.2, ringChance: 0.2, energyChance: 0.05, shardChance: 0.03,
    boostChance: 0.1, bounceChance: 0.05, movingPlatformCount: 0, spinnerCount: 0, platformCount: 3,
  },
  [TerrainType.ObstacleDense]: {
    type: TerrainType.ObstacleDense, weight: 15,
    obstacleChance: 0.6, ringChance: 0.1, energyChance: 0.02, shardChance: 0.01,
    boostChance: 0.0, bounceChance: 0.0, movingPlatformCount: 0, spinnerCount: 0, platformCount: 1,
  },
  [TerrainType.CoinRush]: {
    type: TerrainType.CoinRush, weight: 10,
    obstacleChance: 0.0, ringChance: 0.8, energyChance: 0.2, shardChance: 0.05,
    boostChance: 0.0, bounceChance: 0.0, movingPlatformCount: 0, spinnerCount: 0, platformCount: 0,
  },
  [TerrainType.SpeedBoost]: {
    type: TerrainType.SpeedBoost, weight: 10,
    obstacleChance: 0.1, ringChance: 0.2, energyChance: 0.05, shardChance: 0.0,
    boostChance: 0.4, bounceChance: 0.0, movingPlatformCount: 0, spinnerCount: 0, platformCount: 0,
  },
  [TerrainType.Mixed]: {
    type: TerrainType.Mixed, weight: 10,
    obstacleChance: 0.3, ringChance: 0.3, energyChance: 0.05, shardChance: 0.03,
    boostChance: 0.15, bounceChance: 0.1, movingPlatformCount: 1, spinnerCount: 0, platformCount: 2,
  },
  [TerrainType.BounceWorld]: {
    type: TerrainType.BounceWorld, weight: 5,
    obstacleChance: 0.0, ringChance: 0.2, energyChance: 0.1, shardChance: 0.0,
    boostChance: 0.0, bounceChance: 0.6, movingPlatformCount: 0, spinnerCount: 0, platformCount: 0,
  },
  [TerrainType.MovingPlatforms]: {
    type: TerrainType.MovingPlatforms, weight: 5,
    obstacleChance: 0.1, ringChance: 0.3, energyChance: 0.05, shardChance: 0.0,
    boostChance: 0.0, bounceChance: 0.0, movingPlatformCount: 4, spinnerCount: 0, platformCount: 0,
  },
  [TerrainType.SpinnerAlley]: {
    type: TerrainType.SpinnerAlley, weight: 5,
    obstacleChance: 0.2, ringChance: 0.2, energyChance: 0.0, shardChance: 0.0,
    boostChance: 0.0, bounceChance: 0.0, movingPlatformCount: 0, spinnerCount: 3, platformCount: 0,
  },
};

export function pickTerrainType(): TerrainType {
  const total = Object.values(TERRAIN_CONFIGS).reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const config of Object.values(TERRAIN_CONFIGS)) {
    r -= config.weight;
    if (r <= 0) return config.type;
  }
  return TerrainType.Flat;
}