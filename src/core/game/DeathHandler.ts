import { useGameStore } from '../../stores/gameStore';

const GOD_MODE = false;

export class DeathHandler {
  private respawnDelay = 2.0;
  private respawnTimer = 0;
  private isDead = false;
  private lastCheckpoint: [number, number, number] = [0, 1, 0];

  update(delta: number) {
    if (GOD_MODE) return; // infinite run — no death, no respawn

    const store = useGameStore.getState();
    const phase = store.phase;
    if (phase !== 'playing' && phase !== 'gameover') return;

    if (phase === 'playing' && store.player.hp <= 0 && !this.isDead && !store.player.invincible) {
      this.die();
    }

    if (this.isDead) {
      this.respawnTimer -= delta;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
    }
  }

  private die() {
    this.isDead = true;
    this.respawnTimer = this.respawnDelay;
    const store = useGameStore.getState();
    store.commitRecords();
    useGameStore.setState((s) => ({ runStats: { ...s.runStats, deaths: s.runStats.deaths + 1 } }));
    store.setPhase('gameover');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('player-death'));
    }
  }

  private respawn() {
    const store = useGameStore.getState();
    store.setPlayerState({
      hp: store.player.maxHp,
      position: this.lastCheckpoint,
      velocity: [0, 0, 0],
      grounded: false,
      invincible: true,
    });
    store.resetCombo();
    store.setPhase('playing');
    this.isDead = false;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('player-respawn'));
    }
  }

  setCheckpoint(pos: [number, number, number]) {
    this.lastCheckpoint = pos;
  }
}
