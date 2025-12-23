import React, { useState, useEffect, useCallback } from 'react';
import Polygon from './components/Polygon';

/**
 * ManualControl page - Full-screen camera view with joystick control.
 * 
 * Features:
 * - Full-screen Polygon component filling entire content area
 * - Live video feed from primary camera (image_cropped_resized)
 * - Zoom and pan support
 * - Joystick control overlay
 * - Reticle display based on camera settings
 */
const ManualControl = () => {
    // Reticle settings from camera configuration
    const [reticleSettings, setReticleSettings] = useState({
        x: 0.5,
        y: 0.5,
        color: '#ff0000cc',
        size: 1.0
    });
    const [streamUrl, setStreamUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Fetch primary camera info and manual control settings.
     */
    const fetchCameraSettings = useCallback(async () => {
        try {
            // First get the primary camera index
            const primaryResponse = await fetch('/api/cameras/primary');
            const primaryData = await primaryResponse.json();
            
            let cameraIndex = 0;
            if (primaryData.success && primaryData.primaryCamera) {
                cameraIndex = primaryData.primaryCamera.index;
            }
            
            // Get the camera list to retrieve manual_control settings
            const listResponse = await fetch('/api/cameras/list');
            const listData = await listResponse.json();
            
            if (listData.input_devices && listData.input_devices[cameraIndex]) {
                const device = listData.input_devices[cameraIndex];
                
                if (device.manual_control) {
                    setReticleSettings({
                        x: device.manual_control.static_reticle_x ?? 0.5,
                        y: device.manual_control.static_reticle_y ?? 0.5,
                        color: device.manual_control.static_reticle_color ?? '#ff0000cc',
                        size: device.manual_control.static_reticle_size ?? 1.0
                    });
                }
            }
            
            // Set the stream URL
            setStreamUrl(`/api/cameras/stream-manual/${cameraIndex}`);
            setIsLoading(false);
            
        } catch (error) {
            console.error('Failed to fetch camera settings:', error);
            // Use defaults on error
            setStreamUrl('/api/cameras/stream-manual/0');
            setIsLoading(false);
        }
    }, []);

    // Fetch camera settings on mount
    useEffect(() => {
        fetchCameraSettings();
    }, [fetchCameraSettings]);

    // Handle joystick move events
    const handleJoystickMove = useCallback((coords) => {
        // coords: { x: -1 to 1, y: -1 to 1 }
        // TODO: Send joystick commands to motors controller
        console.log('Joystick move:', coords);
    }, []);

    // Handle joystick start
    const handleJoystickStart = useCallback(() => {
        console.log('Joystick started');
    }, []);

    // Handle joystick end
    const handleJoystickEnd = useCallback(() => {
        console.log('Joystick ended');
    }, []);

    if (isLoading) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000'
            }}>
                <span style={{ color: '#fff' }}>Loading...</span>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            overflow: 'hidden'
        }}>
            <Polygon
                src={streamUrl}
                stretchMode="fit"
                background="#000000"
                mode="joystick"
                zoomPanEnabled={true}
                showReticle={true}
                reticleX={reticleSettings.x}
                reticleY={reticleSettings.y}
                reticleColor={reticleSettings.color}
                reticleSize={reticleSettings.size}
                joystickLineMaxLength={0.33}
                onJoystickMove={handleJoystickMove}
                onJoystickStart={handleJoystickStart}
                onJoystickEnd={handleJoystickEnd}
                style={{
                    width: '100%',
                    height: '100%'
                }}
            />
        </div>
    );
};

export default ManualControl;
