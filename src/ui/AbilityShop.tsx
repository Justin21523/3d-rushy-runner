import { Html } from '@react-three/drei';
import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';

const abilityShopItems: Record<string, { name: string; unlockCost: number }> = {
  gravityInvert: { name: 'Gravity Invert', unlockCost: 2 },
  invincible: { name: 'Invincible', unlockCost: 4 },
};

export function AbilityShop() {
  const [open, setOpen] = useState(false);
  const energyCores = useGameStore(s => s.collectibles.energyCores);
  const unlockAbility = useGameStore(s => s.unlockAbility);
  const addEnergyCores = useGameStore(s => s.addEnergyCores);
  const abilities = useGameStore(s => s.abilities);

  if (!open) {
    return (
      <Html fullscreen>
        <button onClick={() => setOpen(true)} style={toggleStyle}>🛒 Shop</button>
      </Html>
    );
  }

  return (
    <Html fullscreen style={{ pointerEvents: 'auto' }}>
      <div style={panelStyle}>
        <h2>Ability Shop</h2>
        <p>Cores: {energyCores}</p>
        {abilities.filter(a => !a.unlocked).map(a => {
          const item = abilityShopItems[a.id] ?? { name: a.id, unlockCost: 1 };
          return (
            <div key={a.id} style={itemStyle}>
              <span>{item.name} (cost: {item.unlockCost})</span>
              <button
                onClick={() => {
                  addEnergyCores(-item.unlockCost);
                  unlockAbility(a.id);
                }}
                disabled={energyCores < item.unlockCost}
              >
                Unlock
              </button>
            </div>
          );
        })}
        <button onClick={() => setOpen(false)}>Close</button>
      </div>
    </Html>
  );
}

const toggleStyle: React.CSSProperties = {
  position: 'absolute', top: 60, right: 20, padding: 8, background: '#222', color: 'white', border: '1px solid #555'
};
const panelStyle: React.CSSProperties = {
  position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 320, background: 'rgba(0,0,0,0.9)', color: 'white', padding: 20, borderRadius: 8
};
const itemStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', margin: '8px 0'
};
