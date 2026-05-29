// src/App.tsx (Updated – integrates all systems)

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import * as THREE from 'three';
import { useGameStore } from './stores/gameStore';
import { InputManager } from './core/input/InputManager';
import { CharacterController } from './core/controller/CharacterController';
import { AbilitySystem } from './core/abilities/AbilitySystem';
import { ChunkManager } from './core/world/ChunkManager';
import { BackgroundManager } from './core/world/BackgroundManager';
import { CollisionSystem } from './core/world/CollisionSystem';
import { EnemyManager } from './core/enemies/EnemyManager';
import { DeathHandler } from './core/game/DeathHandler';
import { LevelManager } from './core/game/LevelManager';
import { MechanismSystem } from './core/mechanisms/MechanismSystem';
import { CollectibleManager } from './core/collectibles/CollectibleManager';
import { AudioManager } from './core/audio/AudioManager';
import { setupSoundEvents } from './core/audio/SoundEvents';
import { PostProcessingPipeline } from './core/vfx/PostProcessingPipeline';
import { PerformanceScaler } from './core/engine/PerformanceScaler';
import { HUD } from './ui/HUD';
import { PauseMenu } from './ui/PauseMenu';
import { LevelComplete } from './ui/LevelComplete';
import { PlayerModel } from './components/PlayerModel';
import { CameraFollow } from './components/CameraFollow';
import { AbilityShop } from './ui/AbilityShop';
import { CharacterPreview } from './ui/CharacterPreview'
import { CustomizationPanel } from './ui/CustomizationPanel';

// ── WebGL availability check ──
function checkWebGL(): string | null {
  try {
    const canvas = document.createElement('canvas');
    const ctx =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!ctx) return 'WebGL not supported in this browser.';
    return null;
  } catch {
    return 'Error testing WebGL.';
  }
}

// ── Error boundary for Canvas crashes ──
interface EBState { error: Error | null }
class WebGLErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { error: null };
  static getDerivedStateFromError(e: Error): EBState { return { error: e }; }
  componentDidCatch(e: Error, info: ErrorInfo) { console.error('Canvas error:', e, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: '#111', color: '#eee', fontFamily: 'monospace', padding: 40, gap: 16,
        }}>
          <h2 style={{ color: '#ff4444' }}>WebGL Context Error</h2>
          <p style={{ maxWidth: 600, textAlign: 'center', color: '#aaa' }}>
            {this.state.error.message}
          </p>
          <p style={{ maxWidth: 600, textAlign: 'center', color: '#888', fontSize: 13 }}>
            Chrome is trying to use the AMD GPU instead of NVIDIA.<br />
            Run the dev server with <code style={{ color: '#0af' }}>npm run dev:gl</code> or{' '}
            <code style={{ color: '#0af' }}>npm run dev:firefox</code>, or launch Chrome manually with:
          </p>
          <pre style={{ background: '#222', padding: '12px 20px', borderRadius: 6, fontSize: 12, color: '#0f0' }}>
            chromium-browser --use-angle=gl --ignore-gpu-blocklist http://localhost:5173
          </pre>
        </div>
      );
    }
    return this.state.error === null ? this.props.children : null;
  }
}


