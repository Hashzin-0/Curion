
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, MeshDistortMaterial, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ProfessionalArea, Experience } from '@/lib/store';
import { getTheme } from '@/styles/themes';
import { slugify, calcDuration } from '@/lib/utils';

/**
 * @fileOverview Motor 3D Career Orbit.
 * Transforma áreas em planetas e experiências em satélites orbitais.
 */

function Satellite({ color, orbitRadius, speed, size, name }: { color: string, orbitRadius: number, speed: number, size: number, name: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + angle;
    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(t) * orbitRadius;
      meshRef.current.position.z = Math.sin(t) * orbitRadius;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={meshRef as any}>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <Text
        position={[0, size + 0.2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
      >
        {name}
      </Text>
    </group>
  );
}

function AreaPlanet({ area, experiences, index, total }: { area: ProfessionalArea, experiences: Experience[], index: number, total: number }) {
  const theme = getTheme(slugify(area.name));
  const planetColor = area.theme_color || theme.hex;
  
  // Posicionamento orbital do planeta em relação ao centro da cena
  const distance = 6;
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;

  return (
    <group position={[x, 0, z]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[1, 32, 32]}>
          <MeshDistortMaterial
            color={planetColor}
            speed={3}
            distort={0.3}
            radius={1}
          />
        </Sphere>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.4}
          fontWeight="bold"
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {area.name.toUpperCase()}
        </Text>
      </Float>

      {/* Renderiza experiências como satélites ao redor do planeta */}
      {experiences.map((exp, i) => {
        // Lógica de tamanho baseada na duração (simulada via calcDuration ou simples index para o MVP)
        const size = 0.15 + (Math.random() * 0.1);
        const orbitRadius = 1.8 + (i * 0.5);
        const speed = 0.2 + (Math.random() * 0.3);
        
        return (
          <Satellite 
            key={exp.id} 
            color={planetColor} 
            orbitRadius={orbitRadius} 
            speed={speed} 
            size={size} 
            name={exp.role} 
          />
        );
      })}
    </group>
  );
}

export function CareerOrbit3D({ areas, experiences }: { areas: ProfessionalArea[], experiences: Experience[] }) {
  return (
    <div className="w-full h-[600px] bg-slate-950 rounded-[3rem] overflow-hidden border border-white/10 relative group">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h3 className="text-white font-black uppercase tracking-tighter text-2xl">Visualização Orbit</h3>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Interaja arrastando a galáxia profissional</p>
      </div>

      <Canvas camera={{ position: [0, 10, 15], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        <group>
          {areas.map((area, idx) => (
            <AreaPlanet 
              key={area.id} 
              area={area} 
              experiences={experiences.filter(e => e.area_id === area.id)} 
              index={idx}
              total={areas.length}
            />
          ))}
        </group>

        <OrbitControls 
          enablePan={false} 
          minDistance={5} 
          maxDistance={30} 
          autoRotate 
          autoRotateSpeed={0.5} 
        />
      </Canvas>

      <div className="absolute bottom-8 right-8 flex gap-2">
        <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
          Engine: React Three Fiber + Three.js
        </div>
      </div>
    </div>
  );
}
