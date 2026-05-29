import { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

// Target visible character height (世界單位)。
// 不論 GLB 原始尺寸為何，都會以包圍盒高度縮放到這個值。
const TARGET_CHARACTER_HEIGHT = 1.6;

/**
 * 量測 root 在世界座標下的包圍盒，回傳統一縮放係數和腳底偏移。
 * 必須在 root 已 mount 到 scene 後呼叫，且 root 自身 scale = 1 / position = 0，
 * 才能讀到模型原始尺寸。
 */
function measureNormalization(root: THREE.Object3D): { scale: number; footOffset: number } {
  root.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const height = size.y;
  if (!isFinite(height) || height <= 1e-4) return { scale: 1, footOffset: 0 };
  const scale = TARGET_CHARACTER_HEIGHT / height;
  // 縮放後的腳底位置：box.min.y * scale。把它平移到 0。
  const footOffset = -box.min.y * scale;
  return { scale, footOffset };
}

// 預載模型 (放在 public/assets/models/character.glb)
// 注意：不 clone scene — drei 的 useGLTF 對 SkinnedMesh 用 clone() 會破壞骨骼綁定，
// 因為遊戲只有一個玩家，直接使用原始 scene 是安全的。
export function PlayerModel() {
  const wrapper = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF('/assets/models/character.glb');
  // useAnimations 綁在 inner group 上，因為 scene 是 inner 的 child。
  const { actions, mixer } = useAnimations(animations, inner);

  // 量到的 scale 和腳底偏移；初始為 1 以避免閃爍時模型過大。
  const [norm, setNorm] = useState<{ scale: number; footOffset: number }>({ scale: 1, footOffset: 0 });

  // 在 commit 後、首次繪製前測量。此時 scene 已 mount 但相機尚未渲染。
  useLayoutEffect(() => {
    if (!inner.current) return;
    setNorm(measureNormalization(inner.current));
  }, [scene]);

  const action = useGameStore((s) => s.player.action);
  const prevAction = useRef<string>('idle');

  useEffect(() => {
    if (!actions) return;
    const current = action;
    const previous = prevAction.current;
    if (previous === current) return;

    if (actions[previous]) actions[previous]!.fadeOut(0.2);
    const newAction = actions[current];
    if (newAction) newAction.reset().fadeIn(0.2).play();
    else if (actions['idle']) actions['idle']!.reset().fadeIn(0.2).play();

    prevAction.current = current;
  }, [action, actions]);

  useFrame((_state, delta) => {
    mixer.update(delta * useGameStore.getState().timeScale);
  });

  // wrapper: 提供 scale + footOffset；inner: 持有原始 scene。
  return (
    <group ref={wrapper} scale={norm.scale} position-y={norm.footOffset}>
      <group ref={inner}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

// 如果沒有動畫，也可以用靜態模型：
export function StaticPlayerModel() {
  const inner = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/assets/models/character.glb');
  const [norm, setNorm] = useState<{ scale: number; footOffset: number }>({ scale: 1, footOffset: 0 });

  useLayoutEffect(() => {
    if (!inner.current) return;
    setNorm(measureNormalization(inner.current));
  }, [scene]);

  return (
    <group scale={norm.scale} position-y={norm.footOffset}>
      <group ref={inner}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
