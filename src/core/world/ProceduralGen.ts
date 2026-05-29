import { TerrainType, TERRAIN_CONFIGS } from './TerrainTypes';
import type { ChunkPath, PathPoint } from './RoadGenerator';


export interface InstanceDef {
  type: string;
  position: [number, number, number];
  subtype?: string;
  shardId?: string;
  rotation?: [number, number, number];
  scale?: number;
  pathId?: string;          // for moving platform identification
  axis?: 'x' | 'y' | 'z';   // rotation axis for spinner
  motionType?: 'linear';
  motionParams?: { endX: number; speed: number };
  rotationAxis?: 'x' | 'y' | 'z';
  rotationSpeed?: number;
}

export interface ChunkData {
  id: string;
  position: [number, number, number];
  loaded: boolean;
  objects: InstanceDef[];
  pathPoints: PathPoint[];
  terrainType: TerrainType;
}


export function generateChunkData(
  chunkIndex: number,
  path: ChunkPath
): ChunkData {
  const id = `chunk_${chunkIndex}`;
  const config = TERRAIN_CONFIGS[path.terrain];
  const objects: InstanceDef[] = [];

  // 沿路徑散佈障礙物、收集品等
  path.points.forEach((point, idx) => {
    const { pos, width } = point;
    // 平台塊本身會由 Chunk.ts 建立，這裡只放路上的物件

    // obstacles
    if (Math.random() < config.obstacleChance) {
      objects.push({
        type: 'obstacle',
        position: [pos.x + (Math.random() - 0.5) * width * 0.7, pos.y + 1, pos.z],
        subtype: Math.random() < 0.5 ? 'spike' : 'crate',
      });
    }


    // rings
    if (Math.random() < config.ringChance) {
      for (let r = 0; r < 3; r++) {
        objects.push({
          type: 'ring',
          position: [
            pos.x + (Math.random() - 0.5) * width,
            pos.y + 1.8 + Math.random() * 1.5,
            pos.z + (Math.random() - 0.5) * 2,
          ],
        });
      }
    }

    // energy core
    if (Math.random() < config.energyChance) {
      objects.push({ type: 'energyCore', position: [pos.x, pos.y + 2, pos.z] });
    }

    // shard
    if (Math.random() < config.shardChance) {
      objects.push({
        type: 'shard',
        position: [pos.x + (Math.random() - 0.5) * width, pos.y + 3, pos.z],
        shardId: `shard_${id}_${idx}`,
      });
    }

    // boost pad
    if (Math.random() < config.boostChance) {
      objects.push({ type: 'boostPad', position: [pos.x, pos.y + 0.15, pos.z] });
    }

    // bounce pad (new)
    if (Math.random() < config.bounceChance) {
      objects.push({ type: 'bouncePad', position: [pos.x + (Math.random() - 0.5) * width, pos.y + 0.1, pos.z] });
    }

    // spinner (new) – placed at specific locations, not per point to avoid too many
    if (idx === Math.floor(path.points.length / 2) && config.spinnerCount > 0) {
      for (let s = 0; s < config.spinnerCount; s++) {
        objects.push({
          type: 'spinner',
          position: [pos.x + (s - 1) * 3, pos.y + 2, pos.z],
          axis: 'y',
        });
      }
    }

  });
  
  // 新增 platforms 數組到 objects
  if (config.movingPlatformCount > 0) {
    for (let m = 0; m < config.movingPlatformCount; m++) {
      const pointIdx = Math.floor((m / config.movingPlatformCount) * path.points.length);
      const point = path.points[pointIdx];
      objects.push({
        type: 'movingPlatform',
        position: [point.pos.x, point.pos.y + 1.5, point.pos.z],
        motionType: 'linear',
        motionParams: { endX: point.pos.x + 4, speed: 0.8 },
        pathId: `${id}_move_${m}`,
      });
    }
  }
  // 增加旋轉平台
  if (config.spinnerCount > 0) {
    for (let s = 0; s < config.spinnerCount; s++) {
      objects.push({
        type: 'rotatingPlatform',
        position: [path.points[Math.floor(path.points.length/2)].pos.x + (s-1)*4, 2, path.points[Math.floor(path.points.length/2)].pos.z],
        rotationAxis: 'y',
        rotationSpeed: 1.5 + s,
      });
    }
  }

  // moving platforms (new) – attach to specific path points
  if (config.movingPlatformCount > 0) {
    for (let m = 0; m < config.movingPlatformCount; m++) {
      const startPoint = path.points[Math.floor((m / config.movingPlatformCount) * path.points.length)];
      objects.push({
        type: 'movingPlatform',
        position: [startPoint.pos.x, startPoint.pos.y + 1.5, startPoint.pos.z],
        pathId: `${id}_move_${m}`,
        rotation: [0, 0, 0],
      });
    }
  }

  return {
    id,
    position: [0, 0, path.points[0]?.pos.z ?? chunkIndex * 40],
    loaded: false,
    objects,
    pathPoints: path.points,
    terrainType: path.terrain,
  };
}
