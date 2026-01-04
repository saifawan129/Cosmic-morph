
import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  PerformanceMonitor,
  Preload
} from '@react-three/drei';
import { MorphingProduct } from './MorphingProduct';
import { MorphState } from '../types';

interface SceneProps {
  morphState: MorphState;
}

export const Scene: React.FC<SceneProps> = ({ morphState }) => {
  const [dpr, setDpr] = useState(1);

  const handlePerfDecline = useCallback(() => setDpr(1), []);
  const handlePerfIncline = useCallback(() => setDpr(Math.min(window.devicePixelRatio, 2)), []);

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas 
        shadows 
        dpr={dpr}
        frameloop="always" // 'always' ensures the initial frame renders on Vercel deployment
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true
        }}
      >
        <PerformanceMonitor 
          onDecline={handlePerfDecline} 
          onIncline={handlePerfIncline} 
        />
        
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
        
        {/* Core lighting ensures visibility even if Environment is still loading */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        
        <MorphingProduct state={morphState} />
        
        <Suspense fallback={null}>
          <Environment preset={morphState.environment} />
        </Suspense>

        <ContactShadows 
          opacity={0.4} 
          scale={10} 
          blur={2} 
          far={10} 
          resolution={256} 
          color="#000000" 
          position={[0, -2.2, 0]}
        />

        <OrbitControls 
          enablePan={false} 
          minDistance={3} 
          maxDistance={10} 
          autoRotate 
          autoRotateSpeed={0.5} 
          makeDefault
        />
        
        <Preload all />
      </Canvas>
    </div>
  );
};
