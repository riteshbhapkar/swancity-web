'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Tetris piece shapes and colors - updated with more vibrant neon colors
const SHAPES = [
  { blocks: [[0, 0], [1, 0], [0, 1], [1, 1]], color: "#00ffff" }, // O - Brighter cyan
  { blocks: [[0, 0], [1, 0], [2, 0], [3, 0]], color: "#ff00ff" }, // I - Magenta
  { blocks: [[0, 0], [0, 1], [1, 1], [2, 1]], color: "#00ff8c" }, // L - Neon green
  { blocks: [[2, 0], [0, 1], [1, 1], [2, 1]], color: "#ff3d00" }, // J - Neon orange
  { blocks: [[1, 0], [2, 0], [0, 1], [1, 1]], color: "#ffff00" }, // S - Neon yellow
  { blocks: [[0, 0], [1, 0], [1, 1], [2, 1]], color: "#8c00ff" }, // Z - Neon purple
  { blocks: [[1, 0], [0, 1], [1, 1], [2, 1]], color: "#00a2ff" }  // T - Neon blue
];

function TetrisVisualization() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Game state
  const [board, setBoard] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<{
    shape: number,
    position: [number, number],
    rotation: number
  } | null>(null);
  
  // Game board dimensions - increased size
  const boardWidth = 14;
  const boardHeight = 24;
  
  // Center the camera on the board
  useEffect(() => {
    // Center the camera on the board
    camera.position.set(0, 0, 30); // Moved camera back to see larger board
    camera.lookAt(0, 0, 0);
    
    // Create empty board
    const newBoard = Array(boardHeight).fill(null).map(() => Array(boardWidth).fill(0));
    setBoard(newBoard);
    
    // We'll spawn the first piece in a separate useEffect
  }, [camera]);
  
  // Get rotated blocks for a piece
  const getRotatedBlocks = useCallback((shape: number, rotation: number) => {
    return SHAPES[shape].blocks.map(([x, y]) => {
      switch (rotation) {
        case 1: return [y, -x]; // 90 degrees
        case 2: return [-x, -y]; // 180 degrees
        case 3: return [-y, x]; // 270 degrees
        default: return [x, y]; // 0 degrees
      }
    });
  }, []);
  
  // Check if move is valid
  const canMoveTo = useCallback((shape: number, position: [number, number], rotation: number) => {
    if (!board.length) return false;
    
    const rotatedBlocks = getRotatedBlocks(shape, rotation);
    
    return rotatedBlocks.every(([x, y]) => {
      const boardX = position[0] + x;
      const boardY = position[1] + y;
      return boardX >= 0 && boardX < boardWidth && boardY >= 0 && boardY < boardHeight && 
             (board[boardY] && board[boardY][boardX] === 0);
    });
  }, [board, boardWidth, boardHeight, getRotatedBlocks]);
  
  // Spawn a new piece
  const spawnNewPiece = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const startX = Math.floor(Math.random() * (boardWidth - 4)) + 1;
    const randomRotation = Math.floor(Math.random() * 4);
    
    // Create the new piece - always start at the top
    const newPiece = {
      shape: shapeIndex,
      position: [startX, 0] as [number, number], // Add type assertion here
      rotation: randomRotation
    };
    
    // Check if the new piece can be placed
    if (canMoveTo(newPiece.shape, newPiece.position, newPiece.rotation)) {
      setCurrentPiece(newPiece);
    } else {
      // Instead of clearing rows, try to place the piece higher up
      // This preserves all blocks on the board
      if (canMoveTo(newPiece.shape, [startX, -1] as [number, number], newPiece.rotation)) {
        setCurrentPiece({...newPiece, position: [startX, -1] as [number, number]});
      } else if (canMoveTo(newPiece.shape, [startX, -2] as [number, number], newPiece.rotation)) {
        setCurrentPiece({...newPiece, position: [startX, -2] as [number, number]});
      } else {
        // MODIFIED: Instead of clearing the top row, try a different position or shape
        // Try a different X position
        for (let x = 0; x < boardWidth - 3; x++) {
          if (canMoveTo(newPiece.shape, [x, 0] as [number, number], newPiece.rotation)) {
            setCurrentPiece({...newPiece, position: [x, 0] as [number, number]});
            return;
          }
          // Try a different rotation
          for (let r = 0; r < 4; r++) {
            if (canMoveTo(newPiece.shape, [x, 0], r)) {
              setCurrentPiece({...newPiece, position: [x, 0], rotation: r});
              return;
            }
          }
        }
        
        // Try a different shape as last resort
        for (let s = 0; s < SHAPES.length; s++) {
          if (s !== shapeIndex) {
            for (let x = 0; x < boardWidth - 3; x++) {
              for (let r = 0; r < 4; r++) {
                if (canMoveTo(s, [x, 0], r)) {
                  setCurrentPiece({shape: s, position: [x, 0], rotation: r});
                  return;
                }
              }
            }
          }
        }
        
        // If all else fails, just try to place it at the top without clearing anything
        // This might cause overlap but prevents disappearing blocks
        setCurrentPiece(newPiece);
      }
    }
  }, [boardWidth, canMoveTo, board]);
  
  // Lock the current piece in place
  const lockPiece = useCallback(() => {
    if (!currentPiece || !board.length) return;
    
    // Create a deep copy of the board to ensure state updates properly
    const newBoard = JSON.parse(JSON.stringify(board));
    const rotatedBlocks = getRotatedBlocks(currentPiece.shape, currentPiece.rotation);
    
    // Place the piece on the board
    rotatedBlocks.forEach(([x, y]) => {
      const boardX = currentPiece.position[0] + x;
      const boardY = currentPiece.position[1] + y;
      
      if (boardY >= 0 && boardY < boardHeight && boardX >= 0 && boardX < boardWidth) {
        newBoard[boardY][boardX] = currentPiece.shape + 1; // +1 to avoid 0 (empty)
      }
    });
    
    // NEVER clear rows - blocks will stay where they land permanently
    
    // Update the board state with the new blocks locked in place
    setBoard(newBoard);
    
    // Spawn a new piece immediately
    spawnNewPiece();
  }, [currentPiece, board, boardWidth, boardHeight, getRotatedBlocks, spawnNewPiece]);
  
  // Spawn the first piece after the board and functions are initialized
  useEffect(() => {
    if (board.length && !currentPiece) {
      spawnNewPiece();
    }
  }, [board, currentPiece, spawnNewPiece]);
  
  // Auto-play game loop
  useFrame(({ clock }) => {
    if (!currentPiece || !board.length) return;
    
    const time = clock.getElapsedTime();
    
    // Move piece down automatically every 0.5 seconds (slowed down for better visualization)
    if (time % 0.5 < 0.02) { // Wider detection window and slower drop rate
      const newY = currentPiece.position[1] + 1; // Move DOWN (increasing Y)
      
      // Check if can move down
      if (canMoveTo(currentPiece.shape, [currentPiece.position[0], newY], currentPiece.rotation)) {
        setCurrentPiece(prev => {
          if (!prev) return null;
          return {
            ...prev,
            position: [prev.position[0], newY]
          };
        });
      } else {
        // Lock piece and spawn new one
        lockPiece();
      }
    }
    
    // Occasionally try to move horizontally or rotate for more interesting visuals
    // Reduced frequency of horizontal movements to allow more stacking
    if (time % 2.5 < 0.02) {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const newX = currentPiece.position[0] + direction;
      
      if (canMoveTo(currentPiece.shape, [newX, currentPiece.position[1]], currentPiece.rotation)) {
        setCurrentPiece(prev => {
          if (!prev) return null;
          return {
            ...prev,
            position: [newX, prev.position[1]]
          };
        });
      }
    }
    
    // Rotate the entire scene slightly for a more dynamic view
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
    }
  });

  // Calculate board offset to center it
  const offsetX = -boardWidth / 2 + 0.5;
  const offsetY = -boardHeight / 2 + 0.5;

  return (
    <group ref={groupRef} position={[offsetX, offsetY, 0]}>
      {/* Grid lines moved to background with lower opacity */}
      {Array.from({ length: boardWidth + 1 }).map((_, i) => (
        <line key={`vertical-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([i, 0, -0.4, i, boardHeight, -0.4])}
              itemSize={3}
              args={[new Float32Array([i, 0, -0.4, i, boardHeight, -0.4]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#00ffff" opacity={0.15} transparent />
        </line>
      ))}
      
      {Array.from({ length: boardHeight + 1 }).map((_, i) => (
        <line key={`horizontal-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, i, -0.4, boardWidth, i, -0.4])}
              itemSize={3}
              args={[new Float32Array([0, i, -0.4, boardWidth, i, -0.4]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#00ffff" opacity={0.15} transparent />
        </line>
      ))}
      
      {/* Board background - enhanced with more depth and glow */}
      <mesh position={[boardWidth/2 - 0.5, boardHeight/2 - 0.5, -0.6]}>
        <boxGeometry args={[boardWidth, boardHeight, 0.2]} />
        <meshStandardMaterial 
          color="#000033" 
          opacity={0.5} 
          transparent 
          emissive="#001040"
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.2}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Glassy board overlay */}
      <mesh position={[boardWidth/2 - 0.5, boardHeight/2 - 0.5, -0.55]}>
        <boxGeometry args={[boardWidth, boardHeight, 0.05]} />
        <meshPhysicalMaterial 
          color="#003366" 
          opacity={0.15} 
          transparent 
          metalness={0.1}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.95}
          reflectivity={0.5}
        />
      </mesh>
      
      {/* Board grid matching border color */}
      {Array.from({ length: boardWidth - 1 }).map((_, i) => (
        <group key={`grid-vertical-${i}`} position={[0, 0, -0.54]}>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([i + 1, 0, 0, i + 1, boardHeight, 0])}
                itemSize={3}
                args={[new Float32Array([i + 1, 0, 0, i + 1, boardHeight, 0]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00ffff" opacity={0.3} transparent />
          </lineSegments>
        </group>
      ))}
      
      {Array.from({ length: boardHeight - 1 }).map((_, i) => (
        <group key={`grid-horizontal-${i}`} position={[0, 0, -0.54]}>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, i + 1, 0, boardWidth, i + 1, 0])}
                itemSize={3}
                args={[new Float32Array([0, i + 1, 0, boardWidth, i + 1, 0]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00ffff" opacity={0.3} transparent />
          </lineSegments>
        </group>
      ))}
      
      {/* Board outline - enhanced with brighter glow */}
      <lineSegments position={[boardWidth/2 - 0.5, boardHeight/2 - 0.5, -0.5]}>
        <edgesGeometry args={[new THREE.BoxGeometry(boardWidth, boardHeight, 0.1)]} />
        <lineBasicMaterial color="#00ffff" transparent opacity={0.8} />
      </lineSegments>
      
      {/* Game board - placed blocks with enhanced materials */}
      {board.map((row, y) => 
        row.map((cell, x) => {
          if (cell === 0) return null;
          const color = SHAPES[cell - 1].color;
          
          return (
            <group key={`${x}-${y}`} position={[x, boardHeight - 1 - y, 0]}>
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
        })
      )}
      
      {/* Current active piece - with enhanced materials */}
      {currentPiece && getRotatedBlocks(currentPiece.shape, currentPiece.rotation).map((block, blockIndex) => {
        const [x, y] = block;
        const boardX = currentPiece.position[0] + x;
        const boardY = currentPiece.position[1] + y;
        
        if (boardY >= boardHeight) return null; // Don't render blocks below the board
        
        const color = SHAPES[currentPiece.shape].color;
        
        return (
          <group key={`current-${blockIndex}`} position={[boardX, boardHeight - 1 - boardY, 0]}>
            {/* Main block with glow effect */}
            <mesh>
              <boxGeometry args={[0.9, 0.9, 0.9]} />
              <meshStandardMaterial 
                color={color} 
                metalness={0.8}
                roughness={0.1}
                emissive={color}
                emissiveIntensity={0.8}
              />
            </mesh>
            
            {/* Inner core - brighter center */}
            <mesh scale={[0.6, 0.6, 0.6]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial 
                color={"white"} 
                emissive={color}
                emissiveIntensity={1.2}
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
      })}
      
      {/* Enhanced grid lines with better visibility */}
      {Array.from({ length: boardWidth + 1 }).map((_, i) => (
        <line key={`vertical-${i}`}>
          <bufferGeometry attach="geometry" args={[new Float32Array([
            i, 0, 0,
            i, boardHeight, 0
          ]), 3]} />
          <lineBasicMaterial attach="material" color="#00ffff" opacity={0.3} transparent />
        </line>
      ))}
      
      {Array.from({ length: boardHeight + 1 }).map((_, i) => (
        <line key={`horizontal-${i}`}>
          <bufferGeometry attach="geometry" args={[new Float32Array([
            0, i, 0,
            boardWidth, i, 0
          ]), 3]} />
          <lineBasicMaterial attach="material" color="#00ffff" opacity={0.3} transparent />
        </line>
      ))}
      
      {/* Enhanced lighting */}
      <pointLight position={[boardWidth/2, boardHeight/2, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[boardWidth/2, boardHeight/2, -5]} intensity={0.8} color="#00ffff" />
      <spotLight 
        position={[boardWidth/2, -5, 10]} 
        angle={0.5} 
        penumbra={0.8} 
        intensity={1.0} 
        color="#00ffff" 
        castShadow 
      />
    </group>
  );
}

export default function Hero() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-black">
      {/* Futuristic Navbar */}
      <nav className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-md border-b border-cyan-500/30 py-3' 
          : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#" className="group flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                <span className="text-white font-bold text-lg relative z-10">S</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                SwanCity
              </span>
            </a>
            
            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Solutions', 'Pricing', 'About'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  className="relative text-gray-300 hover:text-white transition-colors duration-300 group"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <a 
                href="#contact" 
                className="hidden sm:inline-flex relative overflow-hidden rounded-md px-4 py-2 group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-md"></span>
                <span className="relative text-cyan-400 group-hover:text-white transition-colors duration-300">
                  Contact
                </span>
              </a>
              <a 
                href="#book" 
                className="relative overflow-hidden rounded-md px-5 py-2 group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative text-white font-medium">
                  Book a Call
                </span>
              </a>
              
              {/* Mobile Menu Button */}
              <button className="md:hidden text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content and Tetris side by side */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center pt-16">
        {/* Content Section */}
        <div className="w-full lg:w-1/2 pr-0 lg:pr-12">
          <div className="text-left">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              Turn interactions into{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                income
              </span>
            </h1>
            <h2 className="mt-6 text-3xl font-semibold text-gray-300 sm:text-4xl">
              Engage clients. Expand revenue.
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-xl">
              Ditch the siloed, SaaS tools. The AI-native platform to power inbound led growth for your professional services.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-cyan-500/50 text-center"
              >
                Talk to our AI assistant
              </a>
              <a
                href="#book"
                className="rounded-md border border-cyan-500 px-6 py-3 text-lg font-semibold text-cyan-500 transition-all hover:bg-cyan-500/10 text-center"
              >
                Book a call
              </a>
            </div>
          </div>
        </div>

        {/* Tetris Visualization Section */}
        <div className="hidden lg:block w-1/2 h-[500px] relative">
          <Canvas camera={{ position: [0, 0, 40], fov: 38 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <TetrisVisualization />
            <Effects />
            <PulsingCore />
            <OscillatingCamera 
              speed={0.2} 
              amplitude={0.52} // This is approximately 30 degrees
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </div>
      </div>

      {/* Add spacing before Trusted By section */}
      <div className="h-34"></div>

      {/* Trusted By Section */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-gray-400">
            Trusted by teams and professionals at
          </p>
          <div className="mt-6 grid grid-cols-3 gap-8 md:grid-cols-3">
            <div className="col-span-1 flex justify-center items-center">
              <div className="relative">
                {/* Glow effect behind the image */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 blur-xl opacity-70 scale-110 rounded-full"></div>
                <img 
                  src="/travelplus.png" 
                  alt="TravelPlus" 
                  className="relative h-16 w-auto object-contain opacity-100 z-10 rounded-lg"
                />
              </div>
            </div>
            <div className="col-span-1 flex justify-center items-center">
              <div className="relative">
                {/* Glow effect behind the image */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 blur-xl opacity-70 scale-110 rounded-full"></div>
                <img 
                  src="/amazon.png" 
                  alt="Amazon Prime" 
                  className="relative h-16 w-auto object-contain opacity-100 z-10 rounded-lg"
                />
              </div>
            </div>
            <div className="col-span-1 flex justify-center items-center">
              <div className="relative">
                {/* Glow effect behind the image */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 blur-xl opacity-70 scale-110 rounded-full"></div>
                <img 
                  src="/slater.jpg" 
                  alt="Slater Gordon" 
                  className="relative h-16 w-auto object-contain opacity-100 z-10 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add post-processing effects for a more futuristic look
function Effects() {
  const { /* scene, camera */ } = useThree();
  const particlesRef = useRef<THREE.Points>(null);
  const dataStreamsRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  
  // Create floating particles
  useEffect(() => {
    if (!particlesRef.current) return;
    
    // Randomize particle positions on mount
    const positions = particlesRef.current.geometry.attributes.position;
    const count = positions.count;
    
    for (let i = 0; i < count; i++) {
      positions.setXYZ(
        i,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 40
      );
    }
    positions.needsUpdate = true;
  }, []);
  
  // Animate particles and other elements
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Animate particles with more dynamic movement
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.08;
      particlesRef.current.rotation.z = time * 0.05;
      
      // Add wave-like motion
      const positions = particlesRef.current.geometry.attributes.position;
      const count = positions.count;
      
      for (let i = 0; i < count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        positions.setZ(i, z + Math.sin(time * 0.5 + x * 0.05 + y * 0.05) * 0.05);
      }
      positions.needsUpdate = true;
    }
    
    // Animate data streams
    if (dataStreamsRef.current) {
      dataStreamsRef.current.rotation.z = time * 0.05;
      
      dataStreamsRef.current.children.forEach((stream, i) => {
        const t = time * 0.4 + i * 0.5;
        
        // Pulse size
        stream.scale.set(
          0.8 + Math.sin(t) * 0.3,
          0.8 + Math.sin(t) * 0.3,
          0.8 + Math.sin(t) * 0.3
        );
        
        // Pulse color intensity
        const material = stream.material as THREE.MeshBasicMaterial;
        material.opacity = 0.3 + Math.sin(t * 1.5) * 0.2 + 0.2;
      });
    }
    
    // Animate rings with more dynamic movement and enhanced glow
    if (ringsRef.current) {
      ringsRef.current.rotation.x = Math.sin(time * 0.2) * 0.2 + Math.PI / 4;
      ringsRef.current.rotation.y = Math.sin(time * 0.1) * 0.1;
      
      ringsRef.current.children.forEach((ring, i) => {
        const t = time * 0.2 + i * 0.3;
        
        // Pulse size
        ring.scale.set(
          1 + Math.sin(t) * 0.1,
          1 + Math.sin(t) * 0.1,
          1
        );
        
        // Pulse color intensity
        const material = ring.material as THREE.MeshStandardMaterial;
        if (material.emissiveIntensity) {
          material.emissiveIntensity = 1.5 + Math.sin(t * 1.2) * 0.5;
        }
        material.opacity = 0.4 + Math.sin(t * 1.2) * 0.2;
      });
    }
  });
  
  return (
    <>
      {/* Background gradient plane */}
      <mesh position={[0, 0, -15]}>
        <planeGeometry args={[120, 120]} />
        <meshBasicMaterial color="#000020" transparent opacity={0.2} />
      </mesh>
      
      {/* Enhanced floating particles with larger size and more glow */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1500}
            array={new Float32Array(1500 * 3)}
            itemSize={3}
            args={[new Float32Array(1500 * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          color="#00ffff"
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
      
      {/* Digital data streams with more elements */}
      <group ref={dataStreamsRef}>
        {Array.from({ length: 25 }).map((_, i) => {
          const angle = (i / 25) * Math.PI * 2;
          const radius = 15 + Math.random() * 15;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const z = -12 - Math.random() * 10;
          
          return (
            <mesh key={`data-stream-${i}`} position={[x, y, z]}>
              <sphereGeometry args={[0.5 + Math.random() * 1.2, 16, 16]} />
              <meshBasicMaterial 
                color={i % 4 === 0 ? "#00ffff" : i % 4 === 1 ? "#00ff8c" : i % 4 === 2 ? "#ff00ff" : "#ffff00"} 
                transparent 
                opacity={0.6 + Math.random() * 0.3} 
              />
            </mesh>
          );
        })}
      </group>
      
      {/* Holographic rings with neon glow */}
      <group ref={ringsRef} position={[0, 0, -8]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`ring-${i}`} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[6 + i * 3, 6.2 + i * 3, 64]} />
            <meshBasicMaterial 
              color={i % 3 === 0 ? "#00ffff" : i % 3 === 1 ? "#00ff8c" : "#ff00ff"} 
              transparent 
              opacity={0.3} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        ))}
      </group>
      
      {/* Additional neon light beams */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 25;
        const y = Math.sin(angle) * 25;
        
        return (
          <mesh key={`beam-${i}`} position={[x, y, -20]} rotation={[0, 0, angle]}>
            <planeGeometry args={[35, 0.3]} />
            <meshBasicMaterial 
              color={i % 4 === 0 ? "#00ffff" : i % 4 === 1 ? "#00ff8c" : i % 4 === 2 ? "#ff00ff" : "#ffff00"} 
              transparent 
              opacity={0.2} 
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </>
  );
}

// Delete the entire PulsingCore function at the end of the file
function PulsingCore() {
  const coreRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.2;
      coreRef.current.rotation.z = time * 0.1;
      
      // Pulse effect
      const pulse = Math.sin(time * 2) * 0.2 + 0.8;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });
  
  return (
    <group ref={coreRef} position={[0, 0, -12]}>
      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.05} 
        />
      </mesh>
      
      {/* Inner core */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.3} 
        />
      </mesh>
      
      {/* Orbiting elements */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 3;
        const y = Math.sin(angle) * 3;
        
        return (
          <mesh 
            key={`orbit-${i}`} 
            position={[x, y, 0]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshBasicMaterial 
              color={i % 3 === 0 ? "#00ffff" : i % 3 === 1 ? "#00ff8c" : "#ff00ff"} 
              transparent 
              opacity={0.7} 
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Custom camera controller that oscillates between -amplitude and +amplitude
function OscillatingCamera({ speed = 0.5, amplitude = 0.52, minPolarAngle, maxPolarAngle }) {
  const { camera } = useThree();
  const initialPosition = useRef(new THREE.Vector3().copy(camera.position));
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Calculate angle based on sine wave to create smooth oscillation
    const angle = Math.sin(time * speed) * amplitude;
    
    // Set camera position based on the angle
    camera.position.x = Math.sin(angle) * initialPosition.current.length();
    camera.position.z = Math.cos(angle) * initialPosition.current.length();
    
    // Maintain vertical position
    camera.position.y = initialPosition.current.y;
    
    // Look at center
    camera.lookAt(0, 0, 0);
  });
  
  // Add orbit controls just for the vertical constraints
  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      enableRotate={false} // Disable manual rotation
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
    />
  );
}