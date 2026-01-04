
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

  const handlePerfDecline = useCallback(() => setDpr(0.75), []);
  const handlePerfIncline = useCallback(() => setDpr(1), []);

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas 
        shadows={false} 
        dpr={dpr}
        gl={{ 
          antialias: false,
          powerPreference: "high-performance",
          precision: "lowp",
          stencil: false,
          depth: true
        }}
      >
        <PerformanceMonitor 
          onDecline={handlePerfDecline} 
          onIncline={handlePerfIncline} 
          flipflops={3}
          bounds={(fps) => (fps < 35 ? [0, 1] : [1, 1])}
        />
        
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        <Suspense fallback={null}>
          <Stars radius={50} depth={20} count={600} factor={2} saturation={0} fade speed={0.4} />
          
          <MorphingProduct state={morphState} />
          <Environment preset={morphState.environment} />
          
          <ContactShadows 
            opacity={0.3} 
            scale={10} 
            blur={4} 
            far={10} 
            resolution={32}
            color="#000000" 
          />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minDistance={2.5} 
          maxDistance={7} 
          autoRotate={false} 
          makeDefault
        />

        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        
        <Preload all />
      </Canvas>
    </div>
  );
};
