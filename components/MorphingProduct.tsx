
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

  // Reduced detail from 15 to 8 for significant vertex count reduction
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 8), []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005 * state.speed;
      meshRef.current.rotation.x += 0.002 * state.speed;
    }
  });

  return (
    <Float speed={state.speed * 1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={state.scale} geometry={geometry}>
        <MeshDistortMaterial
          color={state.color}
          roughness={state.roughness}
          metalness={state.metalness}
          distort={state.distort}
          speed={state.speed}
        />
      </mesh>
      
      {/* Decorative inner core */}
      <mesh scale={state.scale * 0.4}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive={state.color} 
          emissiveIntensity={1.5} 
          toneMapped={false} 
        />
      </mesh>

      {/* Optimized orbiting particles - reduced count */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[Math.cos(i) * 2.2, Math.sin(i * 0.5) * 0.4, Math.sin(i) * 2.2]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color={state.color} emissive={state.color} emissiveIntensity={2} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};
