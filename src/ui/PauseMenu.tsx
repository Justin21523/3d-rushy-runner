// src/ui/PauseMenu.tsx
import { Html } from '@react-three/drei';
import { useGameStore } from '../stores/gameStore';

export function PauseMenu() {
  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);

  if (phase !== 'paused') return null;

  return (
    <Html fullscreen style={{ pointerEvents: 'auto' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', gap: 24
      }}>
        <h1 style={{ color: 'white', fontFamily: 'monospace', fontSize: 48 }}>PAUSED</h1>
        <button onClick={() => setPhase('playing')} style={btnStyle}>Resume</button>
        <button onClick={() => setPhase('menu')} style={btnStyle}>Main Menu</button>
      </div>
    </Html>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '12px 32px',
  fontSize: 24,
  fontFamily: 'monospace',
  background: '#222',
  color: 'white',
  border: '2px solid #666',
  borderRadius: 8,
  cursor: 'pointer',
};