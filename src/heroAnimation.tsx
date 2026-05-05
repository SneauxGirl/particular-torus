import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Object3D } from "three";

export default function HeroAnimation() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tubularSegments = 150;
  const radialSegments = 32;
  const particleCount = tubularSegments * radialSegments;

  const { dummy } = useMemo(() => {
    const dummy = new Object3D();
    return { dummy };
  }, []);

  const center = useMemo(() => new THREE.Vector3(), []);
  const ahead = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);
  const binormal = useMemo(() => new THREE.Vector3(), []);
  const point = useMemo(() => new THREE.Vector3(), []);
  const upY = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const upX = useMemo(() => new THREE.Vector3(1, 0, 0), []);

  const knotPoint = (
    target: THREE.Vector3,
    t: number,
    p: number,
    q: number,
    majorRadius: number,
    minorRadius: number
  ) => {
    const cosQt = Math.cos(q * t);
    const sinQt = Math.sin(q * t);
    const cosPt = Math.cos(p * t);
    const sinPt = Math.sin(p * t);
    const radial = majorRadius + minorRadius * cosQt;
    target.set(
      radial * cosPt,
      radial * sinPt,
      minorRadius * sinQt
    );
  };

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const elapsed = clock.getElapsedTime();
    const p = 2;
    const q = 3;
    const majorRadius = 1.4;
    const minorRadius = 0.66;
    const tubeRadius = 0.62;
    const flowSpeed = elapsed * 0.032;
    const strandPitch = 0.34;
    const vSpin = elapsed * 0.028;
    const forwardOffset = 0.01;

    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const index = i * radialSegments + j;
        const row = j / radialSegments;
        const baseU = i / tubularSegments;
        const wrappedU = ((baseU - flowSpeed + row * strandPitch) % 1 + 1) % 1;
        const t = wrappedU * Math.PI * 2;

        knotPoint(center, t, p, q, majorRadius, minorRadius);
        knotPoint(ahead, t + forwardOffset, p, q, majorRadius, minorRadius);

        tangent.subVectors(ahead, center).normalize();
        const up = Math.abs(tangent.y) < 0.98 ? upY : upX;
        normal.crossVectors(tangent, up).normalize();
        binormal.crossVectors(tangent, normal).normalize();

        const v = row * Math.PI * 2 + vSpin;
        point
          .copy(center)
          .addScaledVector(normal, Math.cos(v) * tubeRadius)
          .addScaledVector(binormal, Math.sin(v) * tubeRadius);

        dummy.position.copy(point);
        dummy.scale.setScalar(0.88);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.rotation.y += delta * 0.007;
    mesh.rotation.x = Math.sin(elapsed * 0.08) * 0.016;
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