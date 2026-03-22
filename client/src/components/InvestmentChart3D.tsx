import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════
   STARFIELD
   ═══════════════════════════════════════════════════════ */
function Starfield({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return arr;
  }, [count]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.012;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#d4af37" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════
   GROWTH BARS  –  3D pillars representing investment growth
   ═══════════════════════════════════════════════════════ */
function GrowthBars() {
  const groupRef = useRef<THREE.Group>(null!);
  const barsData = useMemo(() => [
    { x: -2.4, z: 0, height: 1.2, color: "#d4af37", delay: 0 },
    { x: -1.6, z: 0, height: 1.8, color: "#c9a030", delay: 0.2 },
    { x: -0.8, z: 0, height: 1.4, color: "#d4af37", delay: 0.4 },
    { x: 0, z: 0, height: 2.8, color: "#e8c445", delay: 0.6 },
    { x: 0.8, z: 0, height: 2.2, color: "#d4af37", delay: 0.8 },
    { x: 1.6, z: 0, height: 3.2, color: "#e8c445", delay: 1.0 },
    { x: 2.4, z: 0, height: 3.8, color: "#d4af37", delay: 1.2 },
  ], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const bar = barsData[i];
        const targetHeight = bar.height + Math.sin(t * 1.5 + bar.delay * 3) * 0.2;
        child.scale.y = THREE.MathUtils.lerp(child.scale.y, targetHeight, 0.05);
        child.position.y = child.scale.y * 0.5;
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      {barsData.map((bar, i) => (
        <mesh key={i} position={[bar.x, bar.height * 0.5, bar.z]}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshPhysicalMaterial
            color={bar.color}
            metalness={0.7}
            roughness={0.15}
            envMapIntensity={2}
            clearcoat={0.5}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   BAR GLOW CAPS  –  glowing tops on each bar
   ═══════════════════════════════════════════════════════ */
function BarGlowCaps() {
  const groupRef = useRef<THREE.Group>(null!);
  const barsData = useMemo(() => [
    { x: -2.4, height: 1.2 },
    { x: -1.6, height: 1.8 },
    { x: -0.8, height: 1.4 },
    { x: 0, height: 2.8 },
    { x: 0.8, height: 2.2 },
    { x: 1.6, height: 3.2 },
    { x: 2.4, height: 3.8 },
  ], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const bar = barsData[i];
        const h = bar.height + Math.sin(t * 1.5 + i * 0.6) * 0.2;
        child.position.y = h - 1.5;
        (child as THREE.Mesh).scale.setScalar(0.8 + Math.sin(t * 3 + i) * 0.2);
        ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(t * 2 + i) * 0.15;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {barsData.map((bar, i) => (
        <mesh key={i} position={[bar.x, bar.height - 1.5, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   GROWTH ARROW  –  upward trajectory line
   ═══════════════════════════════════════════════════════ */
function GrowthArrow() {
  const lineRef = useRef<THREE.Line>(null!);
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(-2.8, -1.0, 0.5),
      new THREE.Vector3(-1.5, -0.3, 0.5),
      new THREE.Vector3(0, 0.6, 0.5),
      new THREE.Vector3(1.5, 1.2, 0.5),
      new THREE.Vector3(2.8, 2.5, 0.5),
    ];
    return new THREE.CatmullRomCurve3(points);
  }, []);

  const geometry = useMemo(() => {
    const pts = curve.getPoints(50);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [curve]);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      ((lineRef.current as unknown as THREE.Line).material as THREE.LineBasicMaterial).opacity = 0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
    }
  });

  return (
    // @ts-expect-error - React Three Fiber line component type mismatch with standard SVG line
    <line ref={lineRef as unknown as React.Ref<THREE.Line>} geometry={geometry}>
      <lineBasicMaterial color="#22c55e" transparent opacity={0.4} linewidth={2} />
    </line>
  );
}

/* ═══════════════════════════════════════════════════════
   FLOATING COINS  –  orbiting gold tokens
   ═══════════════════════════════════════════════════════ */
function FloatingCoins({ count = 6 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const coinsData = useMemo(() => Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2,
    radius: 3.5 + Math.random() * 0.5,
    speed: 0.15 + Math.random() * 0.1,
    yOffset: (Math.random() - 0.5) * 2,
    phase: Math.random() * Math.PI * 2,
    size: 0.15 + Math.random() * 0.08,
  })), [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const coin = coinsData[i];
        const angle = coin.angle + t * coin.speed;
        child.position.x = Math.cos(angle) * coin.radius;
        child.position.z = Math.sin(angle) * coin.radius;
        child.position.y = coin.yOffset + Math.sin(t + coin.phase) * 0.4;
        child.rotation.y = t * 2;
        child.rotation.x = Math.PI / 6;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {coinsData.map((coin, i) => (
        <Float key={i} speed={2} floatIntensity={0.2}>
          <mesh>
            <cylinderGeometry args={[coin.size, coin.size, 0.04, 24]} />
            <meshPhysicalMaterial
              color="#d4af37"
              metalness={0.9}
              roughness={0.1}
              envMapIntensity={2}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   BASE PLATFORM  –  reflective ground
   ═══════════════════════════════════════════════════════ */
function BasePlatform() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]}>
      <circleGeometry args={[5, 64]} />
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
   GRID LINES  –  subtle floor grid
   ═══════════════════════════════════════════════════════ */
function GridLines() {
  return (
    <gridHelper args={[10, 20, "#d4af3710", "#d4af3708"]} position={[0, -1.54, 0]} />
  );
}

/* ═══════════════════════════════════════════════════════
   VAULT SCENE
   ═══════════════════════════════════════════════════════ */
function VaultScene({ onInteractionStart, onInteractionEnd }: { onInteractionStart: () => void; onInteractionEnd: () => void }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#d4af37" />
      <directionalLight position={[-4, 4, -3]} intensity={0.4} color="#5ba3c9" />
      <pointLight position={[0, 4, 0]} intensity={1} color="#d4af37" distance={12} />
      <pointLight position={[2.8, 3, 0]} intensity={0.6} color="#22c55e" distance={8} />

      <Starfield />
      <GrowthBars />
      <BarGlowCaps />
      <GrowthArrow />
      <FloatingCoins />
      <BasePlatform />
      <GridLines />

      <Environment preset="night" />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={5}
        maxDistance={15}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.55}
        target={[0, 0.5, 0]}
        onStart={onInteractionStart}
        onEnd={onInteractionEnd}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   EXPORTED COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function InvestmentChart3D() {
  const [hovered, setHovered] = useState(false);
  const [interacting, setInteracting] = useState(false);

  const onInteractionStart = useCallback(() => setInteracting(true), []);
  const onInteractionEnd = useCallback(() => setInteracting(false), []);

  return (
    <div
      className={`relative w-full h-full min-h-[480px] ${interacting ? "cursor-grabbing" : "cursor-grab"}`}
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
        camera={{ position: window.innerWidth < 768 ? [6, 5, 9] : [5, 4, 7], fov: window.innerWidth < 768 ? 55 : 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <VaultScene onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} />
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
