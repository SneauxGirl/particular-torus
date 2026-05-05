import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import HeroAnimation from "./heroAnimation";

export default function App() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 5, 5]} intensity={1.8} />
        <pointLight position={[0, 0, 7]} intensity={1} />
        <Environment preset="studio" />
        <HeroAnimation />
      </Canvas>
    </div>
  );
}