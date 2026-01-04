
import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { MorphState } from '../types';

interface MorphingProductProps {
  state: MorphState;
}

export const MorphingProduct: React.FC<MorphingProductProps> = ({ state }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { invalidate } = useThree();

  // Use useMemo for geometries to ensure stability
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 15), []);

  useFrame((clockState) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005 * state.speed;
      meshRef.current.rotation.x += 0.002 * state.speed;
      
      // If we are in demand mode, we'd call invalidate() here if needed, 
      // but Float handles continuous animation.
    }
  });

  return (
    <Float speed={state.speed * 2} rotationIntensity={1} floatIntensity={2}>
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
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive={state.color} 
          emissiveIntensity={2} 
          toneMapped={false} 
        />
      </mesh>

      {/* Orbiting particles */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[Math.cos(i) * 2.5, Math.sin(i * 0.5) * 0.5, Math.sin(i) * 2.5]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={state.color} emissive={state.color} emissiveIntensity={5} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};
