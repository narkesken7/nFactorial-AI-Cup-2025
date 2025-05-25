import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface DNAProps {
  sequence?: string;
}

function DNA({ sequence }: DNAProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [error, setError] = useState<string | null>(null);
  const baseColors = {
    A: '#FF0000', // Red
    T: '#00FF00', // Green
    G: '#0000FF', // Blue
    C: '#FFFF00'  // Yellow
  };

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  if (!sequence) {
    return (
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        No sequence loaded
      </Text>
    );
  }

  try {
    const bases = sequence.split('').slice(0, 20); // Limit to 20 bases for visualization
    const radius = 2;
    const height = 0.5;
    const turns = bases.length / 10;

    return (
      <group ref={groupRef}>
        {bases.map((base, i) => {
          const angle = (i / bases.length) * Math.PI * 2 * turns;
          const x = Math.cos(angle) * radius;
          const y = i * height - (bases.length * height) / 2;
          const z = Math.sin(angle) * radius;

          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={baseColors[base as keyof typeof baseColors] || '#808080'} />
              <Text
                position={[0, 0.3, 0]}
                fontSize={0.2}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {base}
              </Text>
            </mesh>
          );
        })}

        {/* Backbone */}
        <mesh>
          <tubeGeometry
            args={[
              new THREE.CatmullRomCurve3(
                bases.map((_, i) => {
                  const angle = (i / bases.length) * Math.PI * 2 * turns;
                  return new THREE.Vector3(
                    Math.cos(angle) * radius,
                    i * height - (bases.length * height) / 2,
                    Math.sin(angle) * radius
                  );
                })
              ),
              64,
              0.1,
              8,
              false
            ]}
          />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    );
  } catch (err) {
    return (
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        Error rendering sequence
      </Text>
    );
  }
}

export default function MolecularViewer({ sequence }: DNAProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      style={{ background: '#1a1a1a' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <DNA sequence={sequence} />
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </Canvas>
  );
} 