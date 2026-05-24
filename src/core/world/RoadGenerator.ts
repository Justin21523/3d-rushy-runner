import { Vector3 } from 'three';
import { TerrainType, pickTerrainType } from './TerrainTypes';

const CHUNK_LENGTH = 40; // Z 軸長度
const CHUNK_WIDTH = 8;   // 預設道路寬度
const PLATFORM_STEP = 4; // 每個平台塊之間的距離

export interface PathPoint {
  pos: Vector3;      // 世界座標
  width: number;     // 此處道路寬度
  tilt: number;      // 側傾角度 (未來可用)
}

export interface ChunkPath {
  points: PathPoint[];
  terrain: TerrainType;
}

/**
 * 根據 Chunk 索引產生一段路徑。
 * 每個 Chunk 的起點會接續前一個 Chunk 的終點。
 * 我們使用一個全域偽隨機種子，確保相同索引總是產生相同路徑。
 */
export function generateChunkPath(chunkIndex: number, previousEnd: Vector3): ChunkPath {
  const terrain = pickTerrainType();
  const points: PathPoint[] = [];
  const stepCount = Math.floor(CHUNK_LENGTH / PLATFORM_STEP);
  let currentPos = previousEnd.clone();

  // 隨機種子 (基於 chunkIndex)
  const seed = chunkIndex * 12345;
  const random = (n: number) => {
    const x = Math.sin(seed + n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  // 決定這一段的彎曲幅度和高度變化
  const curveAmount = terrain === TerrainType.Hills ? 2.5 : 
                      terrain === TerrainType.ObstacleDense ? 0.8 : 1.5;
  const heightAmount = terrain === TerrainType.Hills ? 1.2 : 
                       terrain === TerrainType.Mixed ? 0.8 : 0.3;

  for (let i = 0; i < stepCount; i++) {
    const t = i / (stepCount - 1);
    // 橫向偏移 (模擬彎路)
    const offsetX = Math.sin(t * Math.PI * 2 + chunkIndex * 0.7) * curveAmount;
    // 高度變化
    const offsetY = Math.sin(t * Math.PI * 1.5 + chunkIndex * 0.5) * heightAmount;
    // 寬度變化 (窄橋、寬路)
    let width = CHUNK_WIDTH;
    if (terrain === TerrainType.ObstacleDense && random(i + 10) < 0.3) width = 3; // 窄橋
    if (terrain === TerrainType.SpeedBoost) width = 12; // 寬敞加速區
    if (terrain === TerrainType.CoinRush && random(i + 20) < 0.5) width = 6;

    const pos = new Vector3(
      offsetX,
      offsetY,
      currentPos.z + PLATFORM_STEP
    );
    points.push({ pos: pos.clone(), width, tilt: 0 });
    currentPos = pos;
  }

  // 確保終點高度回到 0 附近，避免無限升高
  const last = points[points.length - 1];
  last.pos.y = Math.max(-2, Math.min(2, last.pos.y));

  return { points, terrain };
}