import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

// 預載模型 (放在 public/assets/models/character.glb)
export function PlayerModel() {
  const group = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF('/assets/models/character.glb');
  const { actions, mixer } = useAnimations(animations, group);

  // 從 store 取得動作狀態
  const action = useGameStore((s) => s.player.action);
  const prevAction = useRef<string>('idle');

  // 根據動作切換動畫
  useEffect(() => {
    if (!actions) return;

    const current = action;
    const previous = prevAction.current;

    if (previous === current) return;

    // 淡出前一個動畫
    if (actions[previous]) {
      actions[previous]!.fadeOut(0.2);
    }

    // 淡入新的動畫
    const newAction = actions[current];
    if (newAction) {
      newAction.reset().fadeIn(0.2).play();
    } else if (actions['idle']) {
      // fallback 到 idle
      actions['idle']!.reset().fadeIn(0.2).play();
    }

    prevAction.current = current;
  }, [action, actions]);

  useFrame((_state, delta) => {
    mixer.update(delta * useGameStore.getState().timeScale);
  });

  // 複製 scene 避免修改原始 cache
  return <primitive ref={group} object={scene} scale={0.5} />;
}

// 如果沒有動畫，也可以用靜態模型：
export function StaticPlayerModel() {
  const { scene } = useGLTF('/assets/models/character.glb');
  return <primitive object={scene} scale={0.5} />;
}