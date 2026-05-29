import { CharacterController } from '../controller/CharacterController';
import { useGameStore } from '../../stores/gameStore';

export interface SuperAbility {
  id: string;
  name: string;
  cost: number; // energy cores to activate
  cooldown: number;
  duration: number;
  onActivate: (controller: CharacterController) => void;
  onDeactivate?: (controller: CharacterController) => void;
}

const superAbilities: Record<string, SuperAbility> = {
  meteorSmash: {
    id: 'meteorSmash',
    name: 'Meteor Smash',
    cost: 5,
    cooldown: 10,
    duration: 0.8,
    onActivate: (ctrl) => {
      ctrl.vel.y = -50;
      ctrl.isDashing = true;
      ctrl.dashTimer = 0.8;
    },
  },
  phantomDash: {
    id: 'phantomDash',
    name: 'Phantom Dash',
    cost: 3,
    cooldown: 4,
    duration: 0.2,
    onActivate: (ctrl) => {
      ctrl.vel.z += 60;
      ctrl.isDashing = true;
      ctrl.dashTimer = 0.2;
      ctrl.applyDamage(-10); // heal instead of damage
    },
  },
  gravityField: {
    id: 'gravityField',
    name: 'Gravity Field',
    cost: 4,
    cooldown: 12,
    duration: 3,
    onActivate: (ctrl) => {
      ctrl.config.gravity = -5;
    },
    onDeactivate: (ctrl) => {
      ctrl.config.gravity = -32; // reset to default
    },
  },
};

export function getSuperAbility(id: string): SuperAbility | undefined {
  return superAbilities[id];
}

export const allSuperAbilities = Object.values(superAbilities);