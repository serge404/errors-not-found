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
    const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
    material.opacity = 0.2;
    const count = 500;
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

    function animate() {
      requestAnimationFrame(animate);
      instancedMesh.rotation.y += 0.01;
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
      window.removeEventListener("resize", () => {});
    };
  }, []);

  return <div ref={containerRef} style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }} />;
}
