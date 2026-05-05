import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Object3D } from "three";

export default function HeroAnimation() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tubularSegments = 140;
  const radialSegments = 18;
  const particleCount = tubularSegments * radialSegments;

  const { dummy } = useMemo(() => {
    const dummy = new Object3D();
    return { dummy };
  }, []);

  const position = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const elapsed = clock.getElapsedTime();
    const stripRadius = 2.4;
    const stripWidth = 0.95;
    const uShift = elapsed * 0.42;
    const wave = Math.sin(elapsed * 0.9) * 0.06;

    for (let i = 0; i < tubularSegments; i++) {
      const u = (i / tubularSegments) * Math.PI * 2 + uShift;

      for (let j = 0; j < radialSegments; j++) {
        const index = i * radialSegments + j;
        const widthT = j / (radialSegments - 1);
        const v = (widthT - 0.5) * 2 * stripWidth;
        const animatedV = v + wave * Math.sin(u + widthT * Math.PI);
        const r = stripRadius + animatedV * Math.cos(u * 0.5);

        position.set(
          r * Math.cos(u),
          r * Math.sin(u),
          animatedV * Math.sin(u * 0.5)
        );

        dummy.position.copy(position);
        dummy.scale.setScalar(0.88);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.rotation.y += delta * 0.08;
    mesh.rotation.x = Math.sin(elapsed * 0.24) * 0.1;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[0.065, 8, 8]} />
      <meshStandardMaterial
        color="#EBEBFF"
        metalness={1}
        roughness={0.05}
        envMapIntensity={2.2}
      />
    </instancedMesh>
  );
}