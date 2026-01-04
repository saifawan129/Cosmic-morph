
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
  const coreRef = useRef<THREE.Mesh>(null);

  // Detail level 4 is the "goldilocks" zone: 
  // perfectly smooth under distortion but significantly lighter for mobile GPUs.
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 4), []);
  const coreGeometry = useMemo(() => new THREE.SphereGeometry(1, 24, 24), []);

  useFrame((clockState) => {
    const time = clockState.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005 * (state.speed || 1);
      meshRef.current.rotation.x += 0.002 * (state.speed || 1);
    }
    if (coreRef.current) {
      const pulse = Math.sin(time * 2) * 0.05 + 1;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <Float speed={state.speed * 2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} scale={state.scale} geometry={geometry} castShadow receiveShadow>
        <MeshDistortMaterial
          color={state.color}
          roughness={state.roughness}
          metalness={state.metalness}
          distort={state.distort}
          speed={state.speed}
        />
      </mesh>
      
      {/* Decorative inner core */}
      <mesh ref={coreRef} scale={state.scale * 0.4} geometry={coreGeometry}>
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
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={state.color} emissive={state.color} emissiveIntensity={5} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};
