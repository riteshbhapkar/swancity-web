'use client';

import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function TetrisGLTF({ modelPath = '/tetris_animation/scene.gltf' }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  
  // Clone the scene to avoid modifying the cached original
  const model = useRef(scene.clone());
  
  // Set up animation mixer if there are animations
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  
  if (animations && animations.length > 0 && !mixer.current) {
    mixer.current = new THREE.AnimationMixer(model.current);
    animations.forEach(clip => {
      const action = mixer.current!.clipAction(clip);
      action.play();
    });
  }
  
  // Animate the model
  useFrame((_, delta) => {
    if (group.current) {
      // Gentle rotation for the entire model
      group.current.rotation.y += 0.005;
    }
    
    // Update animations if any
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });
  
  return (
    <group ref={group} dispose={null}>
      <primitive object={model.current} scale={1.0} position={[0, 0, 0]} />
    </group>
  );
}

// Preload the model
useGLTF.preload('/tetris_animation/scene.gltf');