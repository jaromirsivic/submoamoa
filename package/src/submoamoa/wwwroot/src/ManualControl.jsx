import React, { useState, useEffect, useCallback } from 'react';
import Polygon from './components/Polygon';
import settingsIcon from './assets/icons/settings.svg';
import fullscreenIcon from './assets/icons/fullscreen.svg';
import fullscreenExitIcon from './assets/icons/fullscreenExit.svg';

/**
 * ManualControl page - Full-screen camera view with joystick control.
 * 
 * Features:
 * - Full-screen Polygon component filling entire content area
 * - Live video feed from primary camera (image_cropped_resized)
 * - Zoom and pan support
 * - Joystick control overlay
 * - Reticle display based on camera settings
 * - Setup button for settings access
 * - Fullscreen mode toggle
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
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    // Listen for fullscreen changes (handles Escape key and other exit methods)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isNowFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
            setIsFullscreen(isNowFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    /**
     * Toggle fullscreen mode.
     */
    const toggleFullscreen = useCallback(async () => {
        try {
            if (!isFullscreen) {
                // Enter fullscreen
                const element = document.documentElement;
                if (element.requestFullscreen) {
                    await element.requestFullscreen();
                } else if (element.webkitRequestFullscreen) {
                    await element.webkitRequestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    await element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    await element.msRequestFullscreen();
                }
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    await document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    await document.msExitFullscreen();
                }
            }
        } catch (error) {
            console.error('Fullscreen toggle failed:', error);
        }
    }, [isFullscreen]);

    /**
     * Handle Setup button click - navigate to camera settings.
     */
    const handleSetupClick = useCallback(() => {
        // Navigate to camera settings page
        window.location.href = '/settings/cameras';
    }, []);

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

    // Button style - 20% transparent (opacity 0.8), z-index below menu (48-50)
    // Background color matches menu button (#887700)
    const buttonStyle = {
        position: 'absolute',
        bottom: '16px',
        zIndex: 10,
        width: '48px',
        height: '48px',
        padding: '8px',
        backgroundColor: '#887700',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.8,
        transition: 'opacity 0.2s, background-color 0.2s'
    };

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
                overflow: 'hidden',
                position: 'relative'
            }}
        >
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

            {/* Fullscreen button - left of Setup button */}
            <button
                onClick={toggleFullscreen}
                style={{
                    ...buttonStyle,
                    right: '80px' // 16px margin + 48px button width + 16px gap
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.backgroundColor = '#885500';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.style.backgroundColor = '#887700';
                }}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
                <img 
                    src={isFullscreen ? fullscreenExitIcon : fullscreenIcon} 
                    alt={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} 
                    width="24" 
                    height="24" 
                />
            </button>

            {/* Setup button - right bottom corner */}
            <button
                onClick={handleSetupClick}
                style={{
                    ...buttonStyle,
                    right: '16px'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.backgroundColor = '#885500';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.style.backgroundColor = '#887700';
                }}
                title="Setup"
            >
                <img src={settingsIcon} alt="Setup" width="24" height="24" />
            </button>
        </div>
    );
};

export default ManualControl;
