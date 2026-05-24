export interface BgObjectDef {
  type: 'building' | 'mountain' | 'cloud' | 'tree' | 'lamp';
  position: [number, number, number]; // 世界座標
  scale?: number;
  color?: string;
}

export interface BgChunkData {
  id: string;
  position: [number, number, number]; // chunk 中心點
  objects: BgObjectDef[];
}

/**
 * 根據 chunk 索引生成遠處的背景物件。
 * 背景物件放在道路兩側與天空，跟隨攝像機平移。
 */
export function generateBackgroundChunk(chunkZ: number): BgChunkData {
  const id = `bg_${chunkZ}`;
  const baseZ = chunkZ * 80; // 背景 chunk 長度較大
  const objects: BgObjectDef[] = [];

  // 左側建築群
  for (let i = 0; i < 3; i++) {
    const z = baseZ + i * 25 + Math.random() * 15;
    const x = -30 - Math.random() * 20;
    const height = 3 + Math.random() * 12;
    objects.push({
      type: 'building',
      position: [x, height / 2, z],
      scale: height,
      color: `hsl(${200 + Math.random() * 40}, 60%, ${30 + Math.random() * 20}%)`,
    });
  }

  // 右側建築群
  for (let i = 0; i < 3; i++) {
    const z = baseZ + i * 25 + Math.random() * 15;
    const x = 30 + Math.random() * 20;
    const height = 3 + Math.random() * 12;
    objects.push({
      type: 'building',
      position: [x, height / 2, z],
      scale: height,
      color: `hsl(${200 + Math.random() * 40}, 60%, ${30 + Math.random() * 20}%)`,
    });
  }

  // 山脈 (遠景，推到兩側極遠處避免遮蓋玩家)
  for (let i = 0; i < 2; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    objects.push({
      type: 'mountain',
      position: [
        side * (80 + Math.random() * 40),
        0,
        baseZ + i * 40 + Math.random() * 20,
      ],
      scale: 8 + Math.random() * 20,
    });
  }

  // 雲層 (高空，不會擋到玩家)
  for (let i = 0; i < 4; i++) {
    objects.push({
      type: 'cloud',
      position: [
        (Math.random() - 0.5) * 80,
        25 + Math.random() * 15,
        baseZ + i * 20 + Math.random() * 30,
      ],
      scale: 2 + Math.random() * 5,
    });
  }

  // 樹木 (推到側邊安全距離外)
  for (let i = 0; i < 5; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    objects.push({
      type: 'tree',
      position: [
        side * (25 + Math.random() * 15),
        0,
        baseZ + i * 15 + Math.random() * 20,
      ],
      scale: 1.5 + Math.random() * 2.5,
    });
  }

  return {
    id,
    position: [0, 0, baseZ],
    objects,
  };
}