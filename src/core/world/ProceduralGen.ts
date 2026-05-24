import { TerrainType, TERRAIN_CONFIGS } from './TerrainTypes';
import type { ChunkPath, PathPoint } from './RoadGenerator';


export interface InstanceDef {
  type: string;
  position: [number, number, number];
  subtype?: string;
  shardId?: string;
  rotation?: [number, number, number];
  scale?: number;
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

    // 障礙物 (放在路面上方)
    if (Math.random() < config.obstacleChance) {
      // 避開邊緣，放在路中間
      const ox = pos.x + (Math.random() - 0.5) * (width - 2);
      objects.push({
        type: 'obstacle',
        position: [ox, pos.y + 1, pos.z],
        subtype: Math.random() < 0.5 ? 'spike' : 'crate',
      });
    }

    // 金環 (浮在空中)
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

    // 能量核心
    if (Math.random() < config.energyChance) {
      objects.push({
        type: 'energyCore',
        position: [pos.x, pos.y + 2, pos.z],
      });
    }

    // 碎片
    if (Math.random() < config.shardChance) {
      objects.push({
        type: 'shard',
        position: [pos.x + (Math.random() - 0.5) * width, pos.y + 3, pos.z],
        shardId: `shard_${chunkIndex}_${idx}`,
      });
    }

    // 加速板
    if (Math.random() < config.boostChance) {
      objects.push({
        type: 'boostPad',
        position: [pos.x, pos.y + 0.15, pos.z],
      });
    }
  });

  return {
    id,
    position: [0, 0, path.points[0]?.pos.z ?? chunkIndex * 40],
    loaded: false,
    objects,
    pathPoints: path.points,
    terrainType: path.terrain,
  };
}