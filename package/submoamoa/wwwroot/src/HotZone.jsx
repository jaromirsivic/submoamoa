import React, { useState, useEffect } from 'react';
import Scene3D from './components/Scene3D';
import Button from './components/Button';
import HotZoneEditModal from './HotZoneEditModal';
import { generateHotZoneSceneObjects } from './lib/HotZoneCloudPointsGenerator';
import { getHotZoneSettings } from './lib/api';

const HotZone = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [sceneObjects, setSceneObjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load initial hot zone settings and generate scene
    useEffect(() => {
        loadAndGenerateScene();
    }, []);

    const loadAndGenerateScene = async () => {
        try {
            setIsLoading(true);
            const settings = await getHotZoneSettings();
            if (settings && Object.keys(settings).length > 0) {
                const quality = settings.computationQuality || 15;
                const objects = generateHotZoneSceneObjects(settings, quality);
                setSceneObjects(objects);
            }
        } catch (error) {
            console.error('Failed to load hot zone settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
        // Regenerate the scene with the new settings
        const quality = newSettings.computationQuality || 15;
        const objects = generateHotZoneSceneObjects(newSettings, quality);
        setSceneObjects(objects);
        console.log('Hot zone settings saved, scene updated with', objects.length, 'objects');
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
