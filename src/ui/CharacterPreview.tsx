import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PlayerModel } from '../components/PlayerModel';
import { useCustomizationStore } from '../stores/customizationStore';

export function CharacterPreview() {
  const equipped = useCustomizationStore(s => s.equipped);
  // Here we would apply equipped items to the model (e.g., change colors, attach meshes)
  // For now we render the base model with color overrides from store
  return (
    <div style={{ width: 300, height: 400, pointerEvents: 'auto' }} data-equipped={JSON.stringify(equipped)}>
      <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} />
        <PlayerModel />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
