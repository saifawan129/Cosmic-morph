
import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  PerformanceMonitor,
  BakeShadows,
  Preload,
  Stars
} from '@react-three/drei';
import { MorphingProduct } from './MorphingProduct';
import { MorphState } from '../types';

interface SceneProps {
  morphState: MorphState;
}

export const Scene: React.FC<SceneProps> = ({ morphState }) => {
  // Start with a more conservative DPR
  const [dpr, setDpr] = useState(1);

  const handlePerfDecline = useCallback(() => setDpr(0.85), []);
  const handlePerfIncline = useCallback(() => setDpr(window.devicePixelRatio || 1.5), []);

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas 
        shadows 
        dpr={dpr}
        frameloop="always" // Switched to always for smoother continuous morphing
        gl={{ 
          antialias: false, // Disable for performance gain, replaced by DPR
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
      >
        <PerformanceMonitor 
          onDecline={handlePerfDecline} 
          onIncline={handlePerfIncline} 
        />
        
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
        
        <Suspense fallback={null}>
          {/* Efficient WebGL stars instead of DOM elements */}
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          
          <MorphingProduct state={morphState} />
          <Environment preset={morphState.environment} />
          
          <ContactShadows 
            opacity={0.3} 
            scale={8} 
            blur={2.5} 
            far={10} 
            resolution={128} // Lowered from 256
            color="#000000" 
          />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minDistance={3} 
          maxDistance={10} 
          autoRotate 
          autoRotateSpeed={0.5} 
          makeDefault
        />

        <ambientLight intensity={0.4} />
        <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={1.5} />
        
        <BakeShadows />
        <Preload all />
      </Canvas>
    </div>
  );
};
