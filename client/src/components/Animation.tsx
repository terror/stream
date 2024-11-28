import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { Box, useColorMode } from '@chakra-ui/react';

export const Animation = () => {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  const { colorMode } = useColorMode();

  // Handle color mode changes
  useEffect(() => {
    if (sceneRef.current && rendererRef.current) {
      const color = new THREE.Color(colorMode === 'light' ? 0xDEE3EB : 0x1A1A1A);
      sceneRef.current.background = color;
      sceneRef.current.fog = new THREE.Fog(color, 3500, 15000);
      rendererRef.current.render(sceneRef.current, controlsRef.current?.object);
    }
  }, [colorMode]);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / 200, 1, 15000);
    camera.position.z = 250;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, 200);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 2500;
    controls.rollSpeed = Math.PI / 6;
    controls.autoForward = false;
    controls.dragToLook = false;
    controlsRef.current = controls;

    // Create cubes
    const s = 250;
    const geometry = new THREE.BoxGeometry(s, s, s);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      specular: 0xffffff,
      shininess: 50 
    });

    for (let i = 0; i < 1000; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = 8000 * (2.0 * Math.random() - 1.0);
      mesh.position.y = 8000 * (2.0 * Math.random() - 1.0);
      mesh.position.z = 8000 * (2.0 * Math.random() - 1.0);
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.rotation.z = Math.random() * Math.PI;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      scene.add(mesh);
    }

    // Add directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.15);
    dirLight.position.set(0, -1, 0).normalize();
    dirLight.color.setHSL(0.1, 0.7, 0.5);
    scene.add(dirLight);


    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      controls.update(delta);
      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / 200;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 200);
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Set initial background color
    const color = new THREE.Color(colorMode === 'light' ? 0xDEE3EB : 0x1A1A1A);
    scene.background = color;
    scene.fog = new THREE.Fog(color, 3500, 15000);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []); // Empty dependency array since we handle colorMode separately

  return (
    <Box 
      ref={containerRef}
      width="100%"
      height="192px"
      position="relative"
      overflow="hidden"
      borderRadius="lg"
    />
  );
};
