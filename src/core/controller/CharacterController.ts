import * as THREE from 'three';
import type { InputFrame, ControllerConfig } from '../input/InputManager';
import { DEFAULT_MOVEMENT, DEFAULT_ADVANCED, type AdvancedConfig } from './MovementSettings';
import { useGameStore } from '../../stores/gameStore';

export class CharacterController {
  config: ControllerConfig;
  advanced: AdvancedConfig;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  grounded: boolean;
  onWall: 'left' | 'right' | 'front' | 'back' | null;
  coyoteTimer: number;
  jumpBufferTimer: number;
  inputQueue: string[];

  isDashing: boolean;
  dashTimer: number;
  dashDirection: THREE.Vector3;

  isSliding: boolean;
  slideTimer: number;
  wallSlideCount: number;

  // For Z-axis movement
  private moveDir: THREE.Vector3 = new THREE.Vector3();
  private invincibleTimer: number = 0;
  private maxReachedZ: number = 0; // safety: position never goes backward
  private hasDoubleJumped = false;
  private canDoubleJump = true;
  godMode = true; // DEBUG: disable all damage and death

  constructor(cfg: Partial<ControllerConfig> = {}, adv: Partial<AdvancedConfig> = {}) {
    this.config = { ...DEFAULT_MOVEMENT, ...cfg };
    this.advanced = { ...DEFAULT_ADVANCED, ...adv };
    this.pos = new THREE.Vector3(0, 1, 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.grounded = false;
    this.onWall = null;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.inputQueue = [];
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDirection = new THREE.Vector3();
    this.isSliding = false;
    this.slideTimer = 0;
    this.wallSlideCount = 0;
  }
  
  applyDamage(amount: number) {
    if (this.godMode || this.invincibleTimer > 0) return;
    const store = useGameStore.getState();
    store.setPlayerState({ hp: Math.max(0, store.player.hp - amount) });
    this.invincibleTimer = 1.5;
  }

  update(delta: number, input: InputFrame) {
    const store = useGameStore.getState();
    const dt = delta * store.timeScale;
    if (dt <= 0) return;

    this.feedQueue(input);
    this.updateTimers(dt);

    if (this.isDashing) {
      this.updateDash(dt);
      this.pushState(store);
      return;
    }

    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0 || !this.grounded) {
        this.isSliding = false;
      }
    }
    
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
    }
    // Process dash input (grounded, not already dashing/sliding)
    if (input.actions.has('dash') && !this.isDashing && !this.isSliding && this.grounded) {
      this.startDash(input);
    }

    // Process slide input
    if (input.actions.has('slide') && !this.isDashing && this.grounded && !this.isSliding) {
      this.startSlide();
    }
    
    if (input.actions.has('roll') && this.grounded && !this.isDashing && !this.isSliding) {
      this.startRoll();
    }
    if (input.actions.has('doubleJump') && !this.grounded && !this.hasDoubleJumped && this.canDoubleJump) {
      this.performDoubleJump();
    }

    // Movement
    const rawX = input.rawAxes.x;
    // Auto-run forward at base speed; W/S adjusts speed, left/right steers
    const autoRunSpeed = this.config.walkSpeed;
    const rawZBoost = input.rawAxes.y; // W adds speed, S brakes
    let targetVelX = -rawX * this.config.walkSpeed;
    let targetVelZ = autoRunSpeed + rawZBoost * (this.config.walkSpeed * 0.5);

    // Apply air control factor
    if (!this.grounded) {
      const air = this.advanced.airControl;
      targetVelX = this.vel.x + (targetVelX - this.vel.x) * air;
      targetVelZ = this.vel.z + (targetVelZ - this.vel.z) * air;
    }

    if (this.isSliding) {
      const slideDir = this.moveDir.clone().normalize();
      if (slideDir.length() === 0) slideDir.set(0, 0, 1);
      targetVelX = -slideDir.x * this.advanced.slideSpeed;
      targetVelZ = Math.max(autoRunSpeed, slideDir.z * this.advanced.slideSpeed);
    }

    this.vel.x = targetVelX;
    this.vel.z = targetVelZ;

    // Gravity
    this.applyGravity(dt);

    // Collision
    this.resolveCollisions(dt);

    // Jump
    this.processJump();

    // Wall jump
    this.processWallJump(input);

    // Update movement direction for slide reference (always forward + lateral)
    if (this.grounded && !this.isSliding) {
      this.moveDir.set(-rawX, 0, 1);
    }
    // 在接地時重置二段跳
    if (this.grounded) {
      this.hasDoubleJumped = false;
      this.canDoubleJump = true;
    }
    this.pushState(store);
  }

  private startRoll() {
    this.isSliding = true;
    this.slideTimer = 0.4;
    this.vel.z += 15;
    this.vel.y = 2;
  }

  private performDoubleJump() {
    this.vel.y = this.config.jumpForce * 1.1;
    this.hasDoubleJumped = true;
    this.canDoubleJump = false; // will reset on ground
  }

  private feedQueue(input: InputFrame) {
    if (input.actions.has('jump')) {
      this.inputQueue.push('jump');
      if (this.inputQueue.length > this.config.maxQueueSize) this.inputQueue.shift();
    }
  }

  private updateTimers(dt: number) {
    this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    if (this.grounded) {
      this.coyoteTimer = this.config.coyoteTime;
      this.wallSlideCount = 0;
    }
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
  }

  private startDash(input: InputFrame) {
    this.isDashing = true;
    this.dashTimer = this.advanced.dashDuration;
    const dir = new THREE.Vector3(input.rawAxes.x, 0, input.rawAxes.y);
    if (dir.length() === 0) dir.set(0, 0, 1); // default forward
    this.dashDirection = dir.normalize();
    this.vel.y = 0;
  }

  private updateDash(dt: number) {
    this.dashTimer -= dt;
    this.pos.x += this.dashDirection.x * this.config.dashSpeed * dt;
    this.pos.z += this.dashDirection.z * this.config.dashSpeed * dt;
    if (this.dashTimer <= 0) {
      this.isDashing = false;
    }
  }

  private startSlide() {
    this.isSliding = true;
    this.slideTimer = this.advanced.slideDuration;
  }

  private applyGravity(dt: number) {
    if (this.isDashing) return;
    if (this.onWall && this.vel.y < 0) {
      this.vel.y += this.advanced.wallSlideGravity * dt;
    } else {
      this.vel.y += this.config.gravity * dt;
    }
  }

  private resolveCollisions(dt: number) {
    const groundY = 0;
    const newY = this.pos.y + this.vel.y * dt;
    if (newY <= groundY) {
      this.pos.y = groundY;
      this.vel.y = 0;
      this.grounded = true;
      this.onWall = null;
    } else {
      this.pos.y = newY;
      this.grounded = false;
    }

    // Z axis is unbounded — advance forward, never allow backward drift
    this.pos.z += this.vel.z * dt;
    if (this.pos.z < this.maxReachedZ) this.pos.z = this.maxReachedZ;
    else this.maxReachedZ = this.pos.z;

    // X axis: soft boundary matching road half-width
    const xBoundary = 12;
    const newX = this.pos.x + this.vel.x * dt;
    this.pos.x = Math.max(-xBoundary, Math.min(xBoundary, newX));

    this.onWall = null;
    if (this.pos.x <= -xBoundary) this.onWall = 'left';
    else if (this.pos.x >= xBoundary) this.onWall = 'right';
  }

  private processJump() {
    const canJump = (this.grounded || this.coyoteTimer > 0) && !this.isDashing && this.jumpBufferTimer <= 0;
    if (this.inputQueue.includes('jump') && canJump) {
      this.vel.y = this.config.jumpForce;
      this.grounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.isSliding = false;
      const idx = this.inputQueue.indexOf('jump');
      if (idx !== -1) this.inputQueue.splice(idx, 1);
    } else if (this.inputQueue.includes('jump') && !canJump) {
      if (this.jumpBufferTimer <= 0) {
        this.jumpBufferTimer = this.config.jumpBufferTime;
      }
    }
    if (this.grounded) {
      this.inputQueue = this.inputQueue.filter(a => a !== 'jump');
    }
  }

  private processWallJump(input: InputFrame) {
    if (!this.onWall || this.grounded) return;
    if (input.actions.has('jump') && this.wallSlideCount < this.advanced.maxWallSlides) {
      this.vel.y = this.advanced.wallJumpForce;
      // Push away from wall
      if (this.onWall === 'left') this.vel.x = 8;
      else if (this.onWall === 'right') this.vel.x = -8;
      else if (this.onWall === 'front') this.vel.z = -8;
      else if (this.onWall === 'back') this.vel.z = 8;
      this.grounded = false;
      this.onWall = null;
      this.wallSlideCount++;
      this.inputQueue = this.inputQueue.filter(a => a !== 'jump');
    }
  }

  private determineAction(): string {
    if (!this.grounded) {
      if (this.onWall && this.vel.y < 0) return 'wall';
      if (this.vel.y > 1) return 'jump';
      return 'fall';
    }
    if (this.isDashing) return 'dash';
    if (this.isSliding) return 'slide';
    if (Math.abs(this.vel.x) > 0.5 || Math.abs(this.vel.z) > 0.5) return 'run';
    return 'idle';
  }

  private pushState(store: any) {
    store.setPlayerState({
      position: [this.pos.x, this.pos.y, this.pos.z],
      velocity: [this.vel.x, this.vel.y, this.vel.z],
      grounded: this.grounded,
      action: this.determineAction(),
      invincible: this.godMode || this.invincibleTimer > 0,
    });
  }

}