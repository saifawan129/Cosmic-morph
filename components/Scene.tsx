
import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  PerformanceMonitor,
  BakeShadows,
  Preload
} from '@react-three/drei';
import { MorphingProduct } from './MorphingProduct';
import { MorphState } from '../types';

interface SceneProps {
  morphState: MorphState;
}

export const Scene: React.FC<SceneProps> = ({ morphState }) => {
  const [dpr, setDpr] = useState(1.5);

  const handlePerfDecline = useCallback(() => setDpr(1), []);
  const handlePerfIncline = useCallback(() => setDpr(2), []);

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas 
        shadows 
        dpr={dpr}
        frameloop="demand" 
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance" 
        }}
      >
        <PerformanceMonitor 
          onDecline={handlePerfDecline} 
          onIncline={handlePerfIncline} 
        />
        
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
        
        <Suspense fallback={null}>
          <MorphingProduct state={morphState} />
          <Environment preset={morphState.environment} />
          <ContactShadows 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={10} 
            resolution={256} 
            color="#000000" 
          />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minDistance={3} 
          maxDistance={10} 
          autoRotate 
          autoRotateSpeed={0.5} 
        />

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        
        <BakeShadows />
        <Preload all />
      </Canvas>
    </div>
  );
};
