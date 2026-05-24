// src/core/abilities/AbilitySystem.ts

import { useGameStore } from '../../stores/gameStore';
import { getAbilityDef } from './AbilityDefs';
import type { CharacterController } from '../controller/CharacterController';

export class AbilitySystem {
  private controller: CharacterController | null = null;

  setController(ctrl: CharacterController) {
    this.controller = ctrl;
  }

  /** Called when player presses ability button (ability1 or ability2) */
  tryActivate(abilitySlot: 'ability1' | 'ability2') {
    const store = useGameStore.getState();
    // map slot to ability id
    const slotMap: Record<string, string> = {
      ability1: 'timeSlow',
      ability2: 'blastDash',
    };
    const id = slotMap[abilitySlot];
    if (!id) return;

    const abilityState = store.abilities.find(a => a.id === id);
    if (!abilityState || !abilityState.unlocked || abilityState.currentCooldown > 0 || abilityState.active) return;

    const def = getAbilityDef(id);
    if (!def || !this.controller) return;

    // activate
    abilityState.active = true;
    abilityState.remainingDuration = def.defaultDuration;
    abilityState.currentCooldown = def.defaultCooldown; // start cooldown
    store.setAbility(id, {
      active: true,
      remainingDuration: def.defaultDuration,
      currentCooldown: def.defaultCooldown,
    });

    def.onActivate(this.controller, store, abilityState);
  }

  /** Call every frame */
  update(delta: number) {
    const store = useGameStore.getState();
    const dt = delta * store.timeScale;

    store.abilities.forEach((ability) => {
      if (!ability.active) {
        // decrease cooldown
        if (ability.currentCooldown > 0) {
          store.setAbility(ability.id, { currentCooldown: Math.max(0, ability.currentCooldown - dt) });
        }
        return;
      }

      // update active ability
      const def = getAbilityDef(ability.id);
      if (!def || !this.controller) return;

      def.onUpdate(dt, this.controller, store, ability);

      // reduce duration
      const remaining = ability.remainingDuration - dt;
      if (remaining <= 0) {
        // deactivate
        def.onDeactivate(this.controller, store);
        store.setAbility(ability.id, { active: false, remainingDuration: 0 });
      } else {
        store.setAbility(ability.id, { remainingDuration: remaining });
      }
    });
  }
}