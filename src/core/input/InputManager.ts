export type InputAction =
  | 'jump'
  | 'dash'
  | 'slide'
  | 'ability1'
  | 'ability2'
  | 'pause';

export interface InputFrame {
  actions: Set<InputAction>;
  rawAxes: { x: number; y: number }; // x: left/right, y: forward/backward (Z axis)
  queue: InputAction[];
}

export interface ControllerConfig {
  walkSpeed: number;
  dashSpeed: number;
  jumpForce: number;
  gravity: number;
  coyoteTime: number;
  jumpBufferTime: number;
  maxQueueSize: number;
  inputQueueExpire: number;
}

type KeyMap = Record<string, InputAction>;

const DEFAULT_KEY_MAP: KeyMap = {
  Space: 'jump',
  ShiftLeft: 'dash',
  ControlLeft: 'slide',
  KeyQ: 'ability1',
  KeyE: 'ability2',
  Escape: 'pause',
  ArrowUp: 'jump',
  ArrowDown: 'slide',
};

export class InputManager {
  private keysDown = new Set<string>();
  private actionsThisFrame = new Set<InputAction>();
  private inputQueue: InputAction[] = [];
  private rawAxes = { x: 0, y: 0 };

  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  constructor(private keyMap: KeyMap = DEFAULT_KEY_MAP) {
    this.onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const code = e.code;
      this.keysDown.add(code);
      const action = this.keyMap[code];
      if (action) {
        this.actionsThisFrame.add(action);
        this.inputQueue.push(action);
        if (this.inputQueue.length > 8) this.inputQueue.shift();
      }
      this.updateAxesFromKeys();
    };

    this.onKeyUp = (e: KeyboardEvent) => {
      this.keysDown.delete(e.code);
      this.updateAxesFromKeys();
    };
  }

  private updateAxesFromKeys() {
    let x = 0;
    // Left/Right (A/D or Arrow Left/Right)
    if (this.keysDown.has('ArrowRight') || this.keysDown.has('KeyD')) x += 1;
    if (this.keysDown.has('ArrowLeft') || this.keysDown.has('KeyA')) x -= 1;
    this.rawAxes.x = Math.max(-1, Math.min(1, x));

    let y = 0;
    // Forward/Backward (W/S or Arrow Up/Down for Z axis)
    if (this.keysDown.has('ArrowUp') || this.keysDown.has('KeyW')) y += 1;
    if (this.keysDown.has('ArrowDown') || this.keysDown.has('KeyS')) y -= 1;
    this.rawAxes.y = Math.max(-1, Math.min(1, y));
  }

  start() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  stop() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  dispose() {
    this.stop();
  }

  getFrame(): InputFrame {
    const frame: InputFrame = {
      actions: new Set(this.actionsThisFrame),
      rawAxes: { ...this.rawAxes },
      queue: [...this.inputQueue],
    };
    this.actionsThisFrame.clear();
    this.inputQueue = [];
    return frame;
  }

  injectAction(action: InputAction) {
    this.actionsThisFrame.add(action);
    this.inputQueue.push(action);
  }

  setAxes(x: number, y: number) {
    this.rawAxes.x = Math.max(-1, Math.min(1, x));
    this.rawAxes.y = Math.max(-1, Math.min(1, y));
  }
}