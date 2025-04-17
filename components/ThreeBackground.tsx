// components/ThreeBackground.tsx
'use client';

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        uniform float time;
        varying vec3 vPosition;

        void main() {
          vPosition = position;

          vec3 glitchPos = position;

          // Add wiggly movement over time
          glitchPos.x += sin(position.y * 4.0 + time * 0.8) * 0.5;
          glitchPos.y += cos(position.x * 5.0 + time * 0.6) * 0.5;
          glitchPos.z += sin(position.z * 3.0 + time * 0.7) * 0.5;

          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(glitchPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vPosition;

        void main() {
          vec3 color = vec3(0.26, 0.67, 0.53); // Green
          gl_FragColor = vec4(color, 1.0); // Set alpha to 0.2 for transparency
        }
      `,
      transparent: true,
    });

    const count = 125;
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

    for (let i = 0; i < count; i++) {
      const matrix = new THREE.Matrix4();
      const x = Math.random() * 10 - 5;
      const y = Math.random() * 10 - 5;
      const z = Math.random() * 10 - 5;
      matrix.setPosition(x, y, z);
      instancedMesh.setMatrixAt(i, matrix);
    }

    scene.add(instancedMesh);

    const startTime = Date.now();
    function animate() {
      const elapsed = (Date.now() - startTime) / 1000;
      material.uniforms.time.value = elapsed;

      requestAnimationFrame(animate);
      instancedMesh.rotation.y += 0.002;
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    return () => {
      renderer.dispose();
      window.removeEventListener("resize", () => { });
    };
  }, []);

  return <div ref={containerRef} style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }} />;
}
