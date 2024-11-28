import { Box, useColorMode } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import {
  Lensflare,
  LensflareElement,
} from 'three/examples/jsm/objects/Lensflare.js';

export const Animation = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<FlyControls | null>(null);
  const frameRef = useRef<number | null>(null);
  const isHoveringRef = useRef<boolean>(false);
  const lensFlareLightsRef = useRef<THREE.PointLight[]>([]);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const { colorMode } = useColorMode();

  // Update background and fog color on color mode change
  useEffect(() => {
    if (sceneRef.current) {
      const color = new THREE.Color(
        colorMode === 'light' ? 0xdee3eb : 0x1a1a1a
      );
      sceneRef.current.background = color;
      sceneRef.current.fog = new THREE.Fog(color, 3500, 15000);
    }
  }, [colorMode]);

  // Add or remove lens flares based on color mode
  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) return;

    if (colorMode === 'dark' && lensFlareLightsRef.current.length === 0) {
      renderLensFlares(scene);
    } else if (colorMode === 'light' && lensFlareLightsRef.current.length > 0) {
      removeLensFlares(scene);
    }
  }, [colorMode]);

  /**
   * Renders lens flare effects and adds them to the scene.
   *
   * @param scene - The Three.js scene to add lens flares to.
   */
  const renderLensFlares = (scene: THREE.Scene) => {
    const textureLoader = new THREE.TextureLoader();

    Promise.all([
      textureLoader.loadAsync('/textures/lensflare0.png'),
      textureLoader.loadAsync('/textures/lensflare3.png'),
    ])
      .then(([textureFlare0, textureFlare3]) => {
        const addLight = (
          h: number,
          s: number,
          l: number,
          x: number,
          y: number,
          z: number
        ) => {
          const light = new THREE.PointLight(0xffffff, 1.5, 2000, 0);
          light.color.setHSL(h, s, l);
          light.position.set(x, y, z);

          scene.add(light);

          const lensflare = new Lensflare();

          lensflare.addElement(
            new LensflareElement(textureFlare0, 700, 0, light.color)
          );

          lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
          lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
          lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
          lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));

          light.add(lensflare);

          lensFlareLightsRef.current.push(light);
        };

        // Add lens flare lights
        addLight(0.55, 0.9, 0.5, 5000, 0, -1000);
        addLight(0.08, 0.8, 0.5, 0, 0, -1000);
        addLight(0.995, 0.5, 0.9, 5000, 5000, -1000);
      })
      .catch((error) => {
        console.error('Error loading textures:', error);
      });
  };

  /**
   * Removes lens flare effects from the scene.
   *
   * @param scene - The Three.js scene to remove lens flares from.
   */
  const removeLensFlares = (scene: THREE.Scene) => {
    lensFlareLightsRef.current.forEach((light) => {
      scene.remove(light);

      // Dispose of lens flare elements
      if (light.children.length > 0) {
        light.children.forEach((child) => {
          if ((child as any).dispose) {
            (child as any).dispose();
          }
        });
      }
    });

    lensFlareLightsRef.current = [];
  };

  // Initialize the Three.js scene
  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / 200,
      1,
      15000
    );
    camera.position.z = 250;
    cameraRef.current = camera;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, 200);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Append renderer to container
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Set up controls
    const controls = new FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 2500;
    controls.rollSpeed = Math.PI / 6;
    controls.autoForward = false;
    controls.dragToLook = false;
    controlsRef.current = controls;

    // Create geometries and materials
    const geometries = createGeometries();
    const materials = createMaterials();

    // Add meshes to the scene
    createMeshes(scene, geometries, materials);

    // Add ambient and directional lights
    addLights(scene);

    // Render lens flares if in dark mode
    if (colorMode === 'dark') {
      renderLensFlares(scene);
    }

    // Set initial background and fog
    const color = new THREE.Color(colorMode === 'light' ? 0xdee3eb : 0x1a1a1a);
    scene.background = color;
    scene.fog = new THREE.Fog(color, 3500, 15000);

    // Start the animation loop
    animate();

    // Handle window resize
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      if (
        containerRef.current &&
        rendererRef.current &&
        rendererRef.current.domElement
      ) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      // Dispose geometries and materials
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    };
  }, []);

  /**
   * Animation loop to render the scene.
   */
  const animate = () => {
    frameRef.current = requestAnimationFrame(animate);

    const delta = clockRef.current.getDelta();

    // Update controls only when hovering
    if (isHoveringRef.current && controlsRef.current) {
      controlsRef.current.update(delta);
    }

    // Rotate and animate the meshes
    if (sceneRef.current) {
      sceneRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.x += 0.01;
          child.rotation.y += 0.01;
          child.position.x += Math.sin(clockRef.current.elapsedTime) * 0.5;
          child.position.y += Math.cos(clockRef.current.elapsedTime) * 0.5;
        }
      });
    }

    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  /**
   * Handles window resize events to adjust camera and renderer.
   */
  const handleResize = () => {
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = window.innerWidth / 200;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, 200);
    }
  };

  /**
   * Handles mouse enter events to enable camera controls.
   */
  const handleMouseEnter = () => {
    isHoveringRef.current = true;
  };

  /**
   * Handles mouse leave events to disable camera controls.
   */
  const handleMouseLeave = () => {
    isHoveringRef.current = false;
  };

  /**
   * Creates an array of geometries used for the meshes.
   *
   * @returns Array of Three.js geometries.
   */
  const createGeometries = () => {
    return [
      new THREE.BoxGeometry(250, 250, 250),
      new THREE.SphereGeometry(125, 32, 32),
      new THREE.ConeGeometry(125, 250, 32),
      new THREE.TorusGeometry(125, 50, 16, 100),
      new THREE.DodecahedronGeometry(125),
      new THREE.OctahedronGeometry(125),
      new THREE.TorusKnotGeometry(75, 25, 100, 16),
      new THREE.IcosahedronGeometry(125),
    ];
  };

  /**
   * Creates an array of materials with colors from a similar palette.
   *
   * @returns Array of Three.js MeshStandardMaterial.
   */
  const createMaterials = () => {
    const materials: THREE.MeshStandardMaterial[] = [];

    const baseHue = 0.65;
    const hueRange = 0.05;
    const saturation = 0.7;
    const lightness = 0.5;

    for (let i = 0; i < 7; i++) {
      const hue = baseHue + (Math.random() - 0.5) * hueRange;

      const color = new THREE.Color().setHSL(hue, saturation, lightness);

      const material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.5,
        roughness: 0.5,
      });

      materials.push(material);
    }

    return materials;
  };

  /**
   * Creates and adds meshes to the scene.
   *
   * @param scene - The Three.js scene.
   * @param geometries - Array of geometries.
   * @param materials - Array of materials.
   */
  const createMeshes = (
    scene: THREE.Scene,
    geometries: THREE.BufferGeometry[],
    materials: THREE.MeshStandardMaterial[]
  ) => {
    for (let i = 0; i < 500; i++) {
      const geometry =
        geometries[Math.floor(Math.random() * geometries.length)];

      const material = materials[Math.floor(Math.random() * materials.length)];

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = 8000 * (2.0 * Math.random() - 1.0);
      mesh.position.y = 8000 * (2.0 * Math.random() - 1.0);
      mesh.position.z = 8000 * (2.0 * Math.random() - 1.0);
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.rotation.z = Math.random() * Math.PI;

      mesh.matrixAutoUpdate = true;
      scene.add(mesh);
    }
  };

  /**
   * Adds ambient and directional lights to the scene.
   *
   * @param scene - The Three.js scene.
   */
  const addLights = (scene: THREE.Scene) => {
    const ambientLight = new THREE.AmbientLight(0x888888);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 0, 1).normalize();
    scene.add(dirLight);
  };

  return (
    <Box
      ref={containerRef}
      width='100%'
      height='192px'
      position='relative'
      overflow='hidden'
      borderRadius='lg'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};
