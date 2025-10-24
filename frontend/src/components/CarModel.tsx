import React, { useRef, useState } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CarModelProps {
  position?: [number, number, number];
  scale?: number;
}

const CarModel: React.FC<CarModelProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  const modelRef = useRef<THREE.Object3D>(null);
  const [error, setError] = useState<string | null>(null);

  // โหลดโมเดล
  let scene: THREE.Object3D;
  try {
    const gltf = useGLTF('/models/lamborghini_veneno_2013_3d_model/scene.gltf');
    scene = gltf.scene;
  } catch (err) {
    setError('Failed to load 3D model. Please check the model path.');
    return null;
  }

  // ปิดการคำนวณเงา
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = false;
      child.receiveShadow = false;
      // แก้ไข WebGL warning โดยตั้งค่า texture ให้สมบูรณ์
      if (child.material) {
        const material = child.material as THREE.MeshStandardMaterial;
        if (material.map) {
          material.map.minFilter = THREE.LinearFilter; // ปิดการใช้ mipmap
          material.map.magFilter = THREE.LinearFilter;
          material.map.needsUpdate = true;
        }
      }
    }
  });

  // หมุนโมเดลอย่างต่อเนื่อง
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01; // หมุนทีละ 0.01 เรเดียนต่อเฟรม
    }
  });

  if (error) {
    return (
      <mesh position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="red" />
        <Html center>
          <div style={{ color: 'white', fontSize: '24px', textAlign: 'center' }}>
            {error}
          </div>
        </Html>
      </mesh>
    );
  }

  return <primitive ref={modelRef} object={scene} position={position} scale={scale} />;
};

// Preload โมเดลเพื่อลดโอกาสเกิด WebGL warning
useGLTF.preload('/models/lamborghini_veneno_2013_3d_model/scene.gltf');

export default CarModel;