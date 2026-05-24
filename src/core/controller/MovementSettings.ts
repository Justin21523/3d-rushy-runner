import type { ControllerConfig } from '../input/InputManager';

export const DEFAULT_MOVEMENT: ControllerConfig = {
  walkSpeed: 20,
  dashSpeed: 45,
  jumpForce: 18,
  gravity: -28,
  coyoteTime: 0.12,
  jumpBufferTime: 0.1,
  maxQueueSize: 2,
  inputQueueExpire: 0.2,
};

export interface AdvancedConfig {
  dashDuration: number;
  slideSpeed: number;
  slideDuration: number;
  wallJumpForce: number;
  wallSlideGravity: number;
  maxWallSlides: number;
  airControl: number; // 0-1, how much the player can steer in the air
}

export const DEFAULT_ADVANCED: AdvancedConfig = {
  dashDuration: 0.25,
  slideSpeed: 25,
  slideDuration: 0.5,
  wallJumpForce: 10,
  wallSlideGravity: -8,
  maxWallSlides: 1,
  airControl: 0.6,
};