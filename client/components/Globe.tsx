import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";

export interface GlobeLocation {
  id: string;
  name: string;
  lat: number; // degrees
  lon: number; // degrees
}

interface GlobeProps {
  locations: GlobeLocation[];
  onSelect?: (id: string) => void;
  selectedId?: string;
  onAddPin?: (lat: number, lon: number) => void;
}

function latLonToXYZ(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

function GlobeInner({ locations, onSelect, selectedId, onAddPin }: GlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pinRefs = useRef<Record<string, THREE.Mesh>>({});
  const radius = 1.2;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.08;
  });

  const pins = useMemo(() => {
    return locations.map((loc) => {
      const pos = latLonToXYZ(loc.lat, loc.lon, radius + 0.02);
      return { ...loc, pos };
    });
  }, [locations]);

  return (
    <group ref={groupRef}>
      {/* Globe sphere */}
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* White wireframe overlay for outlines */}
      <mesh>
        <sphereGeometry args={[radius + 0.001, 32, 32]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Equator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius + 0.002, 0.005, 8, 128]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Subtle longitudes/latitudes grid */}
      <gridHelper args={[radius * 2.4, 24, "#ffffff22", "#ffffff14"]} position={[0, -radius, 0]} />

      {/* Pins */}
      {pins.map((p) => (
        <mesh
          key={p.id}
          ref={(el) => {
            if (el) pinRefs.current[p.id] = el;
          }}
          position={p.pos}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(p.id);
            const m = pinRefs.current[p.id];
            if (m) {
              gsap.to(m.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.2, yoyo: true, repeat: 1 });
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            const m = pinRefs.current[p.id];
            if (m) gsap.to(m.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.2 });
          }}
          onPointerOut={() => {
            const m = pinRefs.current[p.id];
            if (m) gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
          }}
        >
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color={selectedId === p.id ? "#00BFFF" : "#5CD6FF"} emissive="#00BFFF" emissiveIntensity={selectedId === p.id ? 0.6 : 0.15} />
        </mesh>
      ))}

      {/* Click-catcher sphere for adding pins */}
      {onAddPin && (
        <mesh
          onDoubleClick={(e) => {
            e.stopPropagation();
            const pointWorld = e.point.clone();
            const pointLocal = pointWorld.clone();
            if (groupRef.current) groupRef.current.worldToLocal(pointLocal);
            const v = pointLocal.clone().normalize();
            const r = v.length();
            const phi = Math.acos(v.y / r);
            const theta = Math.atan2(v.z, -v.x);
            const lat = 90 - (phi * 180) / Math.PI;
            const lon = (theta * 180) / Math.PI - 180;
            onAddPin(lat, lon);
          }}
        >
          <sphereGeometry args={[radius + 0.03, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight intensity={0.8} position={[3, 3, 2]} />
    </group>
  );
}

export default function Globe(props: GlobeProps) {
  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} dpr={[1, 2]}>
      <GlobeInner {...props} />
      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.6} />
    </Canvas>
  );
}


