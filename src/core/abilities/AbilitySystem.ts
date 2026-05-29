import { useGameStore } from '../../stores/gameStore';
import { getAbilityDef } from './AbilityDefs';
import type { CharacterController } from '../controller/CharacterController';

export class AbilitySystem {
  private controller: CharacterController | null = null;

  setController(ctrl: CharacterController) { this.controller = ctrl; }

  tryActivate(slot: 'ability1'|'ability2'|'roll'|'doubleJump') {
    const store = useGameStore.getState();
    // map slot to ability id
    const slotMap: Record<string, string> = {
      ability1: 'timeSlow',
      ability2: 'blastDash',
      roll: 'roll',
      doubleJump: 'doubleJump',
    };
    const id = slotMap[slot];
    if (!id) return;

    const ability = store.abilities.find(a => a.id === id);
    if (!ability || !ability.unlocked || ability.currentCooldown > 0 || ability.active) return;

    const def = getAbilityDef(id);
    if (!def || !this.controller) return;

    ability.active = true;
    ability.remainingDuration = def.defaultDuration;
    ability.currentCooldown = def.defaultCooldown;
    store.setAbility(id, {
      active: true,
      remainingDuration: def.defaultDuration,
      currentCooldown: def.defaultCooldown,
    });
    def.onActivate(this.controller, store, ability);
  }

  update(delta: number) {
    const store = useGameStore.getState();
    const dt = delta * store.timeScale;

    store.abilities.forEach(ability => {
      if (!ability.active) {
        if (ability.currentCooldown > 0) {
          store.setAbility(ability.id, {
            currentCooldown: Math.max(0, ability.currentCooldown - dt)
          });
        }
        return;
      }
      const def = getAbilityDef(ability.id);
      if (!def || !this.controller) return;
      def.onUpdate(dt, this.controller, store, ability);
      const rem = ability.remainingDuration - dt;
      if (rem <= 0) {
        def.onDeactivate(this.controller, store);
        store.setAbility(ability.id, { active: false, remainingDuration: 0 });
      } else {
        store.setAbility(ability.id, { remainingDuration: rem });
      }
    });
  }
}