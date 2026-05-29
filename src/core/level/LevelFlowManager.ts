import { useGameStore } from '../../stores/gameStore';

export class LevelFlowManager {
  private stageLengths = [300, 600, 900]; // Z 座標里程碑
  private currentStage = 0;

  update(playerZ: number) {
    const store = useGameStore.getState();
    if (store.phase !== 'playing') return;

    if (this.currentStage < this.stageLengths.length && playerZ > this.stageLengths[this.currentStage]) {
      this.currentStage++;
      // trigger stage event (e.g., boss spawn)
      window.dispatchEvent(new CustomEvent('stage-change', { detail: this.currentStage }));
    }
  }
}