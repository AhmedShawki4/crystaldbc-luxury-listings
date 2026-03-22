import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════
   STARFIELD  –  sparkling background stars
   ═══════════════════════════════════════════════════════ */
function Starfield({ count = 300 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#d4af37" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════
   DIAMOND CORE  –  the main crystal gemstone
   ═══════════════════════════════════════════════════════ */
function DiamondCore() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.15 + Math.sin(t * 1.5) * 0.05);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 2) * 0.03;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.4} rotationIntensity={0.2}>
      <group>
        {/* Main diamond */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshPhysicalMaterial
            color="#d4af37"
            metalness={0.3}
            roughness={0.05}
            transmission={0.7}
            thickness={2}
            ior={2.4}
            envMapIntensity={3}
            clearcoat={1}
            clearcoatRoughness={0}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Wireframe overlay */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.52, 0]} />
          <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.3} />
        </mesh>
        {/* Glow sphere */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={0.08} side={THREE.BackSide} />
        </mesh>
      </group>
    </Float>
  );
}

/* ═══════════════════════════════════════════════════════
   ORBITING GEMS  –  smaller crystals circling the diamond
   ═══════════════════════════════════════════════════════ */
function OrbitingGems({ count = 8 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const gemsData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2,
      radius: 2.8 + Math.random() * 0.6,
      speed: 0.3 + Math.random() * 0.2,
      yOffset: (Math.random() - 0.5) * 1.2,
      size: 0.12 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const gem = gemsData[i];
        const angle = gem.angle + t * gem.speed;
        child.position.x = Math.cos(angle) * gem.radius;
        child.position.z = Math.sin(angle) * gem.radius;
        child.position.y = gem.yOffset + Math.sin(t * 1.5 + gem.phase) * 0.3;
        child.rotation.y = t * 2;
        child.rotation.x = t * 1.5;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {gemsData.map((gem, i) => (
        <mesh key={i}>
          <octahedronGeometry args={[gem.size, 0]} />
          <meshPhysicalMaterial
            color={i % 2 === 0 ? "#d4af37" : "#7ec8e3"}
            metalness={0.5}
            roughness={0.1}
            emissive={i % 2 === 0 ? "#d4af37" : "#5ba3c9"}
            emissiveIntensity={0.4}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   LIGHT RAYS  –  beams emanating from the diamond
   ═══════════════════════════════════════════════════════ */
function LightRays() {
  const groupRef = useRef<THREE.Group>(null!);
  const raysData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      angle: (i / 6) * Math.PI * 2,
      length: 3 + Math.random() * 2,
    }));
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
      groupRef.current.children.forEach((child, i) => {
        (child as THREE.Mesh).scale.y = 0.8 + Math.sin(t * 2 + i * 0.8) * 0.3;
        ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.06 + Math.sin(t * 2.5 + i) * 0.04;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {raysData.map((ray, i) => (
        <mesh key={i} position={[Math.cos(ray.angle) * 0.5, 0, Math.sin(ray.angle) * 0.5]} rotation={[0, 0, ray.angle + Math.PI / 2]}>
          <planeGeometry args={[0.03, ray.length]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   RING HALOS  –  decorative orbiting rings
   ═══════════════════════════════════════════════════════ */
function RingHalos() {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1.current) {
      ring1.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.3) * 0.1;
      ring1.current.rotation.z = t * 0.15;
    }
    if (ring2.current) {
      ring2.current.rotation.x = -Math.PI / 4 + Math.cos(t * 0.25) * 0.1;
      ring2.current.rotation.z = -t * 0.12;
    }
  });

  return (
    <>
      <mesh ref={ring1}>
        <torusGeometry args={[2.4, 0.008, 16, 100]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.25} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[2.8, 0.006, 16, 100]} />
        <meshBasicMaterial color="#7ec8e3" transparent opacity={0.15} />
      </mesh>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   GROUND REFLECTION
   ═══════════════════════════════════════════════════════ */
function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
      <circleGeometry args={[6, 64]} />
      <meshPhysicalMaterial
        color="#080c18"
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════
   DIAMOND SCENE  –  orchestrates all sub-components
   ═══════════════════════════════════════════════════════ */
function DiamondScene({ onInteractionStart, onInteractionEnd }: { onInteractionStart: () => void; onInteractionEnd: () => void }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#d4af37" />
      <directionalLight position={[-3, 4, -5]} intensity={0.5} color="#7ec8e3" />
      <pointLight position={[0, 3, 0]} intensity={1} color="#d4af37" distance={10} />
      <pointLight position={[0, -2, 0]} intensity={0.3} color="#5ba3c9" distance={8} />

      <Starfield count={250} />
      <DiamondCore />
      <OrbitingGems />
      <LightRays />
      <RingHalos />
      <GroundPlane />

      <Environment preset="night" />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.6}
        minDistance={4}
        maxDistance={14}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.6}
        target={[0, 0, 0]}
        onStart={onInteractionStart}
        onEnd={onInteractionEnd}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   EXPORTED COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function LuxuryDiamond3D() {
  const [hovered, setHovered] = useState(false);
  const [interacting, setInteracting] = useState(false);

  const onInteractionStart = useCallback(() => setInteracting(true), []);
  const onInteractionEnd = useCallback(() => setInteracting(false), []);

  return (
    <div
      className={`relative w-full h-full min-h-[400px] ${interacting ? "cursor-grabbing" : "cursor-grab"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setInteracting(false); }}
    >
      {/* Corner accents */}
      <div className={`absolute top-0 left-0 border-t-2 border-l-2 border-luxury-gold/15 rounded-tl-xl z-10 transition-all duration-700 ${hovered ? "w-16 h-16 border-luxury-gold/30" : "w-12 h-12"}`} />
      <div className={`absolute top-0 right-0 border-t-2 border-r-2 border-luxury-gold/15 rounded-tr-xl z-10 transition-all duration-700 ${hovered ? "w-16 h-16 border-luxury-gold/30" : "w-12 h-12"}`} />
      <div className={`absolute bottom-0 left-0 border-b-2 border-l-2 border-luxury-gold/15 rounded-bl-xl z-10 transition-all duration-700 ${hovered ? "w-16 h-16 border-luxury-gold/30" : "w-12 h-12"}`} />
      <div className={`absolute bottom-0 right-0 border-b-2 border-r-2 border-luxury-gold/15 rounded-br-xl z-10 transition-all duration-700 ${hovered ? "w-16 h-16 border-luxury-gold/30" : "w-12 h-12"}`} />

      <div className={`absolute inset-0 rounded-2xl transition-all duration-1000 ${hovered ? "shadow-[inset_0_0_60px_rgba(212,175,55,0.06)]" : ""}`} />

      <Canvas
        camera={{ position: window.innerWidth < 768 ? [5, 3, 7] : [4, 2.5, 5], fov: window.innerWidth < 768 ? 55 : 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <DiamondScene onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} />
      </Canvas>

      {/* Floating hint */}
      <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border z-10 transition-all duration-500 ${interacting ? "bg-luxury-gold/10 border-luxury-gold/30" : "bg-white/5 border-white/10"}`}>
        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${interacting ? "bg-luxury-gold" : "bg-luxury-gold/60 animate-pulse"}`} />
        <span className="text-[10px] text-white/50 uppercase tracking-[0.2em]">
          {interacting ? "Exploring..." : "Drag to Explore"}
        </span>
      </div>
    </div>
  );
}
