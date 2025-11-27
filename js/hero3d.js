/**
 * Hero 3D Scene - Interactive Blob Shapes with Three.js
 * Organic 3D composition with floating, morphing blobs and mouse interaction
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class Hero3DScene {
    constructor() {
        // Check if mobile/tablet - skip initialization
        if (window.innerWidth <= 834) return;

        this.canvas = document.getElementById('hero3d');
        if (!this.canvas) return;

        // Check WebGL support
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
        if (!gl) {
            document.body.classList.add('no-webgl');
            console.warn('WebGL not supported, using fallback');
            return;
        }

        // Scene properties
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.blobs = [];
        this.particles = [];
        this.mouse = new THREE.Vector2();
        this.targetMouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        // Animation properties
        this.clock = new THREE.Clock();
        this.time = 0;

        // Colors from brand palette
        this.colors = {
            black: 0x0A0A0A,
            magenta: 0xB8458D,
            orange: 0xFF6B35,
            darkMagenta: 0x9A3675
        };

        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.createBlobs();
        this.createParticles();
        this.setupPostProcessing();
        this.setupEventListeners();
        this.animate();

        // Mark canvas as active for CSS selectors
        this.canvas.classList.add('webgl-active');
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent background
    }

    setupCamera() {
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 8);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });

        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Main directional light with magenta tint
        const mainLight = new THREE.DirectionalLight(this.colors.magenta, 0.8);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);

        // Orange accent spotlight
        const accentLight = new THREE.SpotLight(this.colors.orange, 0.6);
        accentLight.position.set(-5, 3, 3);
        accentLight.angle = Math.PI / 6;
        accentLight.penumbra = 0.5;
        this.scene.add(accentLight);

        // Rim light for depth
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(-3, -2, -5);
        this.scene.add(rimLight);
    }

    createBlobGeometry(complexity = 3) {
        // Create icosahedron as base
        const geometry = new THREE.IcosahedronGeometry(1, complexity);
        const positionAttribute = geometry.getAttribute('position');

        // Apply Perlin-like noise to vertices for organic shape
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);

            // Simple pseudo-random noise based on position
            const noise = Math.sin(x * 2.5 + y * 1.8) *
                         Math.cos(y * 2.2 + z * 1.5) *
                         Math.sin(z * 2.8 + x * 1.3) * 0.15;

            const scale = 1 + noise;
            positionAttribute.setXYZ(i, x * scale, y * scale, z * scale);
        }

        positionAttribute.needsUpdate = true;
        geometry.computeVertexNormals();

        return geometry;
    }

    createBlobMaterial(colorStart, colorEnd, transmission = 0.4) {
        return new THREE.MeshPhysicalMaterial({
            color: colorStart,
            metalness: 0.3,
            roughness: 0.2,
            transmission: transmission,
            thickness: 0.5,
            clearcoat: 0.5,
            clearcoatRoughness: 0.3,
            envMapIntensity: 1.5,
            side: THREE.DoubleSide
        });
    }

    createBlobs() {
        const blobConfigs = [
            // Main large blob - center-right
            {
                position: [1.5, 0.3, 0],
                scale: 1.8,
                color: this.colors.magenta,
                complexity: 4,
                transmission: 0.5,
                speed: 0.3
            },
            // Secondary blob - top-left
            {
                position: [-1.2, 1.8, -0.5],
                scale: 1.2,
                color: this.colors.orange,
                complexity: 3,
                transmission: 0.4,
                speed: 0.4
            },
            // Third blob - bottom-right
            {
                position: [2, -1.5, 0.3],
                scale: 1.0,
                color: this.colors.darkMagenta,
                complexity: 3,
                transmission: 0.3,
                speed: 0.35
            },
            // Small accent blob - mid-left
            {
                position: [-0.8, -0.5, 0.8],
                scale: 0.7,
                color: this.colors.orange,
                complexity: 2,
                transmission: 0.6,
                speed: 0.5
            },
            // Tiny detail blob
            {
                position: [0.5, 1.5, -0.3],
                scale: 0.5,
                color: this.colors.magenta,
                complexity: 2,
                transmission: 0.5,
                speed: 0.45
            }
        ];

        blobConfigs.forEach((config, index) => {
            const geometry = this.createBlobGeometry(config.complexity);
            const material = this.createBlobMaterial(
                config.color,
                config.color,
                config.transmission
            );

            const blob = new THREE.Mesh(geometry, material);
            blob.position.set(...config.position);
            blob.scale.setScalar(config.scale);

            // Store animation properties
            blob.userData = {
                originalPosition: blob.position.clone(),
                originalScale: config.scale,
                speed: config.speed,
                phase: Math.random() * Math.PI * 2,
                morphSpeed: 0.2 + Math.random() * 0.3,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.001,
                    y: (Math.random() - 0.5) * 0.002,
                    z: (Math.random() - 0.5) * 0.001
                },
                originalVertices: []
            };

            // Store original vertex positions for morphing
            const posAttr = geometry.getAttribute('position');
            for (let i = 0; i < posAttr.count; i++) {
                blob.userData.originalVertices.push(
                    new THREE.Vector3(
                        posAttr.getX(i),
                        posAttr.getY(i),
                        posAttr.getZ(i)
                    )
                );
            }

            this.scene.add(blob);
            this.blobs.push(blob);
        });
    }

    createParticles() {
        const particleCount = 30;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 8;
            positions[i3 + 1] = (Math.random() - 0.5) * 8;
            positions[i3 + 2] = (Math.random() - 0.5) * 4;

            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.01
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: this.colors.orange,
            size: 0.05,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData.velocities = velocities;
        this.scene.add(particles);
        this.particles.push(particles);
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Subtle bloom effect
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.4,  // strength
            0.6,  // radius
            0.5   // threshold
        );
        this.composer.addPass(bloomPass);
    }

    setupEventListeners() {
        // Mouse move
        window.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });

        // Resize
        window.addEventListener('resize', () => this.onResize(), { passive: true });

        // Reduce motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
            this.reduceMotion = true;
        }
    }

    onMouseMove(event) {
        // Normalize mouse position to -1 to 1
        const rect = this.canvas.getBoundingClientRect();
        this.targetMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.targetMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    onResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    animateBlobs() {
        this.blobs.forEach((blob, index) => {
            const userData = blob.userData;

            // Floating animation
            const floatY = Math.sin(this.time * userData.speed + userData.phase) * 0.3;
            const floatX = Math.cos(this.time * userData.speed * 0.7 + userData.phase) * 0.15;

            blob.position.x = userData.originalPosition.x + floatX;
            blob.position.y = userData.originalPosition.y + floatY;

            // Continuous rotation
            blob.rotation.x += userData.rotationSpeed.x;
            blob.rotation.y += userData.rotationSpeed.y;
            blob.rotation.z += userData.rotationSpeed.z;

            // Subtle scale pulsing
            const scalePulse = 1 + Math.sin(this.time * 0.5 + userData.phase) * 0.03;
            blob.scale.setScalar(userData.originalScale * scalePulse);

            // Organic morphing
            const geometry = blob.geometry;
            const positionAttribute = geometry.getAttribute('position');

            for (let i = 0; i < userData.originalVertices.length; i++) {
                const originalVertex = userData.originalVertices[i];

                // Apply time-based noise for morphing
                const morphAmount = Math.sin(
                    this.time * userData.morphSpeed +
                    originalVertex.x * 2 +
                    originalVertex.y * 1.5 +
                    i * 0.1
                ) * 0.08;

                const x = originalVertex.x * (1 + morphAmount);
                const y = originalVertex.y * (1 + morphAmount);
                const z = originalVertex.z * (1 + morphAmount);

                positionAttribute.setXYZ(i, x, y, z);
            }

            positionAttribute.needsUpdate = true;
            geometry.computeVertexNormals();
        });
    }

    animateMouseInteraction() {
        // Smooth mouse following
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Apply trail effect to nearby blobs
        this.blobs.forEach(blob => {
            const distance = blob.position.distanceTo(
                new THREE.Vector3(this.mouse.x * 2, this.mouse.y * 2, blob.position.z)
            );

            if (distance < 3) {
                // Pull blob slightly toward mouse
                const pullStrength = (3 - distance) / 3 * 0.15;
                const direction = new THREE.Vector3(
                    this.mouse.x * 3 - blob.position.x,
                    this.mouse.y * 3 - blob.position.y,
                    0
                ).normalize();

                blob.position.x += direction.x * pullStrength;
                blob.position.y += direction.y * pullStrength;

                // Add slight rotation based on mouse velocity
                const mouseDelta = Math.abs(this.targetMouse.x - this.mouse.x) +
                                  Math.abs(this.targetMouse.y - this.mouse.y);
                blob.rotation.z += mouseDelta * 0.1;
            }
        });
    }

    animateParticles() {
        this.particles.forEach(particleSystem => {
            const positions = particleSystem.geometry.getAttribute('position');
            const velocities = particleSystem.userData.velocities;

            for (let i = 0; i < velocities.length; i++) {
                const i3 = i * 3;

                positions.array[i3] += velocities[i].x;
                positions.array[i3 + 1] += velocities[i].y;
                positions.array[i3 + 2] += velocities[i].z;

                // Wrap around bounds
                if (Math.abs(positions.array[i3]) > 4) {
                    positions.array[i3] *= -1;
                }
                if (Math.abs(positions.array[i3 + 1]) > 4) {
                    positions.array[i3 + 1] *= -1;
                }
                if (Math.abs(positions.array[i3 + 2]) > 2) {
                    positions.array[i3 + 2] *= -1;
                }
            }

            positions.needsUpdate = true;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        this.time += delta;

        if (!this.reduceMotion) {
            this.animateBlobs();
            this.animateMouseInteraction();
            this.animateParticles();
        }

        // Render
        this.composer.render();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Hero3DScene();
    });
} else {
    new Hero3DScene();
}
