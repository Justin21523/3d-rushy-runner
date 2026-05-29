// src/ui/LevelComplete.tsx
import { Html } from '@react-three/drei';
import { useGameStore } from '../stores/gameStore';

export function LevelComplete() {
  const phase = useGameStore((s) => s.phase);
  const collectibles = useGameStore((s) => s.collectibles);

  if (phase !== 'levelComplete') return null;

  return (
    <Html fullscreen style={{ pointerEvents: 'auto' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'monospace'
      }}>
        <h1 style={{ fontSize: 56, marginBottom: 20 }}>LEVEL COMPLETE!</h1>
        <p style={{ fontSize: 24 }}>Rings collected: {collectibles.rings}</p>
        <p style={{ fontSize: 24 }}>Energy cores: {collectibles.energyCores}</p>
        <p style={{ fontSize: 24 }}>Shards: {collectibles.shards.length}</p>
      </div>
    </Html>
  );
}