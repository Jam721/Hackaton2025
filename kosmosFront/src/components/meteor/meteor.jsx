import React, { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export function Meteor(props) {
  const groupRef = useRef();
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);


  const handleClick = (event) => {
      event.stopPropagation();
      setIsClicked(true);

      if (props.onMeteorClick) {
        props.onMeteorClick();
      }

      setTimeout(() => setIsClicked(false), 2000);
  };

  const handleHover = (event) => {
      setIsHovered(true);
      setIsPaused(true);
      document.body.style.cursor = 'pointer';
  }

  const handleHoverEnd = (event) => {
    setIsHovered(false);
    setIsPaused(false);
    document.body.style.cursor = 'default';
  };
  
  useFrame((state, delta) => {
    if (groupRef.current && !isPaused) {

      if (groupRef.current.position.y < 50) {
        groupRef.current.position.set(-600, 350, -300); 
      }


      groupRef.current.position.x -= delta * -200;
      groupRef.current.position.y -= delta * 50;
      groupRef.current.position.z -= delta * -125;
      
      
    }
  });

  const { scene } = useGLTF('/meteor/scene.gltf'); 
  
  return (
    <group ref={groupRef} 
      onClick={handleClick} 
      onPointerEnter={handleHover}
      onPointerLeave={handleHoverEnd} {...props}>
      <primitive object={scene} />
    </group>
  );
}