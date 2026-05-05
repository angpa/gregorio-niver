"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// Access multi-band pulses from window
function getPulses() {
  const w = window as any;
  return {
    beat: w.__beatPulse || 0,
    bass: w.__bassPulse || 0,
    mid: w.__midPulse || 0,
    treble: w.__treblePulse || 0,
  };
}

/* =============================================
   1. ROTATING METAL RINGS (band-reactive)
   ============================================= */
function MetalRing({
  radius,
  count,
  color,
  speed,
  size,
  band, // 'bass' | 'mid' | 'treble'
  beatMultiplier,
  isMobile,
}: {
  radius: number;
  count: number;
  color: string;
  speed: number;
  size: number;
  band: "bass" | "mid" | "treble";
  beatMultiplier: number;
  isMobile: boolean;
}) {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const baseSize = size;

  const geometry = useMemo(() => {
    const actualCount = isMobile ? Math.floor(count * 0.4) : count;
    const pos = new Float32Array(actualCount * 3);
    for (let i = 0; i < actualCount; i++) {
      const angle = (i / actualCount) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 2.0; // Increased jitter for a "messier" metal look
      pos[i * 3] = Math.cos(angle) * (radius + jitter);
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = Math.sin(angle) * (radius + jitter);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [radius, count, isMobile]);

  useFrame((state) => {
    if (!ref.current) return;
    const pulses = getPulses();
    const bandValue = pulses[band];
    const beat = pulses.beat;

    // Faster, more aggressive rotation
    ref.current.rotation.y += speed + speed * bandValue * 6 + beat * 0.08;
    
    // Position bounce on bass (more intense)
    if (band === "bass") {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.5 + bandValue * 3;
    }

    // Scale pulse on band + beat
    const s = 1 + bandValue * 0.4 * beatMultiplier + beat * 0.2;
    ref.current.scale.set(s, s, s);

    // Size pulse on treble
    if (matRef.current) {
        if (band === "treble") {
            matRef.current.size = baseSize + pulses.treble * baseSize * 4;
        } else {
            matRef.current.size = baseSize + beat * baseSize * 2;
        }
        matRef.current.opacity = 0.4 + bandValue * 0.6 + beat * 0.3;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        ref={matRef}
        color={color}
        size={size}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* =============================================
   2. FLOATING METAL SHARDS
   ============================================= */
function MetalShards({ isMobile }: { isMobile: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const count = isMobile ? 100 : 500;

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 100;
      pos[i + 1] = (Math.random() - 0.5) * 100;
      pos[i + 2] = (Math.random() - 0.5) * 100;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const { bass, treble, beat } = getPulses();

    ref.current.rotation.y += 0.001 + bass * 0.01;
    ref.current.rotation.z += 0.0005 + treble * 0.015;

    if (matRef.current) {
      matRef.current.opacity = 0.2 + bass * 0.6 + beat * 0.3;
      matRef.current.size = (isMobile ? 0.15 : 0.08) + treble * 0.3 + beat * 0.15;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        ref={matRef}
        color="#FFFFFF"
        size={0.08}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* =============================================
   3. CENTRAL METAL RINGS (Heavy)
   ============================================= */
function CentralCoreRing({
  radiusT,
  tube,
  color,
  speed,
  rotAxis,
}: {
  radiusT: number;
  tube: number;
  color: string;
  speed: number;
  rotAxis: "x" | "y" | "z";
}) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const { bass, beat } = getPulses();

    ref.current.rotation[rotAxis] += speed + bass * 0.15 + beat * 0.1;

    const s = 1 + bass * 0.7 + beat * 0.3;
    ref.current.scale.set(s, s, s);

    if (matRef.current) {
      matRef.current.opacity = 0.1 + bass * 0.7 + beat * 0.3;
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radiusT, tube, 8, 60]} /> {/* More angular torus */}
      <meshBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0.3}
        wireframe
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* =============================================
   4. MAIN BACKGROUND COMPONENT
   ============================================= */
export default function MetalBackground({
  isMobile,
}: {
  isMobile?: boolean;
}) {
  const mobile = isMobile ?? false;

  return (
    <>
      <color attach="background" args={["#000000"]} />

      {/* Lightning Sparkles (Treble) */}
      <MetalRing
        radius={5}
        count={250}
        color="#00F2FF" // Electric Blue
        speed={0.008}
        size={mobile ? 0.12 : 0.06}
        band="treble"
        beatMultiplier={2.5}
        isMobile={mobile}
      />

      {/* Silver Shards (Mid) */}
      <MetalRing
        radius={9}
        count={300}
        color="#A5A9B4" // Silver
        speed={-0.005}
        size={mobile ? 0.15 : 0.08}
        band="mid"
        beatMultiplier={1.8}
        isMobile={mobile}
      />

      {/* Crimson Fury (Bass) */}
      <MetalRing
        radius={14}
        count={400}
        color="#FF0000" // Red
        speed={0.003}
        size={mobile ? 0.18 : 0.1}
        band="bass"
        beatMultiplier={2.2}
        isMobile={mobile}
      />

      {/* Deep Shadow (Mid) */}
      <MetalRing
        radius={20}
        count={350}
        color="#444444"
        speed={-0.002}
        size={mobile ? 0.1 : 0.05}
        band="mid"
        beatMultiplier={1.5}
        isMobile={mobile}
      />

      {/* Distant Lightning (Bass) */}
      <MetalRing
        radius={28}
        count={500}
        color="#00F2FF"
        speed={0.001}
        size={0.06}
        band="bass"
        beatMultiplier={1.2}
        isMobile={mobile}
      />

      {/* Heavy central rings */}
      {!mobile && (
        <>
          <CentralCoreRing radiusT={4} tube={0.05} color="#FF0000" speed={0.01} rotAxis="y" />
          <CentralCoreRing radiusT={4.5} tube={0.03} color="#FFFFFF" speed={-0.008} rotAxis="z" />
          <CentralCoreRing radiusT={7} tube={0.02} color="#00F2FF" speed={0.004} rotAxis="x" />
        </>
      )}

      {/* Floating shards */}
      <MetalShards isMobile={mobile} />

      {!mobile && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.15} intensity={2.5} radius={0.4} />
        </EffectComposer>
      )}
    </>
  );
}
