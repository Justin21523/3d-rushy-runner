import type { AbilityState } from '../../stores/gameStore';
import { CharacterController } from '../controller/CharacterController';

export interface AbilityEffect {
  id: string;
  name: string;
  defaultDuration: number;
  defaultCooldown: number;
  onActivate: (controller: CharacterController, store: any, ability: AbilityState) => void;
  onDeactivate: (controller: CharacterController, store: any) => void;
  onUpdate: (dt: number, controller: CharacterController, store: any, ability: AbilityState) => void;
}

export function getAbilityDef(id: string): AbilityEffect | undefined {
  return abilityDefs[id];
}

const abilityDefs: Record<string, AbilityEffect> = {
  timeSlow: {
    id: 'timeSlow', name: 'Time Slow', defaultDuration: 2, defaultCooldown: 5,
    onActivate: (_, store) => store.setTimeScale(0.3),
    onDeactivate: (_, store) => store.setTimeScale(1.0),
    onUpdate: () => {},
  },
  blastDash: {
    id: 'blastDash', name: 'Blast Dash', defaultDuration: 0.3, defaultCooldown: 3,
    onActivate: (controller) => {
      controller.vel.z += 40;
      controller.vel.y = 3;
    },
    onDeactivate: () => {},
    onUpdate: () => {},
  },
  doubleJump: {
    id: 'doubleJump', name: 'Double Jump', defaultDuration: 0.1, defaultCooldown: 0.5,
    onActivate: (controller) => {
      controller.vel.y = controller.config.jumpForce * 1.2;
    },
    onDeactivate: () => {},
    onUpdate: () => {},
  },
  magicBurst: {
    id: 'magicBurst', name: 'Magic Burst', defaultDuration: 0.5, defaultCooldown: 6,
    onActivate: (controller) => {
      // create a shockwave that destroys nearby enemies (handled in collision)
      window.dispatchEvent(new CustomEvent('magic-burst', { detail: controller.pos }));
    },
    onDeactivate: () => {},
    onUpdate: () => {},
  },
  roll: {
    id: 'roll', name: 'Roll', defaultDuration: 0.4, defaultCooldown: 1,
    onActivate: (controller) => {
      controller.isSliding = true;
      controller.slideTimer = 0.4;
      controller.vel.z += 15;
    },
    onDeactivate: (controller) => {
      controller.isSliding = false;
    },
    onUpdate: () => {},
  },
};
