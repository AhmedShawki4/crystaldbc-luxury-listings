import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface GlobeModelProps {
  rotationSpeed?: number;
  scale?: number;
}

const GlobeModel = ({ rotationSpeed = 0.002, scale = 1 }: GlobeModelProps) => {
  const { scene } = useGLTF('/city_globe3d_model.glb');
  const groupRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid mutations
  const clonedScene = scene.clone();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

interface GlobeViewerProps {
  className?: string;
}

const GlobeViewer = ({ className = '' }: GlobeViewerProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check WebGL support
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        setWebGLSupported(!!gl);
      } catch {
        setWebGLSupported(false);
      }
    };
    
    checkMobile();
    checkWebGL();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // If WebGL is not supported, return null (fallback will be shown by parent)
  if (!webGLSupported) {
    return null;
  }

  // Responsive settings - larger scale for mobile visibility
  const scale = isMobile ? 2.2 : 2.5;
  const cameraPosition: [number, number, number] = isMobile ? [0, 0, 5.5] : [0, 0, 4.5];
  const rotationSpeed = isMobile ? 0.0015 : 0.002;

  return (
    <div className={`absolute inset-0 w-full h-full ${className}`} style={{ minHeight: '100%' }}>
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        gl={{ 
          antialias: !isMobile, 
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          failIfMajorPerformanceCaveat: false
        }}
        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
      >
        <Suspense fallback={null}>
          {/* Strong ambient lighting for visibility */}
          <ambientLight intensity={1.2} />
          
          {/* Main spotlight - bright golden */}
          <spotLight
            position={[10, 10, 10]}
            angle={0.4}
            penumbra={1}
            intensity={3}
            color="#D4AF37"
            castShadow={!isMobile}
          />
          
          {/* Secondary bright spotlight */}
          <spotLight
            position={[-8, 8, 8]}
            angle={0.5}
            penumbra={0.5}
            intensity={2.5}
            color="#FFD700"
          />
          
          {/* Front fill light for visibility */}
          <directionalLight position={[0, 0, 10]} intensity={1.5} color="#ffffff" />
          
          {/* Top light */}
          <directionalLight position={[0, 10, 0]} intensity={1} color="#ffffff" />
          
          {/* Fill light from the side */}
          <pointLight position={[-10, 0, 5]} intensity={1.5} color="#ffffff" />
          
          {/* Rim light for edge highlighting */}
          <pointLight position={[0, 10, -10]} intensity={1} color="#87CEEB" />
          
          {/* Bottom accent light */}
          <pointLight position={[0, -8, 5]} intensity={0.8} color="#D4AF37" />

          <GlobeModel rotationSpeed={rotationSpeed} scale={scale} />
          
          {/* Environment for reflections */}
          <Environment preset="city" />
        </Suspense>

        {/* Disable controls for smooth auto-rotation */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};

// Preload the model
useGLTF.preload('/city_globe3d_model.glb');

export default GlobeViewer;
