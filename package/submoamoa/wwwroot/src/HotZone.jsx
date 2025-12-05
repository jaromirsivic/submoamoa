import React, { useState, useEffect } from 'react';
import Scene3D from './components/Scene3D';
import Button from './components/Button';
import HotZoneEditModal from './HotZoneEditModal';

const HotZone = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Override main-content padding for full-screen Scene3D
    useEffect(() => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const originalPadding = mainContent.style.padding;
            const originalOverflow = mainContent.style.overflow;
            mainContent.style.padding = '0';
            mainContent.style.overflow = 'hidden';
            return () => {
                mainContent.style.padding = originalPadding;
                mainContent.style.overflow = originalOverflow;
            };
        }
    }, []);

    // Generate a cloud of points with different colors and sizes
    const generatePointCloud = () => {
        const points = [];
        const colors = ['#ff0000ff', '#00ff00ff', '#0000ffff', '#ffff00ff', '#ff00ffff', '#00ffffff', '#ff8800ff', '#8800ffff'];
        
        for (let i = 0; i < 50; i++) {
            points.push({
                type: 'point',
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10,
                z: Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                width: 0.1 + Math.random() * 0.3 // Varying point sizes (0.1 to 0.4)
            });
        }
        return points;
    };

    // Define scene objects
    const sceneObjects = [
        // Point cloud
        ...generatePointCloud(),
        
        // Two boxes
        {
            type: 'box',
            x: -3,
            y: 2,
            z: 1,
            width: 2,
            color: '#4488ffff'
        },
        {
            type: 'box',
            x: 4,
            y: -1,
            z: 0.5,
            width: 1,
            color: '#ff8844ff'
        },
        
        // Two spheres
        {
            type: 'sphere',
            x: 0,
            y: 3,
            z: 1.5,
            radius: 1,
            color: '#44ff88ff'
        },
        {
            type: 'sphere',
            x: -2,
            y: -3,
            z: 0.75,
            radius: 0.75,
            color: '#ff44aaff'
        },
        
        // Lines with different widths
        {
            type: 'line',
            x1: -5, y1: -5, z1: 0,
            x2: 5, y2: 5, z2: 3,
            color: '#888888ff',
            width: 0.02 // Thin line
        },
        {
            type: 'line',
            x1: -5, y1: 5, z1: 0,
            x2: 5, y2: -5, z2: 3,
            color: '#ff8800ff',
            width: 0.08 // Medium line
        },
        {
            type: 'line',
            x1: 0, y1: 0, z1: 0,
            x2: 0, y2: 0, z2: 5,
            color: '#00aa00ff',
            width: 0.15 // Thick line (Z-axis)
        },
        {
            type: 'line',
            x1: -3, y1: 2, z1: 2,
            x2: 0, y2: 3, z2: 1.5,
            color: '#aa00aaff',
            width: 0.05
        },
        {
            type: 'line',
            x1: 4, y1: -1, z1: 1,
            x2: -2, y2: -3, z2: 0.75,
            color: '#00aaaaff',
            width: 0.1
        },
        
        // Large point markers
        {
            type: 'point',
            x: -4,
            y: 0,
            z: 2,
            color: '#ff0000ff',
            width: 0.6 // Large point
        },
        {
            type: 'point',
            x: 4,
            y: 0,
            z: 2,
            color: '#00ff00ff',
            width: 0.4 // Medium point
        },
        {
            type: 'point',
            x: 0,
            y: -4,
            z: 2,
            color: '#0000ffff',
            width: 0.2 // Small point
        }
    ];

    // Edit button style - matches Reset button in Scene3D
    const editButtonStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 10
    };

    // Match MultiSwitch default colors (same as Reset button)
    const editButtonColors = {
        backgroundColor: '#cccccc',
        color: '#333333',
        border: '1px solid #999999',
        borderRadius: '0.375rem',
        padding: '0.5rem 1rem',
        fontWeight: 400,
        opacity: 0.5
    };

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
    };

    const handleSettingsSaved = (newSettings) => {
        // Settings saved successfully - can be used to update 3D scene if needed
        console.log('Hot zone settings saved:', newSettings);
    };

    return (
        <div style={{ 
            width: '100%', 
            height: '100%',
            position: 'relative'
        }}>
            <div style={editButtonStyle}>
                <Button
                    label="Edit"
                    onClick={handleEditClick}
                    style={editButtonColors}
                />
            </div>
            <Scene3D 
                background="#ffffffff"
                gridColor="#eeeeeeff"
                objects={sceneObjects}
            />
            <HotZoneEditModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                onSave={handleSettingsSaved}
            />
        </div>
    );
};

export default HotZone;
