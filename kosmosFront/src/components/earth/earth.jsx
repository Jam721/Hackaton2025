import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';

export function Earth(props) {
    const earthRef = useRef();
    const { scene, materials } = useGLTF('/earth/scene.gltf'); 


    const texture = useTexture('/earth/textures/Material.002_diffuse.jpeg');
   

    useEffect(() => {
        if (texture) {
            texture.offset.set(0, 1);
            texture.repeat.set(1, -1);
            if (materials['Material.002']) {
                materials['Material.002'].map = texture;
                materials['Material.002'].needsUpdate = true;
                
            }
        }
    }, [scene, texture, materials]);



    useFrame(() => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.005;
        }
    });

    return <primitive ref={earthRef} object={scene} {...props} />;
}

useGLTF.preload('/earth/scene.gltf');