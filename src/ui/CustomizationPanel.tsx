import { Html } from '@react-three/drei';
import { useState } from 'react';
import { useCustomizationStore } from '../stores/customizationStore';

export function CustomizationPanel() {
  const [open, setOpen] = useState(false);
  const outfits = useCustomizationStore(s => s.outfits);
  const equipped = useCustomizationStore(s => s.equipped);
  const equipItem = useCustomizationStore(s => s.equipItem);

  if (!open) {
    return (
      <Html fullscreen>
        <button onClick={() => setOpen(true)} style={{ position:'absolute', top:20, right:20, padding:8, background:'#222', color:'white', border:'1px solid #555' }}>
          Customize
        </button>
      </Html>
    );
  }

  return (
    <Html fullscreen style={{ pointerEvents: 'auto' }}>
      <div style={{
        position: 'absolute', top:0, right:0, width:300, height:'100%',
        background:'rgba(0,0,0,0.9)', color:'white', fontFamily:'monospace',
        padding:16, overflowY:'auto'
      }}>
        <h3>Character Customization</h3>
        <button onClick={() => setOpen(false)} style={{ background:'#333', color:'white', border:'none', marginBottom:12 }}>Close</button>
        {(['hat','body','shoes'] as const).map(slot => (
          <div key={slot}>
            <b>{slot.toUpperCase()}</b>
            {outfits.filter(o => o.slot === slot).map(item => (
              <div key={item.id} style={{
                padding:6, margin:4, background: equipped[slot]===item.id ? '#00aaff' : '#222',
                cursor:'pointer', borderRadius:4
              }} onClick={() => item.unlocked && equipItem(slot, item.id)}>
                {item.name} {!item.unlocked && '🔒'}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Html>
  );
}