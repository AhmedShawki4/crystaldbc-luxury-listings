import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, OrbitControls, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════
   STARFIELD BACKGROUND — deep space feel
   ═══════════════════════════════════════════════════════ */
function Starfield({ count = 800 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Distribute in a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 18 + Math.random() * 30;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sz[i] = Math.random() * 0.06 + 0.01;
    }
    return [pos, sz];
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.005;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.003) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial color="#f0e6d0" size={0.06} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════
   SINGLE GLASS TOWER
   ═══════════════════════════════════════════════════════ */
interface TowerProps {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  goldTint?: boolean;
}

function Tower({ position, height, width, depth, goldTint }: TowerProps) {
  const glowRef = useRef<THREE.Mesh>(null!);

  const floorCount = Math.floor(height / 0.35);

  const floorGeom = useMemo(() => {
    const pts: number[] = [];
    for (let i = 1; i <= floorCount; i++) {
      const y = -height / 2 + i * (height / (floorCount + 1));
      pts.push(-width / 2, y, depth / 2, width / 2, y, depth / 2);
      pts.push(width / 2, y, depth / 2, width / 2, y, -depth / 2);
      pts.push(width / 2, y, -depth / 2, -width / 2, y, -depth / 2);
      pts.push(-width / 2, y, -depth / 2, -width / 2, y, depth / 2);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geom;
  }, [height, width, depth, floorCount]);

  const windowGeom = useMemo(() => {
    const pts: number[] = [];
    const cols = Math.max(2, Math.floor(width / 0.25));
    for (let c = 1; c < cols; c++) {
      const x = -width / 2 + c * (width / cols);
      pts.push(x, -height / 2, depth / 2, x, height / 2, depth / 2);
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

  // Lit window dots (scattered emissive quads on facade)
  const windowLights = useMemo(() => {
    const lights: { x: number; y: number; z: number }[] = [];
    const rows = Math.floor(height / 0.4);
    const colsF = Math.max(2, Math.floor(width / 0.3));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < colsF; c++) {
        if (Math.random() > 0.45) continue; // only ~55% of windows lit
        const y = -height / 2 + 0.3 + r * (height / rows);
        const x = -width / 2 + 0.15 + c * (width / colsF);
        lights.push({ x, y, z: depth / 2 + 0.005 });
      }
    }
    return lights;
  }, [height, width, depth]);

  useFrame((state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
    }
  });

  const edgeColor = goldTint ? "#d4af37" : "#4a90d9";
  const floorColor = goldTint ? "#c9a227" : "#3a7bc8";
  const glowColor = goldTint ? "#d4af37" : "#4a90d9";
  const windowLightColor = goldTint ? "#ffe4a0" : "#a0d0ff";

  const boxGeom = useMemo(() => new THREE.BoxGeometry(width, height, depth), [width, height, depth]);
  const edgesGeom = useMemo(() => new THREE.EdgesGeometry(boxGeom), [boxGeom]);

  return (
    <group position={position}>
      {/* Glass body */}
      <mesh geometry={boxGeom}>
        <meshPhysicalMaterial
          color={goldTint ? "#1a1810" : "#0a1020"}
          metalness={0.95}
          roughness={0.05}
          transparent
          opacity={0.3}
          envMapIntensity={2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Wireframe edges */}
      <lineSegments geometry={edgesGeom}>
        <lineBasicMaterial color={edgeColor} transparent opacity={0.8} />
      </lineSegments>

      {/* Floor lines */}
      <lineSegments geometry={floorGeom}>
        <lineBasicMaterial color={floorColor} transparent opacity={0.18} />
      </lineSegments>

      {/* Window grid */}
      <lineSegments geometry={windowGeom}>
        <lineBasicMaterial color={floorColor} transparent opacity={0.1} />
      </lineSegments>

      {/* Lit windows – small emissive planes */}
      {windowLights.map((w, i) => (
        <mesh key={i} position={[w.x, w.y, w.z]}>
          <planeGeometry args={[0.08, 0.06]} />
          <meshBasicMaterial color={windowLightColor} transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Top spire for tall towers */}
      {height > 3 && (
        <group position={[0, height / 2, 0]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.015, 0.05, 0.9, 8]} />
            <meshStandardMaterial color={edgeColor} metalness={1} roughness={0.2} emissive={edgeColor} emissiveIntensity={0.5} />
          </mesh>
          {/* Beacon light at top */}
          <pointLight position={[0, 0.95, 0]} color={edgeColor} intensity={2} distance={4} />
        </group>
      )}

      {/* Glow volume */}
      <mesh ref={glowRef} geometry={boxGeom} scale={[1.1, 1.03, 1.1]}>
        <meshBasicMaterial color={glowColor} transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   FLOATING CRYSTAL — glass octahedron with inner glow
   ═══════════════════════════════════════════════════════ */
interface CrystalProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
  orbitRadius?: number;
  orbitOffset?: number;
}

function Crystal({ position, scale = 0.35, color = "#d4af37", speed = 0.4, orbitRadius = 0, orbitOffset = 0 }: CrystalProps) {
  const ref = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      // Orbit if radius set
      if (orbitRadius > 0) {
        ref.current.position.x = position[0] + Math.cos(t * speed + orbitOffset) * orbitRadius;
        ref.current.position.z = position[2] + Math.sin(t * speed + orbitOffset) * orbitRadius;
      }
      // Gentle vertical bob
      ref.current.position.y = position[1] + Math.sin(t * speed * 1.5 + orbitOffset) * 0.3;
      // Spin
      ref.current.rotation.y = t * speed * 0.8;
      ref.current.rotation.x = Math.sin(t * speed * 0.5) * 0.3;
    }
    // Inner glow pulse
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(t * 2 + orbitOffset) * 0.2;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Outer crystal shell */}
      <mesh scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.4}
          chromaticAberration={0.15}
          anisotropy={0.2}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          ior={1.5}
          color={color}
          transmissionSampler={false}
        />
      </mesh>

      {/* Wireframe outline */}
      <mesh scale={scale * 1.01}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.4} />
      </mesh>

      {/* Inner glow core */}
      <mesh ref={innerRef} scale={scale * 0.45}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* Point light for bleed */}
      <pointLight color={color} intensity={1.5} distance={3} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   LIGHT BEAMS — volumetric spotlights from ground
   ═══════════════════════════════════════════════════════ */
