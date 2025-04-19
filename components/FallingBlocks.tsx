'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Define types for our shapes and pieces
type Block = [number, number];
type Shape = {
  blocks: Block[];
  color: string;
};

type TetrisPieceData = {
  shape: number;
  position: [number, number, number];
  rotation: [number, number, number];
  speed: number;
  rotationSpeed: [number, number, number];
  scale: number;
};

// Tetris piece shapes and colors with vibrant neon colors
const SHAPES: Shape[] = [
  { blocks: [[0, 0], [1, 0], [0, 1], [1, 1]], color: "#00ffff" }, // O - Cyan
  { blocks: [[0, 0], [1, 0], [2, 0], [3, 0]], color: "#ff00ff" }, // I - Magenta
  { blocks: [[0, 0], [0, 1], [1, 1], [2, 1]], color: "#00ff8c" }, // L - Green
  { blocks: [[2, 0], [0, 1], [1, 1], [2, 1]], color: "#ff3d00" }, // J - Orange
  { blocks: [[1, 0], [2, 0], [0, 1], [1, 1]], color: "#ffff00" }, // S - Yellow
  { blocks: [[0, 0], [1, 0], [1, 1], [2, 1]], color: "#8c00ff" }, // Z - Purple
  { blocks: [[1, 0], [0, 1], [1, 1], [2, 1]], color: "#00a2ff" }  // T - Blue
];

// Create a single Tetris block
function TetrisBlock({ 
  position, 
  color, 
  rotation = [0, 0, 0], 
  scale = 1 
}: { 
  position: [number, number, number]; 
  color: string; 
  rotation?: [number, number, number]; 
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main block with glow effect */}
      <mesh>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.8}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
      
      {/* Inner core - brighter center */}
      <mesh scale={[0.6, 0.6, 0.6]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={"white"} 
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Edge highlight */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.95, 0.95, 0.95)]} />
        <lineBasicMaterial color={color} transparent opacity={0.9} />
      </lineSegments>
    </group>
  );
}

// Create a Tetris piece from multiple blocks
function TetrisPiece({ 
  shape, 
  position, 
  rotation = [0, 0, 0], 
  scale = 1 
}: { 
  shape: number; 
  position: [number, number, number]; 
  rotation?: [number, number, number]; 
  scale?: number;
}) {
  const shapeData = SHAPES[shape];
  
  return (
    <group position={position} rotation={rotation}>
      {shapeData.blocks.map((block, index) => (
        <TetrisBlock 
          key={index}
          position={[block[0] * scale, block[1] * scale, 0]}
          color={shapeData.color}
          scale={scale}
        />
      ))}
    </group>
  );
}

// Component for falling blocks
export default function FallingBlocks({ count = 15 }: { count?: number }) {
  const [pieces, setPieces] = useState<TetrisPieceData[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  
  // Initialize falling pieces
  useEffect(() => {
    const initialPieces: TetrisPieceData[] = Array.from({ length: count }).map(() => ({
      shape: Math.floor(Math.random() * SHAPES.length),
      position: [
        (Math.random() - 0.5) * 40,  // x: spread horizontally
        Math.random() * 50 + 20,     // y: start above the view
        (Math.random() - 0.5) * 20   // z: spread in depth
      ],
      rotation: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      ],
      speed: 0.05 + Math.random() * 0.1,
      rotationSpeed: [
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ],
      scale: 0.5 + Math.random() * 0.5
    }));
    
    setPieces(initialPieces);
  }, [count]);
  
  // Animate falling pieces
  useFrame(() => {
    setPieces(prevPieces => 
      prevPieces.map(piece => {
        // Move piece down
        const newY = piece.position[1] - piece.speed;
        
        // Reset position if it falls below view
        if (newY < -30) {
          return {
            ...piece,
            position: [
              (Math.random() - 0.5) * 40,
              Math.random() * 20 + 30,
              (Math.random() - 0.5) * 20
            ],
            shape: Math.floor(Math.random() * SHAPES.length)
          };
        }
        
        // Update position and rotation
        return {
          ...piece,
          position: [piece.position[0], newY, piece.position[2]],
          rotation: [
            piece.rotation[0] + piece.rotationSpeed[0],
            piece.rotation[1] + piece.rotationSpeed[1],
            piece.rotation[2] + piece.rotationSpeed[2]
          ]
        };
      })
    );
  });
  
  return (
    <group ref={groupRef}>
      {pieces.map((piece, index) => (
        <TetrisPiece
          key={index}
          shape={piece.shape}
          position={piece.position}
          rotation={piece.rotation}
          scale={piece.scale}
        />
      ))}
    </group>
  );
}