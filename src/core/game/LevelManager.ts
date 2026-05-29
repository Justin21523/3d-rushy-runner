// src/core/game/LevelManager.ts (关卡终点检测与过场)
import { useGameStore } from '../../stores/gameStore';

export class LevelManager {
  private endZ = Infinity; // disabled during debug — no level end
  private checkEnd: () => number; // 返回玩家 Z

  constructor(getPlayerZ: () => number) {
    this.checkEnd = getPlayerZ;
  }

  update() {
    const store = useGameStore.getState();
    if (store.phase !== 'playing') return;
    if (this.checkEnd() >= this.endZ) {
      store.setPhase('levelComplete');
    }
  }
}