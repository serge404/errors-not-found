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
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(0.2, 16, 16);

    const count = 100;

    // Create and assign per-instance offsets
    const offsets = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      offsets[i * 3 + 0] = Math.random() * 10 - 5;
      offsets[i * 3 + 1] = Math.random() * 10 - 5;
      offsets[i * 3 + 2] = Math.random() * 10 - 5;
    }
    geometry.setAttribute(
      "instanceOffset",
      new THREE.InstancedBufferAttribute(offsets, 3)
    );

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        uniform float time;
        attribute vec3 instanceOffset;
        varying vec3 vPosition;

        void main() {
          vPosition = position;

          vec3 glitchPos = position + instanceOffset;

          // Add animated glitch movement
          glitchPos.x += sin(instanceOffset.y * 4.0 + time * 0.8) * 0.5;
          glitchPos.y += cos(instanceOffset.x * 5.0 + time * 0.6) * 0.5;
          glitchPos.z += sin(instanceOffset.z * 3.0 + time * 0.7) * 0.5;

          vec4 mvPosition = modelViewMatrix * vec4(glitchPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;

        void main() {
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.75));
          float brightness = 1.0 - length(vPosition) * 0.2;
          vec3 color = vec3(0.4, 1.0, 0.85) * brightness; // brighter teal
          
          gl_FragColor = vec4(color, 0.6); // stronger opacity
        }
      `,
      transparent: true,
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

    // Still needed for frustum culling and matrix updates
    for (let i = 0; i < count; i++) {
      const matrix = new THREE.Matrix4();
      matrix.setPosition(0, 0, 0); // no extra offset — we use instanceOffset instead
      instancedMesh.setMatrixAt(i, matrix);
    }

    scene.add(instancedMesh);

    const startTime = Date.now();

    function animate() {
      const elapsed = (Date.now() - startTime) / 1000;
      material.uniforms.time.value = elapsed;

      requestAnimationFrame(animate);
      instancedMesh.rotation.x += 0.0008;
      instancedMesh.rotation.y += 0.0008;
      instancedMesh.rotation.z += 0.0008;

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      renderer.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }}
    />
  );
}
