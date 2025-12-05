import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import MultiSwitch from './MultiSwitch';
import Button from './Button';

const Scene3D = ({
    background = '#ffffffff',
    gridColor = '#eeeeeeff',
    objects = [],
    style = {}
}) => {
    const containerRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const objectsGroupRef = useRef(null);
    const lightRef = useRef(null);
    const animationFrameRef = useRef(null);
    
    const [controlMode, setControlMode] = useState('move');
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });
    
    // Camera orbit controls state
    const cameraStateRef = useRef({
        distance: 10,
        theta: Math.PI / 4,  // horizontal angle
        phi: Math.PI / 3,    // vertical angle
        target: new THREE.Vector3(0, 0, 0)
    });

    // Parse color with alpha
    const parseColor = (colorString) => {
        if (!colorString) return { color: 0xffffff, opacity: 1 };
        
        let hex = colorString.replace('#', '');
        let opacity = 1;
        
        if (hex.length === 8) {
            opacity = parseInt(hex.slice(6, 8), 16) / 255;
            hex = hex.slice(0, 6);
        }
        
        return { color: parseInt(hex, 16), opacity };
    };

    // Update camera position based on orbit state
    const updateCameraPosition = useCallback(() => {
        const camera = cameraRef.current;
        const state = cameraStateRef.current;
        if (!camera) return;

        // Blender-style: Z is up
        const x = state.target.x + state.distance * Math.sin(state.phi) * Math.cos(state.theta);
        const y = state.target.y + state.distance * Math.sin(state.phi) * Math.sin(state.theta);
        const z = state.target.z + state.distance * Math.cos(state.phi);

        camera.position.set(x, y, z);
        camera.up.set(0, 0, 1);
        camera.lookAt(state.target);

        // Update light to follow camera
        if (lightRef.current) {
            lightRef.current.position.copy(camera.position);
        }
    }, []);

    // Fit camera to view all objects
    const resetCamera = useCallback(() => {
        const group = objectsGroupRef.current;
        if (!group || group.children.length === 0) {
            cameraStateRef.current = {
                distance: 10,
                theta: Math.PI / 4,
                phi: Math.PI / 3,
                target: new THREE.Vector3(0, 0, 0)
            };
            updateCameraPosition();
            return;
        }

        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 2 + 5;

        cameraStateRef.current = {
            distance: Math.max(distance, 5),
            theta: Math.PI / 4,
            phi: Math.PI / 3,
            target: center.clone()
        };
        updateCameraPosition();
    }, [updateCameraPosition]);

    // Create scene objects
    const createObjects = useCallback(() => {
        const group = objectsGroupRef.current;
        if (!group) return;

        // Clear existing objects
        while (group.children.length > 0) {
            const child = group.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
            group.remove(child);
        }

        // Create new objects
        objects.forEach(obj => {
            switch (obj.type) {
                case 'point': {
                    const { color: hexColor, opacity } = parseColor(obj.color || '#ff0000ff');
                    const pointSize = obj.width || 0.2; // Width controls point size
                    const spriteMaterial = new THREE.SpriteMaterial({ 
                        color: hexColor,
                        opacity: opacity,
                        transparent: opacity < 1,
                        sizeAttenuation: true
                    });
                    const sprite = new THREE.Sprite(spriteMaterial);
                    sprite.position.set(obj.x || 0, obj.y || 0, obj.z || 0);
                    sprite.scale.set(pointSize, pointSize, pointSize);
                    group.add(sprite);
                    break;
                }
                case 'line': {
                    const { color: hexColor, opacity } = parseColor(obj.color || '#00ff00ff');
                    const lineWidth = obj.width || 0.02; // Width controls line thickness
                    const start = new THREE.Vector3(obj.x1 || 0, obj.y1 || 0, obj.z1 || 0);
                    const end = new THREE.Vector3(obj.x2 || 0, obj.y2 || 0, obj.z2 || 0);
                    
                    // Use cylinder geometry to create thick lines
                    const direction = new THREE.Vector3().subVectors(end, start);
                    const length = direction.length();
                    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
                    
                    const geometry = new THREE.CylinderGeometry(lineWidth / 2, lineWidth / 2, length, 8, 1);
                    const material = new THREE.MeshBasicMaterial({ 
                        color: hexColor,
                        opacity: opacity,
                        transparent: opacity < 1
                    });
                    const cylinder = new THREE.Mesh(geometry, material);
                    
                    // Position and rotate cylinder to align with line
                    cylinder.position.copy(center);
                    cylinder.quaternion.setFromUnitVectors(
                        new THREE.Vector3(0, 1, 0),
                        direction.clone().normalize()
                    );
                    
                    group.add(cylinder);
                    break;
                }
                case 'box': {
                    const { color: hexColor, opacity } = parseColor(obj.color || '#0000ffff');
                    const size = obj.width || 1;
                    const geometry = new THREE.BoxGeometry(size, size, size);
                    const material = new THREE.MeshStandardMaterial({ 
                        color: hexColor,
                        opacity: opacity,
                        transparent: opacity < 1
                    });
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set(obj.x || 0, obj.y || 0, obj.z || 0);
                    group.add(mesh);
                    break;
                }
                case 'sphere': {
                    const { color: hexColor, opacity } = parseColor(obj.color || '#ff00ffff');
                    const radius = obj.radius || 0.5;
                    // Low poly sphere (8 segments)
                    const geometry = new THREE.SphereGeometry(radius, 8, 6);
                    const material = new THREE.MeshStandardMaterial({ 
                        color: hexColor,
                        opacity: opacity,
                        transparent: opacity < 1,
                        flatShading: true
                    });
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set(obj.x || 0, obj.y || 0, obj.z || 0);
                    group.add(mesh);
                    break;
                }
                default:
                    console.warn(`Unknown object type: ${obj.type}`);
            }
        });
    }, [objects]);

    // Initialize Three.js scene
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Objects group
        const objectsGroup = new THREE.Group();
        scene.add(objectsGroup);
        objectsGroupRef.current = objectsGroup;

        // Lighting - from camera
        const pointLight = new THREE.PointLight(0xffffff, 1, 0, 0);
        scene.add(pointLight);
        lightRef.current = pointLight;

        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        // Initial camera position
        updateCameraPosition();

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            if (!container || !camera || !renderer) return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            resizeObserver.disconnect();
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [updateCameraPosition]);

    // Update background color
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        const { color, opacity } = parseColor(background);
        scene.background = new THREE.Color(color);
    }, [background]);

    // Update grid
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        // Remove existing grid
        const existingGrid = scene.getObjectByName('grid');
        if (existingGrid) {
            scene.remove(existingGrid);
        }

        // Create new grid on XY plane (Blender style with Z up)
        const { color } = parseColor(gridColor);
        const gridHelper = new THREE.GridHelper(20, 20, color, color);
        gridHelper.rotation.x = Math.PI / 2; // Rotate to XY plane
        gridHelper.name = 'grid';
        scene.add(gridHelper);
    }, [gridColor]);

    // Update objects and reset camera when objects prop changes
    useEffect(() => {
        createObjects();
        resetCamera();
    }, [objects, createObjects, resetCamera]);

    // Mouse event handlers
    const handleMouseDown = useCallback((e) => {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current) return;

        const deltaX = e.clientX - lastMouseRef.current.x;
        const deltaY = e.clientY - lastMouseRef.current.y;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };

        const state = cameraStateRef.current;
        const isMiddleButton = e.buttons === 4;
        const isLeftButton = e.buttons === 1;
        const isShiftHeld = e.shiftKey;

        let mode = null;

        // Middle button behaviors (like Blender)
        if (isMiddleButton) {
            if (isShiftHeld) {
                mode = 'move';
            } else {
                mode = 'rotate';
            }
        }
        // Left button uses the control mode
        else if (isLeftButton) {
            mode = controlMode;
        }

        if (mode === 'rotate') {
            // Orbit rotation
            state.theta -= deltaX * 0.01;
            state.phi -= deltaY * 0.01;
            state.phi = Math.max(0.1, Math.min(Math.PI - 0.1, state.phi));
        } else if (mode === 'move') {
            // Pan
            const camera = cameraRef.current;
            if (camera) {
                const right = new THREE.Vector3();
                const up = new THREE.Vector3(0, 0, 1);
                camera.getWorldDirection(right);
                right.cross(up).normalize();
                
                const moveSpeed = state.distance * 0.002;
                state.target.add(right.multiplyScalar(-deltaX * moveSpeed));
                
                const forward = new THREE.Vector3();
                camera.getWorldDirection(forward);
                forward.z = 0;
                forward.normalize();
                state.target.add(forward.multiplyScalar(deltaY * moveSpeed));
            }
        } else if (mode === 'zoom') {
            // Zoom with drag
            const zoomSpeed = 0.01;
            state.distance *= 1 + deltaY * zoomSpeed;
            state.distance = Math.max(1, Math.min(100, state.distance));
        }

        updateCameraPosition();
    }, [controlMode, updateCameraPosition]);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const state = cameraStateRef.current;
        const zoomSpeed = 0.001;
        state.distance *= 1 + e.deltaY * zoomSpeed;
        state.distance = Math.max(1, Math.min(100, state.distance));
        updateCameraPosition();
    }, [updateCameraPosition]);

    // Handle context menu (prevent on canvas)
    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
    }, []);

    const containerStyle = {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style
    };

    const controlsStyle = {
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10
    };

    const resetButtonStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 10
    };

    return (
        <div 
            ref={containerRef} 
            style={containerStyle}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onContextMenu={handleContextMenu}
        >
            <div style={controlsStyle}>
                <MultiSwitch
                    options={[
                        { label: 'Move', value: 'move' },
                        { label: 'Rotate', value: 'rotate' },
                        { label: 'Zoom', value: 'zoom' }
                    ]}
                    value={controlMode}
                    onChange={setControlMode}
                    orientation="vertical"
                    style={{ opacity: 0.5 }}
                />
            </div>
            <div style={resetButtonStyle}>
                <Button 
                    label="Reset" 
                    onClick={resetCamera}
                    style={{ opacity: 0.7 }}
                />
            </div>
        </div>
    );
};

export default Scene3D;
