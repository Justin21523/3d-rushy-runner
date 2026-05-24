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
import { CollectibleManager } from './core/collectibles/CollectibleManager';
import { BackgroundManager } from './core/world/BackgroundManager';
import { EnemyManager } from './core/enemies/EnemyManager';
import { DeathHandler } from './core/game/DeathHandler';
import { AudioManager } from './core/audio/AudioManager';
import { setupSoundEvents } from './core/audio/SoundEvents';
import { PostProcessingPipeline } from './core/vfx/PostProcessingPipeline';
import { PerformanceScaler } from './core/engine/PerformanceScaler';
import { HUD } from './ui/HUD';
import { PlayerModel } from './components/PlayerModel';
import { CameraFollow } from './components/CameraFollow';
import { CollisionSystem } from './core/world/CollisionSystem';

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
  const enemyManagerRef = useRef<EnemyManager>(null!);
  const deathHandlerRef = useRef<DeathHandler>(null!);
  const collectibleManagerRef = useRef<CollectibleManager>(null!);
  const audioManagerRef = useRef<AudioManager>(null!);
  const playerGroupRef = useRef<THREE.Group>(null!);
  const { scene } = useThree();
  const collisionRef = useRef<CollisionSystem>(null!);
  
  useEffect(() => {
    inputRef.current = new InputManager();
    controllerRef.current = new CharacterController();
    collisionRef.current = new CollisionSystem(scene, controllerRef.current, () => controllerRef.current.pos);
    abilityRef.current = new AbilitySystem();
    abilityRef.current.setController(controllerRef.current);
    chunkManagerRef.current = new ChunkManager(scene, () => controllerRef.current.pos);
    backgroundManagerRef.current = new BackgroundManager(scene, () => controllerRef.current.pos.z);
    collectibleManagerRef.current = new CollectibleManager(scene, playerGroupRef.current);
    enemyManagerRef.current = new EnemyManager(scene, () => controllerRef.current.pos.z);
    deathHandlerRef.current = new DeathHandler();
    audioManagerRef.current = new AudioManager();
    const cleanupSound = setupSoundEvents(audioManagerRef.current);
    inputRef.current.start();

    return () => {
      inputRef.current?.dispose();
      chunkManagerRef.current?.dispose();
      backgroundManagerRef.current?.dispose();
      enemyManagerRef.current?.dispose();
      cleanupSound?.();
    };
  }, [scene]);

  useFrame((_, delta) => {
    const input = inputRef.current.getFrame();
    if (input.actions.has('ability1')) abilityRef.current.tryActivate('ability1');
    if (input.actions.has('ability2')) abilityRef.current.tryActivate('ability2');

    controllerRef.current.update(delta, input);
    abilityRef.current.update(delta);
    chunkManagerRef.current?.update();
    backgroundManagerRef.current?.update();
    collisionRef.current?.update();
    enemyManagerRef.current?.update(delta);
    deathHandlerRef.current?.update(delta);
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
      <HUD />
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