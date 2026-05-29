import { create } from 'zustand';

export interface OutfitItem {
  id: string;
  slot: 'hat'|'body'|'shoes'|'accessory';
  name: string;
  description: string;
  modelPath?: string;  // for future 3D overlay
  color?: string;
  unlocked: boolean;
}

interface CustomizationState {
  outfits: OutfitItem[];
  equipped: Record<string, string>; // slot -> item id
  unlockItem: (id: string) => void;
  equipItem: (slot: string, itemId: string) => void;
  isUnlocked: (id: string) => boolean;
}

const defaultOutfits: OutfitItem[] = [
  { id: 'hat_default', slot: 'hat', name: 'Default Cap', description: 'A simple cap', color: '#00aaff', unlocked: true },
  { id: 'hat_spike', slot: 'hat', name: 'Spike Crown', description: 'Spiky crown', color: '#ffaa00', unlocked: false },
  { id: 'body_armor', slot: 'body', name: 'Neon Armor', description: 'Glowing chestplate', color: '#00ffaa', unlocked: false },
  { id: 'shoes_speed', slot: 'shoes', name: 'Speed Boots', description: 'Faster running', color: '#ff4444', unlocked: false },
];

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  outfits: defaultOutfits,
  equipped: {
    hat: 'hat_default',
    body: '',
    shoes: '',
    accessory: '',
  },
  unlockItem: (id) => set(s => ({
    outfits: s.outfits.map(o => o.id === id ? { ...o, unlocked: true } : o)
  })),
  equipItem: (slot, itemId) => set(s => ({
    equipped: { ...s.equipped, [slot]: itemId }
  })),
  isUnlocked: (id) => get().outfits.find(o => o.id === id)?.unlocked ?? false,
}));