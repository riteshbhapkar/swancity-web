'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import TetrisGLTF from './TetrisGLTF';
import FallingBlocks from './FallingBlocks';

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
            
            {/* Falling blocks around the main model */}
            <FallingBlocks count={15} />
            
            {/* Main glTF model */}
            <group scale={[10, 10, 10]} position={[0, -8, 0]}>
              <TetrisGLTF />
            </group>
            
            {/* Simple background and lighting for the glTF */}
            <mesh position={[0, 0, -15]}>
              <planeGeometry args={[120, 120]} />
              <meshBasicMaterial color="#000020" transparent opacity={0.2} />
            </mesh>
            
            {/* Simple camera controls */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={true}
              autoRotate={true}
              autoRotateSpeed={0.5}
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
