// src/components/CameraFollow.tsx (修复方向，摄像机在玩家后方)

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';
import { useRef } from 'react';

export function CameraFollow() {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 6, -12));
  // 目标位置与朝向（缓动）
  const lookTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    const playerPos = useGameStore.getState().player.position;
    const playerVec = new THREE.Vector3(playerPos[0], playerPos[1], playerPos[2]);

    // 摄像机在玩家后方（Z- 方向）与上方
    const idealPos = new THREE.Vector3(
      playerVec.x,
      playerVec.y + 4.5,
      playerVec.z - 12
    );

    // 平滑跟随
    currentPos.current.lerp(idealPos, 0.12);
    camera.position.copy(currentPos.current);

    // 看着玩家前方一点
    const lookAtPoint = new THREE.Vector3(
      playerVec.x,
      playerVec.y + 1.5,
      playerVec.z + 4
    );
    lookTarget.current.lerp(lookAtPoint, 0.12);
    camera.lookAt(lookTarget.current);
  });

  return null;
}
