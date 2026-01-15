import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

gsap.registerPlugin(ScrollTrigger);

const FloatingShapes = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation();

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
        const imageMeshes: THREE.Mesh[] = [];
        const cubeMeshes: THREE.Mesh[] = [];

        // Determine screen width for responsive scattering
        const isMobile = window.innerWidth < 768;
        const spreadX = isMobile ? 5 : 14; // Keep shapes closer to center
        const spreadY = isMobile ? 10 : 14; // Center cluster vertically
        const centerOffsetY = isMobile ? -0.4 : -0.2;

        // Create Image Planes (Background Layer)
        // Slightly different counts for mobile vs desktop
        const totalImages = isMobile ? 8 : 14;

        let primaryHighlightMesh: THREE.Mesh | null = null;
        let secondaryHighlightMesh: THREE.Mesh | null = null;
        let highlightsInitialized = false;

        const pickRandomHighlights = () => {
            if (imageMeshes.length === 0 || highlightsInitialized) return;

            const shuffled = [...imageMeshes].sort(() => Math.random() - 0.5);
            primaryHighlightMesh = shuffled[0];
            secondaryHighlightMesh = shuffled[1] ?? null;
            highlightsInitialized = true;

            setupHighlightScroll(primaryHighlightMesh, secondaryHighlightMesh || undefined);
        };
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
                // Centered Y range so shapes remain in the section
                mesh.position.y = (Math.random() - 0.5) * spreadY + centerOffsetY;
                mesh.position.z = -2 - (Math.random() * 8); // Deep depth

                mesh.rotation.z = (Math.random() - 0.5) * 0.4; // Slight tilt
                mesh.rotation.x = (Math.random() - 0.5) * 0.2;
                mesh.rotation.y = (Math.random() - 0.5) * 0.2;

                const baseScale = mesh.scale.clone();

                // Add custom float speed
                mesh.userData = {
                    type: "image",
                    speedY: (Math.random() * 0.003) + 0.001,
                    initialY: mesh.position.y,
                    basePosition: mesh.position.clone(),
                    floatAmplitude: Math.random() * 0.35 + 0.15,
                    floatSpeed: Math.random() * 0.6 + 0.25,
                    floatPhase: Math.random() * Math.PI * 2,
                    baseScale,
                    baseOpacity: mat.opacity,
                    isHighlight: false,
                };

                scene.add(mesh);
                meshes.push(mesh);
                imageMeshes.push(mesh);

                // Once we have at least one image, pick highlights
                if (imageMeshes.length >= 1) {
                    pickRandomHighlights();
                }
            });
        }

        // Create Cubes (Foreground Layer)
        for (let i = 0; i < 20; i++) {
            const mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);

            mesh.position.x = (Math.random() - 0.5) * 12;
            // Keep cubes centered in the section
            mesh.position.y = (Math.random() - 0.5) * 10 + centerOffsetY;
            mesh.position.z = (Math.random() - 0.5) * 8 + 2; // Closer to camera

            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;

            const scale = Math.random() * 0.5 + 0.2; // Smaller, refined cubes
            mesh.scale.set(scale, scale, scale);

            mesh.userData = {
                type: "cube",
                rotationSpeed: (Math.random() * 0.005) + 0.001,
                floatAmplitude: Math.random() * 0.35 + 0.15,
                floatSpeed: Math.random() * 0.6 + 0.25,
                floatPhase: Math.random() * Math.PI * 2,
                baseScale: mesh.scale.clone(),
                basePosition: mesh.position.clone(),
            };

            scene.add(mesh);
            meshes.push(mesh);
            cubeMeshes.push(mesh);
        }

        // Animation Loop
        const clock = new THREE.Clock();
        let frameId: number;

        // --- Interactivity (hover + click + drag) ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(2, 2); // start outside of view
        let hoveredObject: THREE.Mesh | null = null;
        let isDragging = false;
        let draggedObject: THREE.Mesh | null = null;
        const dragPlane = new THREE.Plane();
        const dragPlanePoint = new THREE.Vector3();
        const dragOffset = new THREE.Vector3();
        const lastDragPosition = new THREE.Vector3();
        const dragVelocity = new THREE.Vector3();

        const handlePointerMove = (event: MouseEvent) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // If dragging, move the selected object along a plane in front of the camera
            if (isDragging && draggedObject) {
                raycaster.setFromCamera(mouse, camera);
                const intersectionPoint = new THREE.Vector3();
                if (raycaster.ray.intersectPlane(dragPlane, intersectionPoint)) {
                    const targetPos = intersectionPoint.sub(dragOffset);
                    draggedObject.position.lerp(targetPos, 0.25);

                    dragVelocity.copy(targetPos).sub(lastDragPosition);
                    lastDragPosition.copy(targetPos);
                }
            }
        };

        const handlePointerDown = (event: MouseEvent) => {
            if (!canvasRef.current) return;

            // Update mouse first so raycast is accurate
            handlePointerMove(event);

            raycaster.setFromCamera(mouse, camera);
            const intersect = raycaster.intersectObjects([...imageMeshes, ...cubeMeshes])[0];
            if (!intersect) return;

            draggedObject = intersect.object as THREE.Mesh;
            isDragging = true;
            canvasRef.current.style.cursor = "grabbing";

            dragPlanePoint.copy(intersect.point);
            dragPlane.setFromNormalAndCoplanarPoint(
                camera.getWorldDirection(new THREE.Vector3()).normalize(),
                dragPlanePoint
            );

            dragOffset.copy(intersect.point).sub(draggedObject.position);
            lastDragPosition.copy(intersect.point.clone().sub(dragOffset));
            dragVelocity.set(0, 0, 0);
        };

        const releaseDrag = () => {
            if (!draggedObject || !canvasRef.current) {
                isDragging = false;
                draggedObject = null;
                return;
            }

            const ud: any = draggedObject.userData;
            const basePos: THREE.Vector3 | undefined = ud.basePosition;
            const currentPos = draggedObject.position.clone();

            // Compute an inertial "throw" based on last drag velocity
            const throwStrength = 3; // tune for how far things are thrown
            const target = currentPos.add(dragVelocity.clone().multiplyScalar(throwStrength));

            // Keep depth somewhat constrained around the object's natural layer
            if (basePos) {
                const minZ = basePos.z - 2.0;
                const maxZ = basePos.z + 2.0;
                target.z = THREE.MathUtils.clamp(target.z, minZ, maxZ);
            }

            gsap.to(draggedObject.position, {
                x: target.x,
                y: target.y,
                z: target.z,
                duration: 0.8,
                ease: "power3.out",
            });

            isDragging = false;
            draggedObject = null;
            dragVelocity.set(0, 0, 0);
            canvasRef.current.style.cursor = "default";
        };

        const handleClick = () => {
            if (!canvasRef.current) return;
            if (isDragging) return; // avoid conflict with drag release
            raycaster.setFromCamera(mouse, camera);
            const intersect = raycaster.intersectObjects([...imageMeshes, ...cubeMeshes])[0];
            if (!intersect) return;

            const obj = intersect.object as THREE.Mesh;
            const userData: any = obj.userData;

            // Subtle pop-forward interaction
            const targetZ = (userData.basePosition?.z ?? obj.position.z) + (userData.type === "image" ? 1.2 : 0.6);
            gsap.to(obj.position, {
                z: targetZ,
                duration: 0.6,
                yoyo: true,
                repeat: 1,
                ease: "power2.out",
            });
        };

        canvasRef.current.addEventListener("mousemove", handlePointerMove);
        canvasRef.current.addEventListener("mousedown", handlePointerDown);
        canvasRef.current.addEventListener("mouseup", releaseDrag);
        canvasRef.current.addEventListener("mouseleave", releaseDrag);
        canvasRef.current.addEventListener("click", handleClick);

        const animate = () => {
            const time = clock.getElapsedTime();

            // Basic floating / rotation
            meshes.forEach((mesh) => {
                // If it's a cube (has standard material), rotate it
                if ((mesh.material as THREE.Material).type === 'MeshStandardMaterial') {
                    mesh.rotation.x += mesh.userData.rotationSpeed;
                    mesh.rotation.y += mesh.userData.rotationSpeed;
                    if (!isDragging || mesh !== draggedObject) {
                        const basePos = mesh.userData.basePosition as THREE.Vector3 | undefined;
                        if (basePos) {
                            const amp = mesh.userData.floatAmplitude ?? 0.3;
                            const speed = mesh.userData.floatSpeed ?? 0.4;
                            const phase = mesh.userData.floatPhase ?? 0;
                            mesh.position.y = basePos.y + Math.sin(time * speed + phase) * amp;
                        }
                    }
                } else {
                    // Floating images
                    // Don't override highlight position too much
                    if (!mesh.userData.isHighlight) {
                        if (!isDragging || mesh !== draggedObject) {
                            const basePos = mesh.userData.basePosition as THREE.Vector3 | undefined;
                            if (basePos) {
                                const amp = mesh.userData.floatAmplitude ?? 0.25;
                                const speed = mesh.userData.floatSpeed ?? 0.35;
                                const phase = mesh.userData.floatPhase ?? 0;
                                mesh.position.y = basePos.y + Math.sin(time * speed + phase) * amp;
                            }
                        }
                    }
                }
            });

            // Hover feedback (disabled while dragging so the object feels "grabbed")
            if (canvasRef.current && !isDragging) {
                raycaster.setFromCamera(mouse, camera);
                const intersections = raycaster.intersectObjects([...imageMeshes, ...cubeMeshes]);
                const first = intersections[0]?.object as THREE.Mesh | undefined;

                if (hoveredObject && hoveredObject !== first) {
                    const ud: any = hoveredObject.userData;
                    if (ud.baseScale) {
                        hoveredObject.scale.copy(ud.baseScale);
                    }
                    if (hoveredObject.material instanceof THREE.MeshBasicMaterial && typeof ud.baseOpacity === "number") {
                        hoveredObject.material.opacity = ud.baseOpacity;
                    }
                    canvasRef.current.style.cursor = "default";
                    hoveredObject = null;
                }

                if (first && first !== hoveredObject) {
                    const ud: any = first.userData;
                    if (ud.baseScale) {
                        const hoverScale = ud.baseScale.clone().multiplyScalar(1.1);
                        first.scale.copy(hoverScale);
                    }
                    if (first.material instanceof THREE.MeshBasicMaterial && typeof ud.baseOpacity === "number") {
                        first.material.opacity = Math.min(1, ud.baseOpacity + 0.25);
                    }
                    canvasRef.current.style.cursor = "pointer";
                    hoveredObject = first;
                }
            }

            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        animate();

        // --- GSAP SCROLL TRIGGERS ---

        const triggers: ScrollTrigger[] = [];

        const setupHighlightScroll = (primary: THREE.Mesh, secondary?: THREE.Mesh) => {
            if (!containerRef.current) return;

            const primaryMat = primary.material as THREE.MeshBasicMaterial;
            const primaryBase = {
                position: (primary.userData.basePosition as THREE.Vector3).clone(),
                scale: (primary.userData.baseScale as THREE.Vector3).clone(),
                opacity: primary.userData.baseOpacity as number,
            };

            primary.userData.isHighlight = true;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top center",
                    end: "bottom center",
                    scrub: 0.6,
                },
            });

            // Phase 1: bring first image forward and sharpen
            tl.to(primary.position, {
                x: 0,
                y: 0.4,
                z: 2,
                ease: "power3.out",
                duration: 1.4,
            }, 0);
            tl.to(primary.scale, {
                x: primaryBase.scale.x * 1.4,
                y: primaryBase.scale.y * 1.4,
                ease: "power3.out",
                duration: 1.4,
            }, 0);
            tl.to(primaryMat, {
                opacity: 1,
                ease: "power3.out",
                duration: 1.4,
            }, 0);

            // Phase 2: gently return primary to its original place
            tl.to(primary.position, {
                x: primaryBase.position.x,
                y: primaryBase.position.y,
                z: primaryBase.position.z,
                ease: "power2.inOut",
                duration: 1.4,
            }, 0.4);
            tl.to(primary.scale, {
                x: primaryBase.scale.x,
                y: primaryBase.scale.y,
                ease: "power2.inOut",
                duration: 1.4,
            }, 0.4);
            tl.to(primaryMat, {
                opacity: primaryBase.opacity,
                ease: "power2.inOut",
                duration: 1.4,
            }, 0.4);

            // Optional secondary highlight closer to the end of the scroll
            if (secondary) {
                const secondaryMat = secondary.material as THREE.MeshBasicMaterial;
                const secondaryBase = {
                    position: (secondary.userData.basePosition as THREE.Vector3).clone(),
                    scale: (secondary.userData.baseScale as THREE.Vector3).clone(),
                    opacity: secondary.userData.baseOpacity as number,
                };
                secondary.userData.isHighlight = true;

                tl.to(secondary.position, {
                    x: 0.5,
                    y: -0.25,
                    z: 1.8,
                    ease: "power3.out",
                    duration: 1.4,
                }, 0.7);
                tl.to(secondary.scale, {
                    x: secondaryBase.scale.x * 1.3,
                    y: secondaryBase.scale.y * 1.3,
                    ease: "power3.out",
                    duration: 1.4,
                }, 0.7);
                tl.to(secondaryMat, {
                    opacity: 0.95,
                    ease: "power3.out",
                    duration: 1.4,
                }, 0.7);

                tl.to(secondary.position, {
                    x: secondaryBase.position.x,
                    y: secondaryBase.position.y,
                    z: secondaryBase.position.z,
                    ease: "power2.inOut",
                    duration: 1.4,
                }, 1.4);
                tl.to(secondary.scale, {
                    x: secondaryBase.scale.x,
                    y: secondaryBase.scale.y,
                    ease: "power2.inOut",
                    duration: 1.4,
                }, 1.4);
                tl.to(secondaryMat, {
                    opacity: secondaryBase.opacity,
                    ease: "power2.inOut",
                    duration: 1.4,
                }, 1.4);
            }

            if (tl.scrollTrigger) {
                triggers.push(tl.scrollTrigger as ScrollTrigger);
            }
        };

        // Only pin and drive the camera on larger screens to keep
        // mobile behavior simpler and avoid long blank sections.
        if (!isMobile) {
            const cameraTrigger = ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: 1,
                onUpdate: (self) => {
                    const progress = self.progress;
                    // More dramatic fly-through
                    camera.position.z = 12 - (progress * 20);
                    // Subtle downward motion so shapes stay in view near the end
                    camera.position.y = gsap.utils.interpolate(0, -2.0, progress);
                    camera.rotation.z = progress * 0.2;

                    // Optional: Modify fog density based on scroll
                }
            });
            triggers.push(cameraTrigger);
        }

        if (canvasRef.current) {
            gsap.set(canvasRef.current, { autoAlpha: 1 });
        }

        const visibilityTrigger = ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            onEnter: () => {
                if (canvasRef.current) {
                    gsap.to(canvasRef.current, { autoAlpha: 1, duration: 0.2 });
                    canvasRef.current.style.pointerEvents = "auto";
                }
            },
            onEnterBack: () => {
                if (canvasRef.current) {
                    gsap.to(canvasRef.current, { autoAlpha: 1, duration: 0.2 });
                    canvasRef.current.style.pointerEvents = "auto";
                }
            },
            onLeave: () => {
                if (canvasRef.current) {
                    gsap.to(canvasRef.current, { autoAlpha: 0, duration: 0.2 });
                    canvasRef.current.style.pointerEvents = "none";
                }
            },
            onLeaveBack: () => {
                if (canvasRef.current) {
                    gsap.to(canvasRef.current, { autoAlpha: 0, duration: 0.2 });
                    canvasRef.current.style.pointerEvents = "none";
                }
            },
        });
        triggers.push(visibilityTrigger);

        // Animate only the main headline lines, not every span
        const spans = contentRef.current?.querySelectorAll("[data-animate='headline']");
        spans?.forEach((span) => {
            const spanTrigger = ScrollTrigger.create({
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
            triggers.push(spanTrigger);
        });

        const handleResize = () => {
            if (!canvasRef.current) return;
            const w = canvasRef.current.offsetWidth;
            const h = canvasRef.current.offsetHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h); // Use explicit width/height
            // Update pixel ratio on resize just in case (e.g. moving between screens)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (canvasRef.current) {
                canvasRef.current.removeEventListener("mousemove", handlePointerMove);
                canvasRef.current.removeEventListener("mousedown", handlePointerDown);
                canvasRef.current.removeEventListener("mouseup", releaseDrag);
                canvasRef.current.removeEventListener("mouseleave", releaseDrag);
                canvasRef.current.removeEventListener("click", handleClick);
                canvasRef.current.style.cursor = "default";
            }
            cancelAnimationFrame(frameId);
            triggers.forEach(t => t.kill());

            // Proper Three.js cleanup
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (object.material instanceof THREE.Material) {
                        object.material.dispose();
                    }
                }
            });

            renderer.dispose();
            if (canvasRef.current && canvasRef.current.contains(renderer.domElement)) {
                canvasRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

        return (
        <div ref={containerRef} className="relative min-h-[105vh] md:min-h-[125vh] overflow-hidden bg-gradient-to-b from-luxury-dark via-[#0a0a0a] to-luxury-dark border-t border-white/5">
            {/* Sticky Canvas Container */}
            <div
                ref={canvasRef}
                className="h-[100vh] w-full overflow-hidden md:sticky md:top-0"
                style={{ zIndex: 1 }}
            />

            {/* Text Content Overlay */}
            <div
                ref={contentRef}
                className="absolute inset-0 z-10 flex flex-col items-center justify-between pointer-events-none"
            >
                {/* Top label to avoid empty feeling at the start of the section */}
                <div className="w-full flex justify-center pt-8 px-6">
                    <p className="text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-white/40">
                        {t("home.floating.tagline")}
                    </p>
                </div>

                <div className="max-w-4xl px-4 sm:px-8 py-8 md:py-12 w-full">
                    <div className="pointer-events-auto bg-black/45 md:bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl px-6 sm:px-10 py-8 sm:py-10 space-y-8 md:space-y-10 text-center">
                        <p className="text-2xl sm:text-3xl md:text-5xl font-display font-bold leading-tight text-white/80 transition-all duration-300">
                            <span
                                data-animate="headline"
                                className="inline-block transition-all duration-300"
                            >
                                {t("home.floating.headline1")}
                            </span>
                        </p>

                        <p className="text-2xl sm:text-3xl md:text-5xl font-display font-bold leading-tight text-white/80 transition-all duration-300">
                            <span
                                data-animate="headline"
                                className="inline-block transition-all duration-300"
                            >
                                {t("home.floating.headline2")}
                            </span>
                        </p>

                        <p className="text-2xl sm:text-3xl md:text-5xl font-display font-bold leading-tight text-white/80 transition-all duration-300">
                            <span
                                data-animate="headline"
                                className="inline-block transition-all duration-300"
                            >
                                {t("home.floating.headline3")}
                            </span>
                        </p>

                        <p className="text-2xl sm:text-3xl md:text-5xl font-display font-bold leading-tight text-white/80 transition-all duration-300">
                            <span
                                data-animate="headline"
                                className="inline-block transition-all duration-300"
                            >
                                {t("home.floating.headline4")}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Bottom helper line so the final part of the scroll still has copy */}
                <div className="w-full flex justify-center px-6 pb-8 -mt-6">
                    <p className="text-base md:text-lg font-medium text-white/70">
                        {t("home.floating.scroll")}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FloatingShapes;
