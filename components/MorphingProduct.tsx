
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { MorphState } from '../types';

interface MorphingProductProps {
  state: MorphState;
}

export const MorphingProduct: React.FC<MorphingProductProps> = ({ state }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Reduced detail to 5 (optimized for 40fps target)
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 5), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Delta-based rotation ensures speed is consistent even if FPS fluctuates
      meshRef.current.rotation.y += delta * 0.3 * state.speed;
      meshRef.current.rotation.x += delta * 0.1 * state.speed;
    }
  });

  return (
    <Float speed={state.speed * 0.8} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={state.scale} geometry={geometry}>
        <MeshDistortMaterial
          color={state.color}
          roughness={state.roughness}
          metalness={state.metalness}
          distort={state.distort}
          speed={state.speed * 0.5}
        />
      </mesh>
      
      {/* Decorative inner core - simplified */}
      <mesh scale={state.scale * 0.4}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive={state.color} 
          emissiveIntensity={1.2} 
        />
      </mesh>
    </Float>
  );
};
