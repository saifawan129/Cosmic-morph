
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
    <div className="absolute inset-0 w-full h-full z-10 bg-[#010103]">
      <Canvas 
        shadows 
        dpr={[1, 1.5]}
        frameloop="always"
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          preserveDrawingBuffer: true
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#010103', 0);
        }}
      >
        <PerformanceMonitor />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
        
        <ambientLight intensity={1.2} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={3} 
          castShadow 
          shadow-mapSize={[512, 512]}
        />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color={morphState.color} />
        
        <MorphingProduct state={morphState} />
        
        <Suspense fallback={null}>
          <Environment preset={morphState.environment || 'city'} />
        </Suspense>

        <ContactShadows 
          opacity={0.5} 
          scale={10} 
          blur={2.5} 
          far={10} 
          resolution={128}
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
