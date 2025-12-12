import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const FloatingShapes = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return;

        // --- THREE.JS SETUP ---
        const scene = new THREE.Scene();
        // Fog for depth blending
        scene.fog = new THREE.FogExp2(0x0a0a0a, 0.05);

        // Camera
        const camera = new THREE.PerspectiveCamera(
            45,
            canvasRef.current.offsetWidth / canvasRef.current.offsetHeight,
            1,
            1000
        );
        camera.position.set(0, 0, 12);

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // ACESFilmicToneMapping for better lighting
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        canvasRef.current.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xfff5e6, 2); // Warm light
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xd4af37, 2, 20); // Gold accent light
        pointLight.position.set(-2, 0, 5);
        scene.add(pointLight);

        // --- MATERIALS ---
        // Gold cubes
        const cubeGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const cubeMaterial = new THREE.MeshStandardMaterial({
            color: 0xD4AF37, // Luxury Gold
            roughness: 0.2,
            metalness: 0.9,
        });

        // --- TEXTURE LOADING ---
        const textureLoader = new THREE.TextureLoader();
        const imageUrls = [
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1600596542815-3ad19fb2cb16?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600", // Luxury Pool
            "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=600", // Modern House
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600", // Real Estate
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600"  // Hotel/Luxury
        ];

        const imageGeom = new THREE.PlaneGeometry(3, 2); // 3:2 Aspect ratio
        const meshes: THREE.Mesh[] = [];

        // Determine screen width for responsive scattering
        const isMobile = window.innerWidth < 768;
        const spreadX = isMobile ? 6 : 18; // Tighter spread on mobile
        const spreadY = 20;

        // Create Image Planes (Background Layer)
        // Load more instances to fill the space
        const totalImages = 12; // increased count
        for (let i = 0; i < totalImages; i++) {
            const url = imageUrls[i % imageUrls.length];
            textureLoader.load(url, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                const mat = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.35, // Slightly lower opacity for elegance
                    side: THREE.DoubleSide
                });
                const mesh = new THREE.Mesh(imageGeom, mat);

                // Position scattered in background
                mesh.position.x = (Math.random() - 0.5) * spreadX;
                // Extended Y range for scrolling
                mesh.position.y = (Math.random() - 0.5) * spreadY;
                mesh.position.z = -2 - (Math.random() * 8); // Deep depth

                mesh.rotation.z = (Math.random() - 0.5) * 0.4; // Slight tilt
                mesh.rotation.x = (Math.random() - 0.5) * 0.2;
                mesh.rotation.y = (Math.random() - 0.5) * 0.2;

                // Add custom float speed
                mesh.userData = {
                    speedY: (Math.random() * 0.003) + 0.001,
                    initialY: mesh.position.y
                };

                scene.add(mesh);
                meshes.push(mesh);
            });
        }

        // Create Cubes (Foreground Layer)
        for (let i = 0; i < 20; i++) {
            const mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);

            mesh.position.x = (Math.random() - 0.5) * 12;
            mesh.position.y = (Math.random() - 0.5) * 12;
            mesh.position.z = (Math.random() - 0.5) * 8 + 2; // Closer to camera

            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;

            const scale = Math.random() * 0.5 + 0.2; // Smaller, refined cubes
            mesh.scale.set(scale, scale, scale);

            mesh.userData = {
                rotationSpeed: (Math.random() * 0.005) + 0.001
            };

            scene.add(mesh);
            meshes.push(mesh);
        }

        // Animation Loop
        const clock = new THREE.Clock();
        let frameId: number;

        const animate = () => {
            const time = clock.getElapsedTime();

            meshes.forEach((mesh) => {
                // If it's a cube (has standard material), rotate it
                if ((mesh.material as THREE.Material).type === 'MeshStandardMaterial') {
                    mesh.rotation.x += mesh.userData.rotationSpeed;
                    mesh.rotation.y += mesh.userData.rotationSpeed;
                    mesh.position.y += Math.sin(time + mesh.position.x) * 0.002;
                } else {
                    // Floating images
                    mesh.position.y += Math.sin(time * 0.5 + mesh.position.x) * 0.001;
                }
            });

            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        animate();

        // --- GSAP SCROLL TRIGGERS ---

        const pinTrigger = ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            pin: canvasRef.current,
            scrub: 1,
        });

        ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                // More dramatic fly-through
                camera.position.z = 12 - (progress * 20);
                camera.rotation.z = progress * 0.2;

                // Optional: Modify fog density based on scroll
            }
        });

        const spans = contentRef.current?.querySelectorAll("span");
        spans?.forEach((span) => {
            ScrollTrigger.create({
                trigger: span,
                start: "top 80%",
                end: "bottom 20%",
                scrub: true,
                onUpdate: (self) => {
                    const dist = Math.abs(self.progress - 0.5);
                    const opacity = 1 - (dist * 1.5);
                    const clamped = Math.max(0.2, Math.min(1, opacity));

                    (span as HTMLElement).style.opacity = clamped.toString();
                    (span as HTMLElement).style.transform = `scale(${0.9 + (clamped * 0.1)})`;
                }
            });
        });

        const handleResize = () => {
            if (!canvasRef.current) return;
            camera.aspect = canvasRef.current.offsetWidth / canvasRef.current.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(frameId);
            pinTrigger.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());

            if (canvasRef.current && canvasRef.current.contains(renderer.domElement)) {
                canvasRef.current.removeChild(renderer.domElement);
            }
            cubeGeometry.dispose();
            cubeMaterial.dispose();
            imageGeom.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div ref={containerRef} className="relative min-h-[250vh] bg-gradient-to-b from-luxury-dark via-[#0a0a0a] to-luxury-dark border-t border-white/5">
            {/* Sticky Canvas Container */}
            <div
                ref={canvasRef}
                className="h-screen w-full overflow-hidden"
                style={{ zIndex: 1 }}
            />

            {/* Text Content Overlay */}
            <div
                ref={contentRef}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
            >
                <div className="max-w-4xl px-8 text-center space-y-32 py-40">
                    <p className="text-4xl md:text-6xl font-display font-bold leading-tight text-white/20 transition-all duration-300">
                        <span className="inline-block transition-all duration-300 text-white">Experience</span> the pinnacle of <span className="inline-block transition-all duration-300 text-white">luxury</span> living.
                    </p>

                    <p className="text-4xl md:text-6xl font-display font-bold leading-tight text-white/20 transition-all duration-300">
                        Where <span className="inline-block transition-all duration-300 text-white">vision</span> meets <span className="inline-block transition-all duration-300 text-white">reality</span> in Dubai.
                    </p>

                    <p className="text-4xl md:text-6xl font-display font-bold leading-tight text-white/20 transition-all duration-300">
                        Are you <span className="inline-block transition-all duration-300 text-white">ready</span> to <span className="inline-block transition-all duration-300 text-white">elevate</span> your portfolio?
                    </p>
                    <p className="text-4xl md:text-6xl font-display font-bold leading-tight text-white/20 transition-all duration-300">
                        Welcome to <span className="inline-block transition-all duration-300 text-white">CrystalDBC</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FloatingShapes;
