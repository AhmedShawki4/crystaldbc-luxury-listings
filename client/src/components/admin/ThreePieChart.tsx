import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface PieSlice {
    label: string;
    value: number;
    color: string;
}

interface ThreePieChartProps {
    data: PieSlice[];
    height?: string;
}

const ThreePieChart = ({ data, height = "400px" }: ThreePieChartProps) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!mountRef.current) return;

        // SCENE SETUP
        const scene = new THREE.Scene();
        // Transparent background
        scene.background = null;

        // CAMERA
        const width = mountRef.current.clientWidth;
        const chartHeight = mountRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(45, width / chartHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);

        // RENDERER
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, chartHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // LIGHTING
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-5, 5, -5);
        scene.add(pointLight);

        // DATA PREP
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;
        const slices: THREE.Group[] = [];
        const group = new THREE.Group();

        data.forEach((item) => {
            if (item.value === 0) return;

            const sliceAngle = (item.value / total) * Math.PI * 2;

            // CREATE SHAPE
            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.arc(0, 0, 3, currentAngle, currentAngle + sliceAngle, false);
            shape.lineTo(0, 0);

            const extrudeSettings = {
                steps: 1,
                depth: 1, // Thickness of the pie
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.1,
                bevelSegments: 2,
            };

            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

            // Material
            const material = new THREE.MeshStandardMaterial({
                color: item.color,
                roughness: 0.3,
                metalness: 0.2,
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Center geometry to rotate properly (optional, but helps with positioning)
            // Actually, for a pie, we want the center at 0,0. 
            // The ExtrudeGeometry builds up in Z. We want it flat on XZ plane usually, 
            // but here we are looking from above-ish. Let's rotate -90 on X to lay flat.
            mesh.rotation.x = -Math.PI / 2;

            // Group for this slice to allow independent movement (like explosion effect)
            const sliceGroup = new THREE.Group();
            sliceGroup.add(mesh);
            sliceGroup.userData = { label: item.label, value: item.value, color: item.color };

            group.add(sliceGroup);
            slices.push(sliceGroup);

            currentAngle += sliceAngle;
        });

        // Center the whole pie
        // The extruded geometry starts at Z=0 and goes to Z=depth. 
        // We rotated it, so it sits on XZ plane, going down in Y. 
        // Let's center it vertically.
        group.position.y = 0.5;
        scene.add(group);

        // INTERACTION (RAYCASTER)
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseMove = (event: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / chartHeight) * 2 + 1;

            setTooltipPos({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            });
        };

        const canvas = renderer.domElement;
        canvas.addEventListener('mousemove', onMouseMove);

        // ANIMATION LOOP
        let requestID: number;
        const animate = () => {
            requestID = requestAnimationFrame(animate);

            // Rotation
            group.rotation.y += 0.002;

            // Raycasting
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(group.children, true);

            let found = false;
            if (intersects.length > 0) {
                // Traverse up to find the slice group
                let obj = intersects[0].object;
                while (obj.parent && obj.parent !== group) {
                    obj = obj.parent;
                }

                if (obj.userData && obj.userData.label) {
                    found = true;
                    if (hoveredSlice !== obj.userData.label) {
                        setHoveredSlice(obj.userData.label);
                        document.body.style.cursor = 'pointer';
                    }
                    // Scale up slightly or move out
                    obj.scale.setScalar(1.1);
                }
            }

            if (!found) {
                if (hoveredSlice) {
                    setHoveredSlice(null);
                    document.body.style.cursor = 'auto';
                }
            }

            // Reset scales of non-hovered
            slices.forEach(slice => {
                if (!found || slice.userData.label !== hoveredSlice) {
                    // Smoothly go back
                    slice.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                }
            });

            renderer.render(scene, camera);
        };

        animate();

        // RESIZE HANDLER
        const handleResize = () => {
            if (!mountRef.current) return;
            const newWidth = mountRef.current.clientWidth;
            const newHeight = mountRef.current.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(requestID);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            // Cleanup
            scene.clear();
            renderer.dispose();
        };
    }, [data]); // Re-run if data changes

    // Update hovered state in ref or just use state for DOM tooltip
    // We use state for tooltip rendering outside canvas

    return (
        <div className="relative w-full" style={{ height }}>
            <div ref={mountRef} className="w-full h-full" />

            {hoveredSlice && (
                <div
                    className="absolute z-10 pointer-events-none bg-slate-900/90 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md"
                    style={{
                        left: tooltipPos.x + 20,
                        top: tooltipPos.y - 20,
                    }}
                >
                    {data.map(d => {
                        if (d.label === hoveredSlice) {
                            return (
                                <div key={d.label}>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest">{d.label}</p>
                                    <p className="text-lg font-bold text-white">{d.value} <span className="text-xs font-normal text-slate-400">items</span></p>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            )}
        </div>
    );
};

export default ThreePieChart;
