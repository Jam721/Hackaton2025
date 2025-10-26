import React, { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, Canvas } from '@react-three/fiber';

import { MainScene } from '../../components/mainScene/mainScene';
import { MeteorOverlay } from '../../components/meteorOverlay/meteorOverlay';

export function Main() {
  const [showMeteorData, setShowMeteorData] = useState(false);

  const handleMeteorClick = () => {
    setShowMeteorData(true);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#040c24' }}> 
      <Canvas
        camera={{ position: [100, 200, 600], fov: 60 }} 
        dpr={[1, 2]}
      >
        <MainScene onMeteorClick={handleMeteorClick} />
      </Canvas>
      
      {showMeteorData && (
        <MeteorOverlay onClose={() => setShowMeteorData(false)} />
      )}
    </div>
  );
}