import React, { useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'; 
import * as THREE from 'three'; 
import { Earth } from '../earth/earth';
import { Meteor } from '../meteor/meteor';

const BackgroundLoader = () => {
  const background = '/space.jpg'; 
  const texture = useLoader(THREE.TextureLoader, background);
  return <primitive attach="background" object={texture} />;
};

export const MainScene = (props) => {
    const [showMeteorData, setShowMeteorData] = useState(false);

    const handleMeteorClick = () => {
        setShowMeteorData(true);
    };

    return (
        <>
            {/* <BackgroundLoader /> */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[100, 100, 100]} intensity={10} />
            
            <Earth position={[0, 0, 0]} scale={2} />

            <Meteor 
                position={[0, -300, 0]} 
                scale={7} 
                onMeteorClick={props.onMeteorClick}
            />

            <OrbitControls 
                enableZoom={true} 
                enableDamping={true}
                target={[0, 0, 0]}
            />
        </>
    );
};