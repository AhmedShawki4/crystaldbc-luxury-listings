import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#d4af37" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════
   WIREFRAME GLOBE
   ═══════════════════════════════════════════════════════ */
function WireframeGlobe() {
  const globeRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Outer wireframe sphere */}
      <mesh>
        <sphereGeometry args={[2, 32, 24]} />
        <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.12} />
      </mesh>
      {/* Inner solid sphere (dark) */}
      <mesh>
        <sphereGeometry args={[1.95, 48, 36]} />
        <meshPhysicalMaterial
          color="#0a1228"
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Latitude rings for detail */}
      {[-0.8, -0.3, 0.3, 0.8].map((y, i) => {
        const radius = Math.sqrt(4 - y * y);
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.005, 8, 80]} />
            <meshBasicMaterial color="#d4af37" transparent opacity={0.2} />
          </mesh>
        );
      })}
      {/* Longitude arcs */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((angle, i) => (
        <mesh key={i} rotation={[0, angle, 0]}>
          <torusGeometry args={[2, 0.005, 8, 80]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   LOCATION PINS  –  glowing markers on globe surface
   ═══════════════════════════════════════════════════════ */
const LOCATIONS = [
  { lat: 25.2, lon: 55.27, label: "Dubai" },     // Dubai
  { lat: 30.04, lon: 31.24, label: "Cairo" },     // Cairo
  { lat: 24.47, lon: 46.71, label: "Riyadh" },    // Riyadh
  { lat: 52.52, lon: 13.4, label: "Berlin" },     // Berlin
  { lat: 55.76, lon: 37.62, label: "Moscow" },    // Moscow
  { lat: 34.05, lon: -118.24, label: "LA" },      // LA
  { lat: 51.51, lon: -0.13, label: "London" },    // London
];

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function LocationPins() {
  const groupRef = useRef<THREE.Group>(null!);
  const pins = useMemo(() => LOCATIONS.map(loc => ({
    position: latLonToVec3(loc.lat, loc.lon, 2.05),
    label: loc.label,
  })), []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.08;
      groupRef.current.children.forEach((child, i) => {
        const pulse = Math.sin(clock.getElapsedTime() * 3 + i * 1.2) * 0.3 + 0.7;
        child.scale.setScalar(pulse);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {pins.map((pin, i) => (
        <group key={i} position={pin.position}>
          {/* Pin glow */}
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#d4af37" transparent opacity={0.9} />
          </mesh>
          {/* Outer ring */}
          <mesh>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshBasicMaterial color="#d4af37" transparent opacity={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   CONNECTION ARCS  –  curved lines between city pairs
   ═══════════════════════════════════════════════════════ */
function ConnectionArcs() {
  const groupRef = useRef<THREE.Group>(null!);
  const arcs = useMemo(() => {
    const pairs = [
      [LOCATIONS[0], LOCATIONS[1]], // Dubai–Cairo
      [LOCATIONS[0], LOCATIONS[2]], // Dubai–Riyadh
      [LOCATIONS[1], LOCATIONS[3]], // Cairo–Berlin
      [LOCATIONS[3], LOCATIONS[4]], // Berlin–Moscow
      [LOCATIONS[3], LOCATIONS[6]], // Berlin–London
      [LOCATIONS[6], LOCATIONS[5]], // London–LA
    ];
    return pairs.map(([a, b]) => {
      const start = latLonToVec3(a.lat, a.lon, 2.05);
      const end = latLonToVec3(b.lat, b.lon, 2.05);
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(3.2);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(40);
    });
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {arcs.map((points, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color={i % 2 === 0 ? "#d4af37" : "#5ba3c9"} transparent opacity={0.3} />
          </line>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   TRAVELING PARTICLES  –  data dots moving along arcs
   ═══════════════════════════════════════════════════════ */
function TravelingParticles() {
  const groupRef = useRef<THREE.Group>(null!);
  const curves = useMemo(() => {
    const pairs = [
      [LOCATIONS[0], LOCATIONS[1]],
      [LOCATIONS[0], LOCATIONS[2]],
      [LOCATIONS[1], LOCATIONS[3]],
      [LOCATIONS[3], LOCATIONS[6]],
    ];
    return pairs.map(([a, b]) => {
      const start = latLonToVec3(a.lat, a.lon, 2.05);
      const end = latLonToVec3(b.lat, b.lon, 2.05);
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(3.2);
      return new THREE.QuadraticBezierCurve3(start, mid, end);
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.08;
      groupRef.current.children.forEach((child, i) => {
        const progress = ((t * 0.3 + i * 0.25) % 1);
        const pos = curves[i].getPoint(progress);
        child.position.copy(pos);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {curves.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#d4af37" : "#7ec8e3"} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════
   ORBITAL RING  –  decorative ring around the globe
   ═══════════════════════════════════════════════════════ */
function OrbitalRing() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.1;
    }
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 5, 0, 0]}>
      <torusGeometry args={[3, 0.008, 16, 120]} />
      <meshBasicMaterial color="#d4af37" transparent opacity={0.2} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════
   GLOBE SCENE
   ═══════════════════════════════════════════════════════ */
function GlobeScene({ onInteractionStart, onInteractionEnd }: { onInteractionStart: () => void; onInteractionEnd: () => void }) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#d4af37" />
      <directionalLight position={[-4, 3, -4]} intensity={0.4} color="#5ba3c9" />
      <pointLight position={[0, 0, 3]} intensity={0.8} color="#d4af37" distance={8} />

      <Starfield />
      <WireframeGlobe />
      <LocationPins />
      <ConnectionArcs />
      <TravelingParticles />
      <OrbitalRing />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.65}
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
export default function ContactGlobe3D() {
  const [hovered, setHovered] = useState(false);
  const [interacting, setInteracting] = useState(false);

  const onInteractionStart = useCallback(() => setInteracting(true), []);
  const onInteractionEnd = useCallback(() => setInteracting(false), []);

  return (
    <section className="relative w-full overflow-hidden" style={{ background: "linear-gradient(180deg, #04060d 0%, #080e1e 40%, #0a1228 70%, #060a14 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent z-10" />

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-luxury-gold/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[15%] right-[15%] w-[350px] h-[350px] bg-blue-600/[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[550px] py-16 md:py-20">
          {/* Text */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/20">
              <div className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse" />
              <span className="text-luxury-gold uppercase tracking-[0.25em] text-xs font-semibold">
                Global Presence
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-white leading-tight">
              Connecting<br />
              <span className="text-luxury-gold">World Markets</span>
            </h2>
            <p className="text-lg text-white/60 font-light leading-relaxed max-w-lg">
              Our offices span across 7 major cities worldwide, ensuring seamless communication
              and local expertise wherever you need us.
            </p>
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-display font-bold text-luxury-gold">7</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Global Offices</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <div className="text-3xl font-display font-bold text-white">24/7</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Support</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <div className="text-3xl font-display font-bold text-luxury-gold">5</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Languages</div>
              </div>
            </div>
          </div>

          {/* 3D Canvas */}
          <div
            className={`order-1 lg:order-2 relative h-[400px] md:h-[480px] lg:h-[550px] transition-all duration-300 ${interacting ? "cursor-grabbing" : "cursor-grab"}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setInteracting(false); }}
          >
            <div className={`absolute top-0 left-0 border-t-2 border-l-2 border-luxury-gold/15 rounded-tl-xl z-10 transition-all duration-700 ${hovered ? "w-16 h-16 border-luxury-gold/30" : "w-12 h-12"}`} />
            <div className={`absolute top-0 right-0 border-t-2 border-r-2 border-luxury-gold/15 rounded-tr-xl z-10 transition-all duration-700 ${hovered ? "w-16 h-16 border-luxury-gold/30" : "w-12 h-12"}`} />
            <div className={`absolute bottom-0 left-0 border-b-2 border-l-2 border-luxury-gold/15 rounded-bl-xl z-10 transition-all duration-700 ${hovered ? "w-16 h-16 border-luxury-gold/30" : "w-12 h-12"}`} />
            <div className={`absolute bottom-0 right-0 border-b-2 border-r-2 border-luxury-gold/15 rounded-br-xl z-10 transition-all duration-700 ${hovered ? "w-16 h-16 border-luxury-gold/30" : "w-12 h-12"}`} />

            <div className={`absolute inset-0 rounded-xl transition-all duration-1000 ${hovered ? "shadow-[inset_0_0_60px_rgba(212,175,55,0.06)]" : ""}`} />

            <Canvas
              camera={{ position: [3, 2, 5], fov: 40 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              style={{ background: "transparent" }}
            >
              <GlobeScene onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} />
            </Canvas>

            <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border z-10 transition-all duration-500 ${interacting ? "bg-luxury-gold/10 border-luxury-gold/30" : "bg-white/5 border-white/10"}`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${interacting ? "bg-luxury-gold" : "bg-luxury-gold/60 animate-pulse"}`} />
              <span className="text-[10px] text-white/50 uppercase tracking-[0.2em]">
                {interacting ? "Exploring..." : "Drag to Explore"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent z-10" />
    </section>
  );
}
