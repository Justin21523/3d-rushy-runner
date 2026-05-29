import { useGameStore } from '../../stores/gameStore';

interface LevelStage {
  name: string;
  startZ: number;
  boss?: boolean;
}

export class LevelManager {
  private endZ = 1200;
  private stages: LevelStage[] = [
    { name: 'Neon Metro', startZ: 0 },
    { name: 'Skyline Ramps', startZ: 300 },
    { name: 'Spinner Alley', startZ: 600, boss: true },
    { name: 'Final Sprint', startZ: 900, boss: true },
  ];
  private currentStage = 0;
  private triggeredBossStages = new Set<number>();
  private getPlayerZ: () => number;

  constructor(getPlayerZ: () => number) {
    this.getPlayerZ = getPlayerZ;
  }

  update() {
    const store = useGameStore.getState();
    if (store.phase !== 'playing') return;
    const playerZ = this.getPlayerZ();

    const nextStage = this.stages[this.currentStage + 1];
    if (nextStage && playerZ >= nextStage.startZ) {
      this.currentStage++;
      window.dispatchEvent(new CustomEvent('stage-change', {
        detail: { stage: this.currentStage, name: nextStage.name, z: playerZ },
      }));
    }

    const stage = this.stages[this.currentStage];
    if (stage?.boss && !this.triggeredBossStages.has(this.currentStage)) {
      this.triggeredBossStages.add(this.currentStage);
      window.dispatchEvent(new CustomEvent('boss-encounter', {
        detail: { stage: this.currentStage, name: stage.name, z: playerZ },
      }));
    }

    if (playerZ >= this.endZ) {
      store.setPhase('levelComplete');
    }
  }
}
