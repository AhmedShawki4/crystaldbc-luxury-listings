import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ─── single glass tower ─── */
interface TowerProps {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  goldTint?: boolean;
  rotationSpeed?: number;
}

function Tower({ position, height, width, depth, goldTint, rotationSpeed = 0 }: TowerProps) {
  const meshRef = useRef<THREE.Group>(null!);
  const edgeRef = useRef<THREE.LineSegments>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  // Floors (horizontal lines inside the tower)
  const floorCount = Math.floor(height / 0.35);
  const floorGeom = useMemo(() => {
    const pts: number[] = [];
    for (let i = 1; i <= floorCount; i++) {
      const y = -height / 2 + i * (height / (floorCount + 1));
      // Front face
      pts.push(-width / 2, y, depth / 2, width / 2, y, depth / 2);
      // Right face
      pts.push(width / 2, y, depth / 2, width / 2, y, -depth / 2);
      // Back face
      pts.push(width / 2, y, -depth / 2, -width / 2, y, -depth / 2);
      // Left face
      pts.push(-width / 2, y, -depth / 2, -width / 2, y, depth / 2);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geom;
  }, [height, width, depth, floorCount]);

  // Window grid (vertical lines)
  const windowGeom = useMemo(() => {
    const pts: number[] = [];
    const cols = Math.max(2, Math.floor(width / 0.25));
    for (let c = 1; c < cols; c++) {
      const x = -width / 2 + c * (width / cols);
      // Front
      pts.push(x, -height / 2, depth / 2, x, height / 2, depth / 2);
      // Back
      pts.push(x, -height / 2, -depth / 2, x, height / 2, -depth / 2);
    }
    const depthCols = Math.max(2, Math.floor(depth / 0.25));
    for (let c = 1; c < depthCols; c++) {
      const z = -depth / 2 + c * (depth / depthCols);
      pts.push(width / 2, -height / 2, z, width / 2, height / 2, z);
      pts.push(-width / 2, -height / 2, z, -width / 2, height / 2, z);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geom;
  }, [height, width, depth]);

  useFrame((state) => {
    if (meshRef.current && rotationSpeed) {
      meshRef.current.rotation.y += rotationSpeed * 0.002;
    }
    // Pulse glow
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.03 + Math.sin(state.clock.elapsedTime * 1.2) * 0.015;
    }
  });

  const edgeColor = goldTint ? "#d4af37" : "#4a90d9";
  const floorColor = goldTint ? "#c9a227" : "#3a7bc8";
  const glowColor = goldTint ? "#d4af37" : "#4a90d9";

  const boxGeom = useMemo(() => new THREE.BoxGeometry(width, height, depth), [width, height, depth]);
  const edgesGeom = useMemo(() => new THREE.EdgesGeometry(boxGeom), [boxGeom]);

  return (
    <group ref={meshRef} position={position}>
      {/* Glass body */}
      <mesh geometry={boxGeom}>
        <meshPhysicalMaterial
          color={goldTint ? "#1a1810" : "#0d1520"}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.35}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Wireframe edges */}
      <lineSegments ref={edgeRef} geometry={edgesGeom}>
        <lineBasicMaterial color={edgeColor} transparent opacity={0.7} />
      </lineSegments>

      {/* Floor lines */}
      <lineSegments geometry={floorGeom}>
        <lineBasicMaterial color={floorColor} transparent opacity={0.2} />
      </lineSegments>

      {/* Window grid */}
      <lineSegments geometry={windowGeom}>
        <lineBasicMaterial color={floorColor} transparent opacity={0.12} />
      </lineSegments>

      {/* Top antenna / spire for tallest tower */}
      {height > 3 && (
        <mesh position={[0, height / 2 + 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.06, 0.8, 8]} />
          <meshStandardMaterial color={edgeColor} metalness={1} roughness={0.2} emissive={edgeColor} emissiveIntensity={0.3} />
        </mesh>
      )}

      {/* Glow volume */}
      <mesh ref={glowRef} geometry={boxGeom} scale={[1.08, 1.02, 1.08]}>
        <meshBasicMaterial color={glowColor} transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/* ─── ground grid ─── */
function GroundGrid() {
  const gridRef = useRef<THREE.GridHelper>(null!);
  useFrame((state) => {
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.Material;
      (mat as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  return (
    <gridHelper
      ref={gridRef}
      args={[20, 40, "#d4af37", "#1a2030"]}
      position={[0, -2.5, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

/* ─── floating particles ─── */
function Particles({ count = 60 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = Math.random() * 8 - 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      const pos = ref.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const y = pos.getY(i);
        pos.setY(i, y + Math.sin(state.clock.elapsedTime + i) * 0.001);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#d4af37" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ─── scene composition ─── */
function CityScene() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.3 + state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1} color="#fff5e6" />
      <directionalLight position={[-3, 6, -4]} intensity={0.4} color="#4a90d9" />
      <pointLight position={[0, 6, 0]} intensity={0.8} color="#d4af37" distance={15} />

      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.3}>
        <group ref={groupRef}>
          {/* Centre tower – tallest, gold */}
          <Tower position={[0, 1.2, 0]} height={5.5} width={1} depth={1} goldTint rotationSpeed={0} />
          {/* Left tower */}
          <Tower position={[-1.8, 0.35, 0.3]} height={3.5} width={0.8} depth={0.8} rotationSpeed={0} />
          {/* Right tower */}
          <Tower position={[1.7, 0.55, -0.2]} height={4} width={0.9} depth={0.7} goldTint rotationSpeed={0} />
          {/* Far back */}
          <Tower position={[0.3, -0.1, -1.5]} height={2.8} width={0.7} depth={0.7} rotationSpeed={0} />
          {/* Small left */}
          <Tower position={[-2.8, -0.3, -0.8]} height={2.2} width={0.6} depth={0.6} rotationSpeed={0} />
          {/* Small right */}
          <Tower position={[2.9, -0.15, 0.6]} height={2.5} width={0.65} depth={0.65} goldTint rotationSpeed={0} />

          <GroundGrid />
          <Particles />
        </group>
      </Float>

      <Environment preset="city" />
    </>
  );
}

/* ─── exported component ─── */
export default function Building3D() {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="relative w-full bg-luxury-dark overflow-hidden">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent z-10" />

      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[600px] py-16 md:py-24">
          {/* Text content */}
          <div className="space-y-6 order-2 lg:order-1 building3d-text">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/20">
              <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse" />
              <span className="text-luxury-gold uppercase tracking-[0.25em] text-xs font-semibold">
                Architectural Excellence
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white leading-tight">
              Iconic Skylines,<br />
              <span className="text-luxury-gold">Crafted For You</span>
            </h2>
            <p className="text-lg text-white/60 font-light leading-relaxed max-w-lg">
              From Dubai Marina's glittering towers to Cairo's modern masterpieces — we curate
              properties within the world's most breathtaking architectural landmarks.
            </p>
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-display font-bold text-luxury-gold">50+</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Iconic Towers</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <div className="text-3xl font-display font-bold text-white">12</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">World Cities</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <div className="text-3xl font-display font-bold text-luxury-gold">$2B+</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Portfolio Value</div>
              </div>
            </div>
          </div>

          {/* 3D Canvas */}
          <div
            className="order-1 lg:order-2 relative h-[450px] md:h-[550px] lg:h-[600px] cursor-grab active:cursor-grabbing"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-luxury-gold/20 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-luxury-gold/20 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-luxury-gold/20 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-luxury-gold/20 rounded-br-lg" />

            {/* Hover ring */}
            <div className={`absolute inset-0 border border-luxury-gold/0 rounded-lg transition-all duration-700 ${hovered ? "border-luxury-gold/10" : ""}`} />

            <Canvas
              camera={{ position: [6, 4, 8], fov: 40 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true }}
              style={{ background: "transparent" }}
            >
              <CityScene />
            </Canvas>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent z-10" />
    </section>
  );
}