function LightBeam({ position, color = "#d4af37", height = 8 }: { position: [number, number, number]; color?: string; height?: number }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.02;
    }
  });

  return (
    <mesh ref={ref} position={[position[0], position[1] + height / 2, position[2]]}>
      <cylinderGeometry args={[0.01, 0.3, height, 8, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════
   GROUND GRID with gradient fade
   ═══════════════════════════════════════════════════════ */
function GroundGrid() {
  const gridRef = useRef<THREE.GridHelper>(null!);

  useFrame((state) => {
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.Material;
      (mat as THREE.MeshBasicMaterial).opacity = 0.12 + Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
    }
  });

  return (
    <>
      <gridHelper ref={gridRef} args={[24, 48, "#d4af37", "#111828"]} position={[0, -2.5, 0]} />
      {/* Ground reflective plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.49, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshPhysicalMaterial
          color="#080c18"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   GOLD DUST PARTICLES
   ═══════════════════════════════════════════════════════ */
function Particles({ count = 100 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = Math.random() * 10 - 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
      const pos = ref.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        pos.setY(i, pos.getY(i) + Math.sin(state.clock.elapsedTime * 0.5 + i * 0.7) * 0.0015);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#d4af37" size={0.05} transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════
   FOG BACKGROUND SPHERE
   ═══════════════════════════════════════════════════════ */
function BackgroundSphere() {
  return (
    <mesh>
      <sphereGeometry args={[50, 32, 32]} />
      <meshBasicMaterial color="#060a14" side={THREE.BackSide} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════
   HOLOGRAPHIC SCAN RING — orbiting ring around main tower
   ═══════════════════════════════════════════════════════ */
function HoloRing({ position, radius = 1.2, color = "#d4af37", speed = 0.6 }: {
  position: [number, number, number]; radius?: number; color?: string; speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.position.y = position[1] + Math.sin(t * speed) * 2.5;
      ref.current.rotation.x = Math.PI / 2;
      ref.current.rotation.z = t * 0.3;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(t * 1.5) * 0.06;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[radius, 0.008, 16, 80]} />
      <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════
   ENERGY BRIDGE — connecting line between two towers
   ═══════════════════════════════════════════════════════ */
function EnergyBridge({ start, end, color = "#d4af37" }: {
  start: [number, number, number]; end: [number, number, number]; color?: string;
}) {
  const ref = useRef<THREE.Line>(null!);

  const geom = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2,
        Math.max(start[1], end[1]) + 0.8,
        (start[2] + end[2]) / 2
      ),
      new THREE.Vector3(...end)
    );
    const pts = curve.getPoints(30);
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return g;
  }, [start, end]);

  useFrame((state) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 2 + start[0]) * 0.05;
    }
  });

  const Line = 'line' as any;

  return (
    <Line ref={ref} geometry={geom}>
      <lineBasicMaterial color={color} transparent opacity={0.1} />
    </Line>
  );
}

/* ═══════════════════════════════════════════════════════
   GROUND PULSE RINGS — expanding concentric circles
   ═══════════════════════════════════════════════════════ */
function GroundPulse({ position }: { position: [number, number, number] }) {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Ring 1
    if (ring1.current) {
      const s = 0.5 + ((t * 0.3) % 2) * 2;
      ring1.current.scale.set(s, s, s);
      const mat = ring1.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.15 - ((t * 0.3) % 2) * 0.08);
    }
    // Ring 2 (offset)
    if (ring2.current) {
      const s = 0.5 + (((t * 0.3) + 1) % 2) * 2;
      ring2.current.scale.set(s, s, s);
      const mat = ring2.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.15 - (((t * 0.3) + 1) % 2) * 0.08);
    }
  });

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ring1}>
        <ringGeometry args={[0.95, 1, 64]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2}>
        <ringGeometry args={[0.95, 1, 64]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   FLOATING DATA POINTS — small holographic markers
   ═══════════════════════════════════════════════════════ */
function DataPoint({ position, color = "#d4af37" }: { position: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0] * 3) * 0.15;
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <octahedronGeometry args={[0.06, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      {/* Tiny ring around it */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.005, 8, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <pointLight color={color} intensity={0.3} distance={1.5} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   SCENE COMPOSITION (with OrbitControls)
   ═══════════════════════════════════════════════════════ */
function CityScene({ onInteractionStart, onInteractionEnd }: {
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}) {
  const { viewport } = useThree();
  const isMobile = viewport.width < 6;

  return (
    <>
      {/* User orbit controls — auto-rotate, constrained */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.8}
        minDistance={6}
        maxDistance={18}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.55}
        target={[0, 1, 0]}
        onStart={onInteractionStart}
        onEnd={onInteractionEnd}
      />

      {/* Background */}
      <BackgroundSphere />
      <Starfield count={isMobile ? 400 : 800} />

      {/* Scene fog */}
      <fog attach="fog" args={["#060a14", 14, 45]} />

      {/* Lighting rig */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color="#fff5e6" />
      <directionalLight position={[-4, 6, -5]} intensity={0.5} color="#4a90d9" />
      <pointLight position={[0, 7, 0]} intensity={1.2} color="#d4af37" distance={18} />
      <pointLight position={[-3, 3, -6]} intensity={0.6} color="#6a5acd" distance={15} />
      <pointLight position={[4, 2, -5]} intensity={0.4} color="#1e90ff" distance={12} />
      {/* Warm fill from front-bottom */}
      <pointLight position={[0, -1, 8]} intensity={0.3} color="#d4af37" distance={14} />

      <Float speed={0.5} rotationIntensity={0.02} floatIntensity={0.15}>
        <group>
          {/* ── Towers ── */}
          <Tower position={[0, 1.2, 0]} height={5.5} width={1} depth={1} goldTint />
          <Tower position={[-1.8, 0.35, 0.3]} height={3.5} width={0.8} depth={0.8} />
          <Tower position={[1.7, 0.55, -0.2]} height={4} width={0.9} depth={0.7} goldTint />
          <Tower position={[0.3, -0.1, -1.5]} height={2.8} width={0.7} depth={0.7} />
          <Tower position={[-2.8, -0.3, -0.8]} height={2.2} width={0.6} depth={0.6} />
          <Tower position={[2.9, -0.15, 0.6]} height={2.5} width={0.65} depth={0.65} goldTint />
          <Tower position={[-0.8, 0.0, -2.2]} height={2.0} width={0.55} depth={0.55} />

          {/* ── Holographic scan rings on the main tower ── */}
          <HoloRing position={[0, 2, 0]} radius={0.8} color="#d4af37" speed={0.6} />
          <HoloRing position={[0, 1, 0]} radius={1.0} color="#4a90d9" speed={0.45} />
          <HoloRing position={[0, 3.5, 0]} radius={0.6} color="#d4af37" speed={0.75} />

          {/* ── Energy bridges between towers ── */}
          <EnergyBridge start={[0, 2.5, 0.5]} end={[-1.8, 1.5, 0.7]} color="#d4af37" />
          <EnergyBridge start={[0, 2.0, -0.5]} end={[1.7, 1.8, -0.2]} color="#4a90d9" />
          <EnergyBridge start={[-1.8, 1.0, 0.3]} end={[-2.8, 0.5, -0.8]} color="#d4af37" />
          <EnergyBridge start={[1.7, 1.2, -0.2]} end={[2.9, 0.8, 0.6]} color="#4a90d9" />

          {/* ── Ground pulse rings ── */}
          <GroundPulse position={[0, -2.48, 0]} />

          {/* ── Data points floating near towers ── */}
          <DataPoint position={[0.6, 4.5, 0.6]} color="#d4af37" />
          <DataPoint position={[-1.2, 2.8, 0.9]} color="#4a90d9" />
          <DataPoint position={[2.2, 3.0, 0.3]} color="#d4af37" />
          <DataPoint position={[-2.0, 1.8, -0.3]} color="#8a6fff" />
          <DataPoint position={[0.5, 1.5, -1.2]} color="#d4af37" />

          {/* ── Floating Crystals ── */}
          <Crystal position={[2.2, 3.5, 1.5]} scale={0.3} color="#d4af37" speed={0.35} orbitRadius={1.2} orbitOffset={0} />
          <Crystal position={[-2.5, 4.2, -1]} scale={0.22} color="#4a90d9" speed={0.45} orbitRadius={1.5} orbitOffset={2} />
          <Crystal position={[0, 5.5, 0]} scale={0.4} color="#d4af37" speed={0.25} orbitRadius={0.8} orbitOffset={4} />
          <Crystal position={[-1.5, 2.5, 2]} scale={0.18} color="#8a6fff" speed={0.5} orbitRadius={1} orbitOffset={1} />
          <Crystal position={[3, 2, -1.5]} scale={0.2} color="#d4af37" speed={0.38} orbitRadius={0.6} orbitOffset={3} />

          {/* ── Light Beams ── */}
          <LightBeam position={[0, -2.5, 0]} color="#d4af37" height={12} />
          <LightBeam position={[1.7, -2.5, -0.2]} color="#4a90d9" height={9} />
          <LightBeam position={[-1.8, -2.5, 0.3]} color="#d4af37" height={8} />

          <GroundGrid />
          <Particles count={isMobile ? 50 : 120} />
        </group>
      </Float>

      <Environment preset="night" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   EXPORTED COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function Building3D() {
  const [hovered, setHovered] = useState(false);
  const [interacting, setInteracting] = useState(false);

  const onInteractionStart = useCallback(() => setInteracting(true), []);
  const onInteractionEnd = useCallback(() => setInteracting(false), []);

  return (
    <section className="relative w-full overflow-hidden" style={{ background: "linear-gradient(180deg, #04060d 0%, #080e1e 40%, #0a1228 70%, #060a14 100%)" }}>
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent z-10" />

      {/* Background ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-luxury-gold/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-purple-600/[0.03] rounded-full blur-[100px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[650px] py-16 md:py-24">
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
            className={`order-1 lg:order-2 relative h-[480px] md:h-[580px] lg:h-[650px] transition-all duration-300 ${interacting ? "cursor-grabbing" : "cursor-grab"}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setInteracting(false); }}
          >
            {/* Corner accents — animate on hover */}
            <div className={`absolute top-0 left-0 border-t-2 border-l-2 border-luxury-gold/15 rounded-tl-xl z-10 transition-all duration-700 ${hovered ? "w-20 h-20 border-luxury-gold/30" : "w-16 h-16"}`} />
            <div className={`absolute top-0 right-0 border-t-2 border-r-2 border-luxury-gold/15 rounded-tr-xl z-10 transition-all duration-700 ${hovered ? "w-20 h-20 border-luxury-gold/30" : "w-16 h-16"}`} />
            <div className={`absolute bottom-0 left-0 border-b-2 border-l-2 border-luxury-gold/15 rounded-bl-xl z-10 transition-all duration-700 ${hovered ? "w-20 h-20 border-luxury-gold/30" : "w-16 h-16"}`} />
            <div className={`absolute bottom-0 right-0 border-b-2 border-r-2 border-luxury-gold/15 rounded-br-xl z-10 transition-all duration-700 ${hovered ? "w-20 h-20 border-luxury-gold/30" : "w-16 h-16"}`} />

            {/* Hover glow ring */}
            <div className={`absolute inset-0 rounded-xl transition-all duration-1000 ${hovered ? "shadow-[inset_0_0_80px_rgba(212,175,55,0.08)]" : ""}`} />

            <Canvas
              camera={{ position: [7, 4.5, 9], fov: 38 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              style={{ background: "transparent" }}
            >
              <CityScene onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} />
            </Canvas>

            {/* Floating interaction hint */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border z-10 transition-all duration-500 ${interacting ? "bg-luxury-gold/10 border-luxury-gold/30" : "bg-white/5 border-white/10"}`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${interacting ? "bg-luxury-gold" : "bg-luxury-gold/60 animate-pulse"}`} />
              <span className="text-[10px] text-white/50 uppercase tracking-[0.2em]">
                {interacting ? "Exploring..." : "Drag to Explore"}
              </span>
              {!interacting && (
                <svg className="w-3 h-3 text-white/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent z-10" />
    </section>
  );
}
