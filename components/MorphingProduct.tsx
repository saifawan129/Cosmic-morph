
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { MorphState } from '../types';

interface MorphingProductProps {
  state: MorphState;
}

export const MorphingProduct: React.FC<MorphingProductProps> = ({ state }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((clockState) => {
    const time = clockState.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.1 * (state.speed || 1);
      meshRef.current.rotation.x = time * 0.05 * (state.speed || 1);
    }
    if (coreRef.current) {
      const pulse = Math.sin(time * 2) * 0.05 + 1;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const safeScale = typeof state.scale === 'number' ? state.scale : 1.5;

  return (
    <group scale={[safeScale, safeScale, safeScale]}>
      <Float 
        speed={Math.max(0.1, (state.speed || 1.5) * 1.5)} 
        rotationIntensity={0.8} 
        floatIntensity={1.5}
      >
        {/* Main Morphing Body - Restored to icosahedron as per previous version */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <icosahedronGeometry args={[1, 32]} />
          <MeshDistortMaterial
            color={state.color || '#4e54c8'}
            roughness={state.roughness ?? 0.1}
            metalness={state.metalness ?? 0.8}
            distort={state.distort ?? 0.4}
            speed={state.speed ?? 1.5}
            transparent
            opacity={0.95}
          />
        </mesh>
        
        {/* Glowing Inner Core */}
        <mesh ref={coreRef} scale={[0.35, 0.35, 0.35]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive={state.color || '#ffffff'} 
            emissiveIntensity={3} 
            toneMapped={false} 
          />
        </mesh>

        {/* Orbiting particles */}
        <group rotation={[Math.PI / 4, 0, 0]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[Math.cos(i) * 2.2, Math.sin(i * 0.5) * 0.2, Math.sin(i) * 2.2]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial 
                color={state.color} 
                emissive={state.color} 
                emissiveIntensity={8} 
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  );
};
