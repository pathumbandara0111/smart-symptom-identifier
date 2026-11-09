"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  originX: number;
  originY: number;
  originZ: number;
}

export function ThreeStarfield() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Exclude doctor locator map page per requirement
  const isExcluded = pathname === "/doctor-locator" || pathname?.startsWith("/doctor-locator");

  useEffect(() => {
    if (isExcluded) return;
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1200);
    camera.position.z = 400;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent canvas on top of deep-black css body
    container.appendChild(renderer.domElement);

    // Visible bounds at z = 0
    const calcFrustum = () => {
      const vHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const vWidth = vHeight * camera.aspect;
      return { vWidth, vHeight };
    };

    let { vWidth, vHeight } = calcFrustum();

    // Create circular glowing star texture
    const createStarTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(224, 247, 255, 1)");
      grad.addColorStop(0.25, "rgba(0, 207, 232, 0.9)");
      grad.addColorStop(0.65, "rgba(0, 119, 182, 0.4)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    const starTexture = createStarTexture();

    // Particles Data
    const PARTICLE_COUNT = Math.min(220, Math.floor((width * height) / 5000));
    const particles: Particle[] = [];
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    const color1 = new THREE.Color(0x00cfe8); // Vibrant cyan
    const color2 = new THREE.Color(0x90e0ef); // Soft cyan
    const color3 = new THREE.Color(0xffffff); // Pure white star

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * vWidth * 1.3;
      const y = (Math.random() - 0.5) * vHeight * 1.3;
      const z = (Math.random() - 0.5) * 240;

      particles.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.15,
        originX: x,
        originY: y,
        originZ: z,
      });

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const randColor = Math.random();
      const c = randColor > 0.6 ? color3 : randColor > 0.3 ? color1 : color2;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 5.5,
      map: starTexture ?? undefined,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // Dynamic Constellation Lines
    const MAX_LINE_CONNECTIONS = 600;
    const linePositions = new Float32Array(MAX_LINE_CONNECTIONS * 6); // 2 points * 3 coords
    const lineColors = new Float32Array(MAX_LINE_CONNECTIONS * 6);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // Mouse tracking
    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouse.active = true;
      // Convert to normalized device coords
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      // Project to world space at z = 0
      mouse.targetX = (nx * vWidth) / 2;
      mouse.targetY = (ny * vHeight) / 2;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    // Window Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      const updated = calcFrustum();
      vWidth = updated.vWidth;
      vHeight = updated.vHeight;
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let isRunning = true;

    const handleVisibilityChange = () => {
      isRunning = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const STAR_CONNECT_DIST = 70;
    const MOUSE_CONNECT_DIST = 120;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isRunning) return;

      // Smooth mouse interpolation
      if (mouse.active) {
        if (mouse.x === -9999) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.15;
          mouse.y += (mouse.targetY - mouse.y) * 0.15;
        }
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }

      // Update particle positions
      const posAttr = starGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      const halfW = (vWidth * 1.3) / 2;
      const halfH = (vHeight * 1.3) / 2;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          // Wrap edges smoothly
          if (p.x < -halfW) p.x = halfW;
          if (p.x > halfW) p.x = -halfW;
          if (p.y < -halfH) p.y = halfH;
          if (p.y > halfH) p.y = -halfH;
          if (p.z < -120) p.z = 120;
          if (p.z > 120) p.z = -120;

          // Mouse gravity / attraction effect
          if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < MOUSE_CONNECT_DIST && dist > 1) {
              const force = (1 - dist / MOUSE_CONNECT_DIST) * 0.35;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }
        }

        posArray[i * 3] = p.x;
        posArray[i * 3 + 1] = p.y;
        posArray[i * 3 + 2] = p.z;
      }
      posAttr.needsUpdate = true;

      // Connect lines
      let lineIndex = 0;
      const linePosAttr = lineGeometry.attributes.position as THREE.BufferAttribute;
      const lineColAttr = lineGeometry.attributes.color as THREE.BufferAttribute;
      const linePos = linePosAttr.array as Float32Array;
      const lineCol = lineColAttr.array as Float32Array;

      // 1. Particle-to-particle connections
      for (let i = 0; i < PARTICLE_COUNT && lineIndex < MAX_LINE_CONNECTIONS - 50; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT && lineIndex < MAX_LINE_CONNECTIONS - 50; j++) {
          const pi = particles[i];
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dz = pi.z - pj.z;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < STAR_CONNECT_DIST * STAR_CONNECT_DIST) {
            const alpha = 1 - Math.sqrt(distSq) / STAR_CONNECT_DIST;

            // Point 1
            linePos[lineIndex * 6] = pi.x;
            linePos[lineIndex * 6 + 1] = pi.y;
            linePos[lineIndex * 6 + 2] = pi.z;

            lineCol[lineIndex * 6] = 0.0;
            lineCol[lineIndex * 6 + 1] = 0.46 * alpha; // teal
            lineCol[lineIndex * 6 + 2] = 0.71 * alpha;

            // Point 2
            linePos[lineIndex * 6 + 3] = pj.x;
            linePos[lineIndex * 6 + 4] = pj.y;
            linePos[lineIndex * 6 + 5] = pj.z;

            lineCol[lineIndex * 6 + 3] = 0.0;
            lineCol[lineIndex * 6 + 4] = 0.46 * alpha;
            lineCol[lineIndex * 6 + 5] = 0.71 * alpha;

            lineIndex++;
          }
        }
      }

      // 2. Mouse-to-particle connections
      if (mouse.active && mouse.x !== -9999) {
        for (let i = 0; i < PARTICLE_COUNT && lineIndex < MAX_LINE_CONNECTIONS; i++) {
          const p = particles[i];
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dz = p.z; // mouse is at z = 0
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < MOUSE_CONNECT_DIST * MOUSE_CONNECT_DIST) {
            const alpha = (1 - Math.sqrt(distSq) / MOUSE_CONNECT_DIST) * 1.5;

            // Point 1 (particle)
            linePos[lineIndex * 6] = p.x;
            linePos[lineIndex * 6 + 1] = p.y;
            linePos[lineIndex * 6 + 2] = p.z;

            // Cyan glow towards cursor
            lineCol[lineIndex * 6] = 0.0 * alpha;
            lineCol[lineIndex * 6 + 1] = 0.81 * alpha;
            lineCol[lineIndex * 6 + 2] = 0.91 * alpha;

            // Point 2 (mouse)
            linePos[lineIndex * 6 + 3] = mouse.x;
            linePos[lineIndex * 6 + 4] = mouse.y;
            linePos[lineIndex * 6 + 5] = 0;

            lineCol[lineIndex * 6 + 3] = 0.56 * alpha;
            lineCol[lineIndex * 6 + 4] = 0.88 * alpha;
            lineCol[lineIndex * 6 + 5] = 1.0 * alpha;

            lineIndex++;
          }
        }
      }

      lineGeometry.setDrawRange(0, lineIndex * 2);
      linePosAttr.needsUpdate = true;
      lineColAttr.needsUpdate = true;

      // Subtle scene tilt following mouse
      if (mouse.active) {
        scene.rotation.y += ((mouse.x / vWidth) * 0.1 - scene.rotation.y) * 0.05;
        scene.rotation.x += ((-mouse.y / vHeight) * 0.1 - scene.rotation.x) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      starGeometry.dispose();
      starMaterial.dispose();
      starTexture?.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isExcluded]);

  if (isExcluded) return null;

  return (
    <div
      ref={containerRef}
      id="three-starfield"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
