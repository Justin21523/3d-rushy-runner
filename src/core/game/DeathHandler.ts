import { useGameStore } from '../../stores/gameStore';

export class DeathHandler {
  private respawnDelay = 2.0;
  private respawnTimer = 0;
  private isDead = false;
  private lastCheckpoint: [number, number, number] = [0, 1, 0];

  update(delta: number) {
    const store = useGameStore.getState();
    if (store.player.hp <= 0 && !this.isDead && !store.player.invincible) {
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
    useGameStore.getState().setPhase('gameover');
    // 播放死亡音效
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
    store.setPhase('playing');
    this.isDead = false;
    // 播放重生音效
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('player-respawn'));
    }
  }

  setCheckpoint(pos: [number, number, number]) {
    this.lastCheckpoint = pos;
  }
}