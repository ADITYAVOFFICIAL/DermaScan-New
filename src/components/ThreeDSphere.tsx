// src/components/ThreeDSphere.tsx
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";

const ThreeDSphere = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const animationFrameId = useRef<number | null>(null); // To store animation frame ID for cleanup

    useEffect(() => {
        const currentContainer = containerRef.current; // Capture ref value
        if (!currentContainer) return;

        // --- Check for valid dimensions ---
        const width = currentContainer.clientWidth;
        const height = currentContainer.clientHeight;

        if (width === 0 || height === 0) {
            console.warn("ThreeDSphere container dimensions are zero on mount.");
            // Optionally, you could add a ResizeObserver here to retry setup when size becomes available
            return; // Don't initialize if dimensions are invalid
        }
        // --- ---

        // Setup scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Setup camera
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height, // Use initial valid dimensions
            0.1,
            1000
        );
        camera.position.z = 4; // Slightly closer
        cameraRef.current = camera;

        // Setup renderer
        const renderer = new THREE.WebGLRenderer({
            alpha: true, // For transparent background
            antialias: true
        });
        renderer.setSize(width, height); // Use initial valid dimensions
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for pixel density
        renderer.setClearColor(0x000000, 0); // Transparent background

        // --- Explicitly style the canvas ---
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        // --- ---

        currentContainer.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(1.8, 64, 64); // Increased segments for smoothness

        // Create custom material
        const material = new THREE.MeshStandardMaterial({ // Use StandardMaterial for better PBR properties
            color: 0x3b82f6,       // Base color (blue)
            metalness: 0.3,        // Slightly metallic
            roughness: 0.6,        // Moderately rough surface
            emissive: 0x0c4a6e,    // Dark blue glow
            transparent: true,
            opacity: 0.85,
        });

        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x60a5fa, 0.5); // Softer blue ambient light
        scene.add(ambientLight);

        // Add directional light for better definition
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Add subtle wireframe overlay (optional aesthetic)
        const wireframeGeometry = new THREE.SphereGeometry(1.85, 32, 32); // Slightly larger
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x93c5fd,    // Light blue
            wireframe: true,
            transparent: true,
            opacity: 0.15       // More subtle
        });
        const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        scene.add(wireframe);

        // Animation
        let mouseX = 0, mouseY = 0;
        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const clock = new THREE.Clock(); // Use clock for smoother animation

        const animate = () => {
            animationFrameId.current = requestAnimationFrame(animate); // Store frame ID

            const elapsedTime = clock.getElapsedTime();

            // Subtle automatic rotation
            sphere.rotation.y = elapsedTime * 0.1;
            wireframe.rotation.y = elapsedTime * 0.05;

            // Mouse interaction - subtle movement
            const targetRotationX = mouseY * 0.1;
            const targetRotationY = mouseX * 0.1;
            sphere.rotation.x += (targetRotationX - sphere.rotation.x) * 0.05;
            sphere.rotation.y += (targetRotationY - sphere.rotation.y) * 0.05 + elapsedTime * 0.05; // Combine auto + mouse
            wireframe.rotation.x = sphere.rotation.x * 0.8; // Wireframe follows slightly differently
            wireframe.rotation.y = sphere.rotation.y * 0.8;


            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            // Use current dimensions from the ref container
            const currentWidth = currentContainer?.clientWidth ?? 0;
            const currentHeight = currentContainer?.clientHeight ?? 0;

            if (currentWidth > 0 && currentHeight > 0 && camera && renderer) {
                camera.aspect = currentWidth / currentHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(currentWidth, currentHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current); // Cancel animation frame
            }
            if (currentContainer && renderer.domElement) {
                currentContainer.removeChild(renderer.domElement); // Remove canvas
            }
            // Dispose Three.js objects
            geometry.dispose();
            material.dispose();
            wireframeGeometry.dispose();
            wireframeMaterial.dispose();
            renderer.dispose(); // Dispose renderer resources
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;
        };
    }, []); // Empty dependency array ensures this runs once on mount

    return (
        <motion.div
            ref={containerRef}
            // Set explicit height here, width should be handled by parent container
            className="w-full h-full" // Make it fill the absolute positioned container
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
        />
    );
};

export default ThreeDSphere;