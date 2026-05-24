// src/core/vfx/PostProcessingPipeline.tsx

import { useRef } from 'react';
import { Vector2 } from 'three';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { usePerformanceStore } from '../../stores/performanceStore';

export function PostProcessingPipeline() {
  const composerRef = useRef<any>(null);
  const quality = usePerformanceStore((s) => s.quality);

  if (quality === 0) return null;

  const effects: JSX.Element[] = [
    <Bloom key="bloom" luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={0.8} mipmapBlur />,
  ];
  if (quality >= 2) effects.push(<Vignette key="vignette" offset={0.5} darkness={0.5} eskil={false} />);
  if (quality >= 3) effects.push(<ChromaticAberration key="ca" offset={new Vector2(0.002, 0.002)} radialModulation={false} modulationOffset={0} />);

  return (
    <EffectComposer ref={composerRef} multisampling={4}>
      {effects}
    </EffectComposer>
  );
}
