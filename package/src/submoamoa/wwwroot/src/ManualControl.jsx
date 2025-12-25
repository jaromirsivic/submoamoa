import React, { useState, useEffect, useCallback, useRef } from 'react';
import Polygon from './components/Polygon';
import ModalWindow from './components/ModalWindow';
import Switch from './components/Switch';
import ComboBox from './components/ComboBox';
import StaticText from './components/StaticText';
import HorizontalSeparator from './components/HorizontalSeparator';
import Joystick1D from './components/Joystick1D';
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
 * - Joystick control overlay (up to 4 joysticks based on enabled motors)
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Motor settings from backend (max 4 motors)
    const [motors, setMotors] = useState([]);
    // Temporary motor state for modal (to allow cancel)
    const [tempMotors, setTempMotors] = useState([]);
    
    // Ref to track if component is mounted (for cleanup)
    const isMountedRef = useRef(true);
    // Ref to the Polygon component for stream termination
    const polygonRef = useRef(null);
    
    // Window dimensions for responsive joystick positioning
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    /**
     * Fetch motor settings from backend.
     */
    const fetchMotorSettings = useCallback(async () => {
        try {
            const response = await fetch('/api/manualcontrol/motors');
            const data = await response.json();
            
            if (data.success && data.motors) {
                // Limit to 4 motors
                const limitedMotors = data.motors.slice(0, 4);
                setMotors(limitedMotors);
            }
        } catch (error) {
            console.error('Failed to fetch motor settings:', error);
        }
    }, []);

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
            if (isMountedRef.current) {
                setStreamUrl(`/api/cameras/stream-manual/${cameraIndex}`);
                setIsLoading(false);
            }
            
        } catch (error) {
            console.error('Failed to fetch camera settings:', error);
            // Use defaults on error
            if (isMountedRef.current) {
                setStreamUrl('/api/cameras/stream-manual/0');
                setIsLoading(false);
            }
        }
    }, []);

    // Fetch camera and motor settings on mount
    useEffect(() => {
        isMountedRef.current = true;
        fetchCameraSettings();
        fetchMotorSettings();
        
        // Cleanup: terminate live feed when component unmounts
        return () => {
            isMountedRef.current = false;
            // Clear stream URL to stop the feed
            setStreamUrl(null);
        };
    }, [fetchCameraSettings, fetchMotorSettings]);

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
            
            // Add/remove class on body for reliable CSS targeting
            if (isNowFullscreen) {
                document.body.classList.add('is-fullscreen');
            } else {
                document.body.classList.remove('is-fullscreen');
            }
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
            // Clean up class on unmount
            document.body.classList.remove('is-fullscreen');
        };
    }, []);

    // Handle page visibility change to pause/resume stream
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Page is hidden, could pause stream here if needed
                console.log('Manual Control: Page hidden');
            } else {
                // Page is visible again
                console.log('Manual Control: Page visible');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Track window resize for responsive joystick positioning
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
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
     * Handle Setup button click - open modal settings.
     */
    const handleSetupClick = useCallback(() => {
        // Create a copy of motors for temp editing
        setTempMotors(motors.map(m => ({ ...m })));
        setIsModalOpen(true);
    }, [motors]);

    /**
     * Handle modal cancel - discard changes.
     */
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setTempMotors([]);
    }, []);

    /**
     * Handle motor switch toggle in modal.
     */
    const handleMotorToggle = useCallback((motorIndex) => {
        setTempMotors(prev => prev.map(m => 
            m.index === motorIndex ? { ...m, enabled: !m.enabled } : m
        ));
    }, []);

    /**
     * Handle motor mode change in modal.
     */
    const handleMotorModeChange = useCallback((motorIndex, newMode) => {
        setTempMotors(prev => prev.map(m => 
            m.index === motorIndex ? { ...m, mode: newMode } : m
        ));
    }, []);

    /**
     * Save motor settings to backend.
     */
    const handleSaveMotors = useCallback(async () => {
        try {
            const response = await fetch('/api/manualcontrol/motors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    motors: tempMotors.map(m => ({
                        index: m.index,
                        enabled: m.enabled,
                        mode: m.mode || 'joystick'
                    }))
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update main state with saved values
                setMotors(tempMotors);
                setIsModalOpen(false);
                setTempMotors([]);
            } else {
                console.error('Failed to save motor settings');
            }
        } catch (error) {
            console.error('Error saving motor settings:', error);
        }
    }, [tempMotors]);

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

    /**
     * Calculate first joystick (Blue) position based on window width.
     * 
     * Logic:
     * - Default: bottom-center, same line as fullscreen/setup buttons (bottom: 16px)
     * - If fullscreen button would collide, move joystick left
     * - If joystick would touch left edge, jump up and center horizontally
     */
    const getFirstJoystickPosition = useCallback(() => {
        const joystickWidth = 200;
        const joystickHeight = 60;
        const buttonWidth = 48;
        const buttonMargin = 16;
        const buttonGap = 16;
        const margin = 16;
        
        // Fullscreen button left edge position from left of screen
        // Right: 80px means button right edge is 80px from right
        // Fullscreen button: right edge at windowWidth - 80, left edge at windowWidth - 80 - 48
        const fullscreenLeftEdge = windowWidth - 80 - buttonWidth;
        
        // Joystick centered: center at windowWidth/2, right edge at windowWidth/2 + joystickWidth/2
        const joystickCenterX = windowWidth / 2;
        const joystickRightEdge = joystickCenterX + joystickWidth / 2;
        
        // Default position: bottom-center, same line as buttons
        const defaultPosition = {
            bottom: `${buttonMargin}px`,
            left: '50%',
            transform: 'translateX(-50%)'
        };
        
        // Check if there's enough space (joystick right edge + margin < fullscreen left edge)
        if (joystickRightEdge + margin < fullscreenLeftEdge) {
            // No collision, use default centered position
            return defaultPosition;
        }
        
        // Collision detected - calculate how much to retreat left
        // Move joystick so its right edge is at fullscreenLeftEdge - margin
        const requiredRightEdge = fullscreenLeftEdge - margin;
        const newCenterX = requiredRightEdge - joystickWidth / 2;
        const newLeftEdge = newCenterX - joystickWidth / 2;
        
        // Check if joystick would go off the left side
        if (newLeftEdge <= margin) {
            // Jump up and center horizontally
            // Position at the same y as the original design (vertical middle area)
            // Using bottom: 50% - half joystick height for vertical center-ish
            return {
                bottom: '80px',  // Original elevated position
                left: '50%',
                transform: 'translateX(-50%)'
            };
        }
        
        // Retreat left while staying at bottom
        return {
            bottom: `${buttonMargin}px`,
            left: `${newCenterX}px`,
            transform: 'translateX(-50%)'
        };
    }, [windowWidth]);

    // Joystick configurations based on motor position
    // Motor 1 (index 0): Blue, horizontal, bottom-center (responsive - handled by getFirstJoystickPosition)
    // Motor 2 (index 1): Purple, vertical, middle-right
    // Motor 3 (index 2): Yellow, horizontal, top-center
    // Motor 4 (index 3): Brown, vertical, middle-left
    const joystickConfigs = [
        {
            // Default fallback position (actual position computed by getFirstJoystickPosition)
            position: { bottom: '16px', left: '50%', transform: 'translateX(-50%)' },
            orientation: 'horizontal',
            colors: { ruler: '#3b82f6', button: '#3b82f6', outline: '#2563eb' }
        },
        {
            position: { top: '50%', right: '16px', transform: 'translateY(-50%)' },
            orientation: 'vertical',
            colors: { ruler: '#7134ed', button: '#8b5cf6', outline: '#7c3aed' }
        },
        {
            position: { top: '16px', left: '50%', transform: 'translateX(-50%)' },
            orientation: 'horizontal',
            colors: { ruler: '#eab308', button: '#eab308', outline: '#ca8a04' }
        },
        {
            position: { top: '50%', left: '16px', transform: 'translateY(-50%)' },
            orientation: 'vertical',
            colors: { ruler: '#92400e', button: '#92400e', outline: '#78350f' }
        }
    ];

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
                ref={polygonRef}
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

            {/* Render Joystick1D components for enabled motors */}
            {motors.map((motor, idx) => {
                if (!motor.enabled || idx >= 4) return null;
                
                const config = joystickConfigs[idx];
                const isHorizontal = config.orientation === 'horizontal';
                
                // Use dynamic position for first joystick, static for others
                const position = idx === 0 ? getFirstJoystickPosition() : config.position;
                
                // Use motor color from settings, or fallback to config colors
                const motorColor = motor.color || config.colors.ruler;
                
                // Derive outline color (slightly darker)
                const deriveOutlineColor = (color) => {
                    // Simple darkening: reduce RGB values by 20%
                    if (color.startsWith('#') && color.length === 7) {
                        const r = Math.max(0, Math.floor(parseInt(color.slice(1, 3), 16) * 0.8));
                        const g = Math.max(0, Math.floor(parseInt(color.slice(3, 5), 16) * 0.8));
                        const b = Math.max(0, Math.floor(parseInt(color.slice(5, 7), 16) * 0.8));
                        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                    }
                    return color;
                };
                
                return (
                    <div
                        key={motor.index}
                        style={{
                            position: 'absolute',
                            zIndex: 5,
                            ...position
                        }}
                    >
                        <Joystick1D
                            orientation={config.orientation}
                            mode={motor.mode || 'joystick'}
                            width={isHorizontal ? 200 : 60}
                            height={isHorizontal ? 60 : 200}
                            rulerColor={motorColor}
                            buttonColor={motorColor}
                            buttonOutline={deriveOutlineColor(motorColor)}
                            backgroundColor="rgba(0, 0, 0, 0.2)"
                            rulerShowText={true}
                            rulerLineDistance={0.2}
                            valueOrigin={0}
                            minValue={-1}
                            maxValue={1}
                            snapAnimationDuration={0.1}
                            onStart={handleJoystickStart}
                            onChange={handleJoystickMove}
                            onEnd={handleJoystickEnd}
                        />
                    </div>
                );
            })}

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

            <ModalWindow
                isOpen={isModalOpen}
                title="Manual Control Settings"
                onCancel={handleCloseModal}
                okLabel="Save"
                onOk={handleSaveMotors}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
                    {tempMotors.length === 0 && (
                        <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                            No motors configured
                        </div>
                    )}
                    
                    {tempMotors.slice(0, 4).map((motor, idx) => (
                        <div key={motor.index}>
                            <HorizontalSeparator label="Motor / Device" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        backgroundColor: motor.color || '#888888',
                                        flexShrink: 0
                                    }} />
                                    <StaticText text={<><span style={{ fontWeight: 500 }}>Name:</span> {motor.name || `Motor ${idx + 1}`}</>} />
                                </div>
                                <Switch
                                    label="Enabled"
                                    value={motor.enabled}
                                    onChange={() => handleMotorToggle(motor.index)}
                                    labelWidth="80px"
                                />
                                <ComboBox
                                    label="Mode"
                                    items={[
                                        { label: 'Joystick', value: 'joystick' },
                                        { label: 'Slider', value: 'slider' }
                                    ]}
                                    value={motor.mode || 'joystick'}
                                    onChange={(val) => handleMotorModeChange(motor.index, val)}
                                    disabled={!motor.enabled}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </ModalWindow>
        </div>
    );
};

export default ManualControl;