function GameLoop() {
  const inputRef = useRef<InputManager>(null!);
  const controllerRef = useRef<CharacterController>(null!);
  const abilityRef = useRef<AbilitySystem>(null!);
  const chunkManagerRef = useRef<ChunkManager>(null!);
  const backgroundManagerRef = useRef<BackgroundManager>(null!);
  const collisionRef = useRef<CollisionSystem>(null!);
  const enemyManagerRef = useRef<EnemyManager>(null!);
  const deathHandlerRef = useRef<DeathHandler>(null!);
  const levelManagerRef = useRef<LevelManager>(null!);
  const mechanismRef = useRef<MechanismSystem>(null!);
  const collectibleManagerRef = useRef<CollectibleManager>(null!);
  const audioManagerRef = useRef<AudioManager>(null!);
  const playerGroupRef = useRef<THREE.Group>(null!);
  const { scene } = useThree();
  
  // scene from useThree() is a stable reference inside the Canvas — never changes.
  // Using [] prevents re-initialization if R3F's internal store triggers a re-render.
  useEffect(() => {
    inputRef.current = new InputManager();
    controllerRef.current = new CharacterController();
    abilityRef.current = new AbilitySystem();
    abilityRef.current.setController(controllerRef.current);
    mechanismRef.current = new MechanismSystem();
    chunkManagerRef.current = new ChunkManager(scene, () => controllerRef.current.pos, mechanismRef.current);
    backgroundManagerRef.current = new BackgroundManager(scene, () => controllerRef.current.pos.z);
    collisionRef.current = new CollisionSystem(scene, controllerRef.current, () => controllerRef.current.pos);
    enemyManagerRef.current = new EnemyManager(scene, () => controllerRef.current.pos.z);
    deathHandlerRef.current = new DeathHandler();
    levelManagerRef.current = new LevelManager(() => controllerRef.current.pos.z);
    collectibleManagerRef.current = new CollectibleManager(scene, playerGroupRef.current);
    audioManagerRef.current = new AudioManager();
    const cleanupSound = setupSoundEvents(audioManagerRef.current);
    inputRef.current.start();

    // pause listener
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        const phase = useGameStore.getState().phase;
        if (phase === 'playing') useGameStore.getState().setPhase('paused');
        else if (phase === 'paused') useGameStore.getState().setPhase('playing');
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      inputRef.current?.dispose();
      chunkManagerRef.current?.dispose();
      backgroundManagerRef.current?.dispose();
      enemyManagerRef.current?.dispose();
      window.removeEventListener('keydown', onKey);
      cleanupSound?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    if (!controllerRef.current || !inputRef.current) return; // systems not yet initialized

    const phase = useGameStore.getState().phase;

    // DeathHandler manages its own phase guard (runs during playing + gameover)
    deathHandlerRef.current?.update(delta);

    if (phase === 'paused' || phase === 'menu') return;

    const input = inputRef.current.getFrame();

    if (input.actions.has('ability1')) abilityRef.current.tryActivate('ability1');
    if (input.actions.has('ability2')) abilityRef.current.tryActivate('ability2');

    controllerRef.current.update(delta, input);
    abilityRef.current.update(delta);
    chunkManagerRef.current?.update();
    backgroundManagerRef.current?.update();
    collisionRef.current?.update();
    enemyManagerRef.current?.update(delta);
    levelManagerRef.current?.update();
    mechanismRef.current?.update(delta);
    collectibleManagerRef.current?.update();

    // 同步模型位置
    const pos = useGameStore.getState().player.position;
    if (playerGroupRef.current) {
      playerGroupRef.current.position.set(pos[0], pos[1], pos[2]);
    }
  });

  return (
    <>
      {/* 天空漸層背景色 */}
      <color attach="background" args={['#0a0a2e']} />
      <fog attach="fog" args={['#0a0a2e', 80, 200]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 5]} intensity={1} castShadow />
      <group ref={playerGroupRef}>
        <PlayerModel />
      </group>
      <CameraFollow />
      <PostProcessingPipeline />
      <PerformanceScaler />
      <AbilityShop />
      <CharacterPreview /> 
      <CustomizationPanel />
      <HUD />
      <PauseMenu />
      <LevelComplete />
    </>
  );
}

export default function App() {
  const webglError = checkWebGL();
  if (webglError) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#111', color: '#eee', fontFamily: 'monospace', padding: 40, gap: 16,
      }}>
        <h2 style={{ color: '#ff4444' }}>WebGL Not Available</h2>
        <p style={{ maxWidth: 600, textAlign: 'center', color: '#aaa' }}>{webglError}</p>
        <p style={{ maxWidth: 600, textAlign: 'center', color: '#888', fontSize: 13 }}>
          Try <code style={{ color: '#0af' }}>npm run dev:gl</code> (Chromium with NVIDIA flags) or{' '}
          <code style={{ color: '#0af' }}>npm run dev:firefox</code>
        </p>
        <pre style={{ background: '#222', padding: '12px 20px', borderRadius: 6, fontSize: 12, color: '#0f0' }}>
          chromium-browser --use-angle=gl --ignore-gpu-blocklist http://localhost:5173
        </pre>
      </div>
    );
  }

  return (
    <WebGLErrorBoundary>
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas
          shadows
          camera={{ position: [0, 5, 18], fov: 60 }}
          gl={{ failIfMajorPerformanceCaveat: false, antialias: true }}
        >
          <GameLoop />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}