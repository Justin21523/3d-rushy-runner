// src/core/abilities/AbilityDefs.ts

import type { AbilityState } from '../../stores/gameStore';

export interface AbilityEffect {
  id: string;
  name: string;
  description: string;
  defaultDuration: number;
  defaultCooldown: number;
  onActivate: (controller: any, store: any, ability: AbilityState) => void;
  onDeactivate: (controller: any, store: any) => void;
  onUpdate: (delta: number, controller: any, store: any, ability: AbilityState) => void;
}

// mock implementations that work with existing store/controller
const abilityDefs: Record<string, AbilityEffect> = {
  timeSlow: {
    id: 'timeSlow',
    name: 'Time Slow',
    description: 'Slow down time for 2 seconds',
    defaultDuration: 2,
    defaultCooldown: 5,
    onActivate: (_, store) => {
      store.setTimeScale(0.3);
    },
    onDeactivate: (_, store) => {
      store.setTimeScale(1.0);
    },
    onUpdate: (_dt, _, _store, _ability) => {
      // duration tracked by system
    },
  },
  blastDash: {
    id: 'blastDash',
    name: 'Blast Dash',
    description: 'Dash forward with invincibility',
    defaultDuration: 0.3,
    defaultCooldown: 3,
    onActivate: (controller, _store) => {
      // apply a huge dash in current facing direction
      const sign = controller.vel.x >= 0 ? 1 : -1;
      controller.vel.x = sign * 50;
      controller.vel.y = 0;
      controller.isDashing = true;
      controller.dashTimer = 0.3;
      controller.dashDirection = sign;
    },
    onDeactivate: () => {
      // invincibility off
    },
    onUpdate: (_dt, _controller, _store, _ability) => {
      // no additional logic
    },
  },
  gravityInvert: {
    id: 'gravityInvert',
    name: 'Gravity Invert',
    description: 'Flip gravity for 3 seconds',
    defaultDuration: 3,
    defaultCooldown: 8,
    onActivate: (controller) => {
      controller.config.gravity *= -1;
    },
    onDeactivate: (controller) => {
      controller.config.gravity = -28; // reset to default
    },
    onUpdate: () => {},
  },
  invincible: {
    id: 'invincible',
    name: 'Invincibility',
    description: 'Become invulnerable for 5 seconds',
    defaultDuration: 5,
    defaultCooldown: 15,
    onActivate: (_, _store) => {
      // set flag
    },
    onDeactivate: (_, _store) => {
      // clear
    },
    onUpdate: () => {},
  },
};

export function getAbilityDef(id: string): AbilityEffect | undefined {
  return abilityDefs[id];
}