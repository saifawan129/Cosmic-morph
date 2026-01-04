
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  PerformanceMonitor,
  Preload,
  AdaptiveDpr,
  AdaptiveEvents
} from '@react-three/drei';
import { MorphingProduct } from './MorphingProduct';
import { MorphState } from '../types';

interface SceneProps {
  morphState: MorphState;
}

export const Scene: React.FC<SceneProps> = ({ morphState }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-10">
      <Canvas 
        shadows 
        dpr={[1, 1.5]} // Capped at 1.5 for production to prevent 4K screen crashes
        frameloop="always"
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          failIfMajorPerformanceCaveat: false // Set to false to allow lower-end devices to try
        }}
      >
        <PerformanceMonitor />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
        
        {/* Core lighting is outside Suspense to guarantee visibility immediately */}
        <ambientLight intensity={0.8} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={2.5} 
          castShadow 
          shadow-mapSize={[512, 512]} // Optimized shadow map size
        />
        <pointLight position={[-10, -10, -10]} intensity={1} color={morphState.color} />
        
        {/* Object is NOT wrapped in the same suspense as Environment */}
        <MorphingProduct state={morphState} />
        
        <Suspense fallback={null}>
          <Environment preset={morphState.environment || 'city'} />
        </Suspense>

        <ContactShadows 
          opacity={0.4} 
          scale={10} 
          blur={2.5} 
          far={10} 
          resolution={128} // Optimized resolution
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
