import { AudioManager } from './AudioManager';

// 简单的音效事件绑定，替代复杂的全局事件
export function setupSoundEvents(audio: AudioManager) {
  if (typeof window === 'undefined') return;

  const onEnemyAttack = (_e: Event) => {
    audio.play('hit');
  };
  const onPlayerDeath = () => {
    audio.play('death');
  };
  const onPlayerRespawn = () => {
    audio.play('respawn');
  };

  window.addEventListener('enemy-attack', onEnemyAttack);
  window.addEventListener('player-death', onPlayerDeath);
  window.addEventListener('player-respawn', onPlayerRespawn);

  // 返回清理函数
  return () => {
    window.removeEventListener('enemy-attack', onEnemyAttack);
    window.removeEventListener('player-death', onPlayerDeath);
    window.removeEventListener('player-respawn', onPlayerRespawn);
  };
}