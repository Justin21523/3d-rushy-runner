// src/core/combat/CombatSettings.ts
// Central tuning constants for the Phase 1 combat / scoring loop.

/** Horizontal radius (XZ plane) within which player–enemy contact is tested. */
export const STOMP_RADIUS = 1.6;

/** Upward velocity applied to the player after a successful stomp. */
export const STOMP_BOUNCE = 12;

/** Seconds the combo stays alive after the last scoring event before it resets. */
export const COMBO_WINDOW = 3;

/** Player must be falling faster than this (negative) to register a stomp. */
export const STOMP_MIN_FALL_SPEED = -1;

/** Damage a stomp deals — high enough to one-shot regular enemies. */
export const STOMP_DAMAGE = 100;

/** Damage a stomp deals to a boss (chip damage, requires multiple hits). */
export const STOMP_BOSS_DAMAGE = 1;

/** Invincibility window (seconds) after the player takes a hit. */
export const HIT_INVULN = 1.5;

/** Y below which the player is considered to have fallen out of the world. */
export const FALL_DEATH_Y = -10;

/** Base score values. */
export const SCORE_RING = 10;
export const SCORE_CORE = 50;
export const SCORE_STOMP = 100;
