
import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  PerformanceMonitor,
  Preload,
  Stars
} from '@react-three/drei';
import { MorphingProduct } from './MorphingProduct';
import { MorphState } from '../types';

interface SceneProps {
  morphState: MorphState;
}

export const Scene: React.FC<SceneProps> = ({ morphState }) => {
  const [dpr, setDpr] = useState(1);

  // Targets 40FPS (1000/40 = 25ms frame time)
  const handlePerfDecline = useCallback(() => setDpr(0.75), []);
  const handlePerfIncline = useCallback(() => setDpr(1), []);

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas 
        shadows={false} // Disable dynamic shadows for heavy performance boost
        dpr={dpr}
        gl={{ 
          antialias: false,
          powerPreference: "high-performance",
          precision: "lowp", // Drastic performance improvement on mobile/older GPUs
          stencil: false,
          depth: true
        }}
      >
        <PerformanceMonitor 
          onDecline={handlePerfDecline} 
          onIncline={handlePerfIncline} 
          flipflops={3}
          bounds={(fps) => (fps < 38 ? [0, 1] : [1, 1])} // Threshold at 38-40 range
        />
        
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        <Suspense fallback={null}>
          <Stars radius={50} depth={20} count={800} factor={2} saturation={0} fade speed={0.5} />
          
          <MorphingProduct state={morphState} />
          <Environment preset={morphState.environment} />
          
          <ContactShadows 
            opacity={0.4} 
            scale={10} 
            blur={3} 
            far={10} 
            resolution={64} // Very low res for speed
            color="#000000" 
          />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minDistance={2} 
          maxDistance={8} 
          autoRotate={false} 
          makeDefault
        />

        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        
        <Preload all />
      </Canvas>
    </div>
  );
};
