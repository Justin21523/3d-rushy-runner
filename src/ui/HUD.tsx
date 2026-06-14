// src/ui/HUD.tsx

import { Html } from '@react-three/drei';
import { useGameStore } from '../stores/gameStore';
import { usePerformanceStore } from '../stores/performanceStore';
import { COMBO_WINDOW } from '../core/combat/CombatSettings';

export function HUD() {
  const rings = useGameStore((s) => s.collectibles.rings);
  const energyCores = useGameStore((s) => s.collectibles.energyCores);
  const shards = useGameStore((s) => s.collectibles.shards.length);
  const player = useGameStore((s) => s.player);
  const abilities = useGameStore((s) => s.abilities);
  const runStats = useGameStore((s) => s.runStats);
  const quality = usePerformanceStore((s) => s.quality);

  const invincible = player.invincible;
  const hpPercent = (player.hp / player.maxHp) * 100;
  const comboMult = (1 + runStats.combo * 0.1).toFixed(1);
  const comboPct = (runStats.comboTimer / COMBO_WINDOW) * 100;

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      {/* 左上角收集品 */}
      <div style={{
        position: 'absolute', top: 20, left: 20, color: 'white', fontFamily: 'monospace',
        textShadow: '2px 2px 4px black'
      }}>
        <div>💍 Rings: {rings}</div>
        <div>⚡ Cores: {energyCores}</div>
        <div>💎 Shards: {shards}</div>
        <div>❤️ HP: {player.hp}/{player.maxHp}</div>
        <div>📏 Dist: {Math.floor(runStats.distance)} m</div>
        <div>⏱️ Time: {runStats.time.toFixed(1)} s</div>
      </div>

      {/* 分數 + 連擊（畫面上方中央） */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        color: 'white', fontFamily: 'monospace', textAlign: 'center',
        textShadow: '2px 2px 6px black'
      }}>
        <div style={{ fontSize: 34, fontWeight: 'bold' }}>{runStats.score.toLocaleString()}</div>
        {runStats.combo > 1 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 20, color: '#ffcc00' }}>
              COMBO x{runStats.combo} · ×{comboMult}
            </div>
            <div style={{
              width: 160, height: 5, margin: '4px auto 0', background: '#333',
              borderRadius: 3, overflow: 'hidden'
            }}>
              <div style={{
                width: `${comboPct}%`, height: '100%', background: '#ffcc00',
                transition: 'width 0.1s linear'
              }} />
            </div>
          </div>
        )}
      </div>
      
      {/* 血量條 */}
      <div style={{
        position: 'absolute', top: 20, right: 20, width: 200, height: 20,
        background: '#333', borderRadius: 10, overflow: 'hidden', border: '2px solid #666'
      }}>
        <div style={{
          width: `${hpPercent}%`, height: '100%',
          background: invincible ? '#FFD700' : '#ff4444',
          transition: 'width 0.3s',
        }} />
        <div style={{
          position: 'absolute', top: 0, width: '100%', textAlign: 'center',
          color: 'white', fontSize: 14, lineHeight: '20px', textShadow: '1px 1px 2px black'
        }}>
          {player.hp} / {player.maxHp}
        </div>
      </div>

      {/* 技能冷卻 */}
      <div style={{
        position: 'absolute', bottom: 40, left: 20, color: 'white', fontFamily: 'monospace',
        display: 'flex', gap: 20
      }}>
        {abilities.map((a) => (
          <div key={a.id} style={{
            padding: '8px 12px', background: a.unlocked ? (a.active ? '#44ff44' : '#222') : '#444',
            borderRadius: 8, border: '1px solid #666'
          }}>
            <div>{a.id.replace(/([A-Z])/g, ' $1')}</div>
            <div style={{ fontSize: 12 }}>
              {a.currentCooldown > 0 ? `CD ${a.currentCooldown.toFixed(1)}s` : 'Ready'}
            </div>
          </div>
        ))}
      </div>
      
      {/* 無敵提示 */}
      {invincible && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          color: '#FFD700', fontSize: 32, fontFamily: 'monospace', textShadow: '0 0 20px gold',
          animation: 'blink 0.5s infinite'
        }}>
          INVINCIBLE
        </div>
      )}

      <div style={{
        position: 'absolute', top: 52, right: 20, color: 'white', fontSize: 12,
        fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 4
      }}>
        Quality: {quality}
      </div>
    </Html>
  );
}