import React, { useState, useCallback, useEffect } from 'react';
import Panel from './components/Panel';
import Button from './components/Button';
import ComboBox from './components/ComboBox';
import Textbox from './components/Textbox';
import Switch from './components/Switch';
import ColumnLayout from './components/ColumnLayout';
import HorizontalSeparator from './components/HorizontalSeparator';
import ModalWindow from './components/ModalWindow';
import StaticText from './components/StaticText';
import Slider from './components/Slider';
import NumericInput from './components/NumericInput';
import Polygon from './components/Polygon';
import ColorPicker from './components/ColorPicker';
import editIcon from './assets/icons/edit.svg';
import reloadIcon from './assets/icons/reload.svg';
import cameraOffIcon from './assets/icons/cameraOff.svg';

const boldTextStyle = { fontWeight: 'bold' };

// Helper to render static text field - defined outside component
const RenderStaticField = ({ label, value }) => (
    <StaticText text={<>{label}: <span style={boldTextStyle}>{value}</span></>} />
);

// Helper to parse resolution string
const getResolutionDimensions = (resString) => {
    if (!resString) return { width: 0, height: 0 };
    const parts = resString.split(' x ');
    return {
        width: parseInt(parts[0]) || 0,
        height: parseInt(parts[1]) || 0
    };
};

/**
 * Cameras settings page (simplified version of Camera page without previews)
 */
const Cameras = () => {
    // ========================
    // State: Camera Panel
    // ========================
    const [inputDeviceIndex, setInputDeviceIndex] = useState('0');
    const [preferredResolution, setPreferredResolution] = useState('1920 x 1080');
    const [fps, setFps] = useState(30);
    const [flipHorizontally, setFlipHorizontally] = useState(false);
    const [flipVertically, setFlipVertically] = useState(false);
    const [previewEnabled, setPreviewEnabled] = useState(false);
    const [rotateDegrees, setRotateDegrees] = useState('0');
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(0);
    const [sharpness, setSharpness] = useState(0);
    const [gamma, setGamma] = useState(0);
    const [whiteBalanceTemperature, setWhiteBalanceTemperature] = useState(0);
    const [backlight, setBacklight] = useState(0);
    const [gain, setGain] = useState(0);
    const [focus, setFocus] = useState(0);
    const [exposure, setExposure] = useState(0);
    const [autoWhiteBalance, setAutoWhiteBalance] = useState(false);
    const [autoFocus, setAutoFocus] = useState(false);
    const [autoExposure, setAutoExposure] = useState(false);
    const [polygons1, setPolygons1] = useState([]);

    // ========================
    // State: Manual Control - Input Img Panel
    // ========================
    const [manualCropTop, setManualCropTop] = useState(0);
    const [manualCropLeft, setManualCropLeft] = useState(0);
    const [manualCropBottom, setManualCropBottom] = useState(0);
    const [manualCropRight, setManualCropRight] = useState(0);
    const [manualStretchWidth, setManualStretchWidth] = useState(640);
    const [manualStretchHeight, setManualStretchHeight] = useState(480);
    const [manualReticleX, setManualReticleX] = useState(0.5);
    const [manualReticleY, setManualReticleY] = useState(0.5);
    const [manualReticleColor, setManualReticleColor] = useState('#ff0000cc');
    const [manualReticleSize, setManualReticleSize] = useState(1.0);

    // ========================
    // State: AI Agent - Input Img Panel
    // ========================
    const [aiCropTop, setAiCropTop] = useState(0);
    const [aiCropLeft, setAiCropLeft] = useState(0);
    const [aiCropBottom, setAiCropBottom] = useState(0);
    const [aiCropRight, setAiCropRight] = useState(0);
    const [aiStretchWidth, setAiStretchWidth] = useState(640);
    const [aiStretchHeight, setAiStretchHeight] = useState(480);

    // ========================
    // State: Preview Section (Manual and AI panels)
    // ========================
    const [manualPreviewEnabled, setManualPreviewEnabled] = useState(false);
    const [aiPreviewEnabled, setAiPreviewEnabled] = useState(false);

    // ========================
    // State: Backend Data
    // ========================
    const [inputDevices, setInputDevices] = useState([]);

    // ========================
    // Modals State
    // ========================
    const [activeModal, setActiveModal] = useState(null); // 'camera', 'manual', 'ai', or null
    const [showReloadModal, setShowReloadModal] = useState(false);
    const [isReloading, setIsReloading] = useState(false);
    const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
    const [originalModalState, setOriginalModalState] = useState({});

    // Derived values
    const { width: resWidth, height: resHeight } = getResolutionDimensions(preferredResolution);

    // Function to fetch camera list and update all state
    const fetchCameraList = useCallback(() => {
        return fetch('/api/cameras/list')
            .then(res => res.json())
            .then(data => {
                // Update input devices list
                if (data.input_devices) {
                    setInputDevices(data.input_devices);
                }

                // Check for primary camera first if inputDeviceIndex is default
                // This logic might be overridden if we set inputDeviceIndex from getPrimaryCamera
                
                // Find current device from the list
                const currentDeviceIndex = data.inputDeviceIndex !== undefined
                    ? String(data.inputDeviceIndex)
                    : inputDeviceIndex;
                const currentDevice = data.input_devices?.find(d =>
                    String(d.index) === String(currentDeviceIndex)
                );

                if (currentDevice) {
                    // Update panel state from device
                    // Only update if not already set by primary camera fetch or user
                    // But here we are fetching list, so we might want to respect current selection
                    
                    // Actually, we update panel state based on selected device always
                    // But if this is initial load, we want primary camera
                    // We'll handle primary camera setting separately in useEffect
                    
                    if (inputDeviceIndex === String(currentDevice.index)) {
                         setPreferredResolution(currentDevice.width && currentDevice.height ? `${currentDevice.width} x ${currentDevice.height}` : '0 x 0');
                         setFps(currentDevice.fps);
                         setFlipHorizontally(currentDevice.flip_horizontal);
                         setFlipVertically(currentDevice.flip_vertical);
                         setRotateDegrees(String(currentDevice.rotate));
                         setBrightness(currentDevice.brightness);
                         setContrast(currentDevice.contrast);
                         setHue(currentDevice.hue);
                         setSaturation(currentDevice.saturation);
                         setSharpness(currentDevice.sharpness);
                         setGamma(currentDevice.gamma);
                         setWhiteBalanceTemperature(currentDevice.white_balance_temperature);
                         setBacklight(currentDevice.backlight);
                         setGain(currentDevice.gain);
                         setFocus(currentDevice.focus);
                         setExposure(currentDevice.exposure);
                         setAutoWhiteBalance(currentDevice.auto_white_balance_temperature);
                         setAutoFocus(currentDevice.auto_focus);
                         setAutoExposure(currentDevice.auto_exposure);
                         setAutoExposure(currentDevice.auto_exposure);
                         
                         // Update Manual Control settings from device
                         if (currentDevice.manual_control) {
                             setManualCropTop((currentDevice.manual_control.crop_top || 0) * 100);
                             setManualCropLeft((currentDevice.manual_control.crop_left || 0) * 100);
                             setManualCropBottom((currentDevice.manual_control.crop_bottom || 0) * 100);
                             setManualCropRight((currentDevice.manual_control.crop_right || 0) * 100);
                             setManualStretchWidth(currentDevice.manual_control.width || 0);
                             setManualStretchHeight(currentDevice.manual_control.height || 0);
                             setManualReticleX(currentDevice.manual_control.static_reticle_x !== undefined ? currentDevice.manual_control.static_reticle_x : 0.5);
                             setManualReticleY(currentDevice.manual_control.static_reticle_y !== undefined ? currentDevice.manual_control.static_reticle_y : 0.5);
                             setManualReticleColor(currentDevice.manual_control.static_reticle_color || '#ff0000cc');
                             setManualReticleSize(currentDevice.manual_control.static_reticle_size !== undefined ? currentDevice.manual_control.static_reticle_size : 1.0);
                         }
                         
                         // Update AI Agent settings from device
                         if (currentDevice.ai_agent) {
                             setAiCropTop((currentDevice.ai_agent.crop_top || 0) * 100);
                             setAiCropLeft((currentDevice.ai_agent.crop_left || 0) * 100);
                             setAiCropBottom((currentDevice.ai_agent.crop_bottom || 0) * 100);
                             setAiCropRight((currentDevice.ai_agent.crop_right || 0) * 100);
                             setAiStretchWidth(currentDevice.ai_agent.width || 0);
                             setAiStretchHeight(currentDevice.ai_agent.height || 0);
                         }
                    }

                    // Update modal tempState if camera modal is open
                    if (activeModal === 'camera') {
                        setTempState(getDeviceStateFromDevice(currentDevice));
                    }
                } else {
                    // Fallback: update from top-level data if available
                    if (data.inputDeviceIndex !== undefined && inputDeviceIndex === '0') setInputDeviceIndex(String(data.inputDeviceIndex));
                    if (data.preferredResolution) setPreferredResolution(data.preferredResolution);
                    if (data.flipHorizontally !== undefined) setFlipHorizontally(data.flipHorizontally);
                    if (data.flipVertically !== undefined) setFlipVertically(data.flipVertically);
                    if (data.rotateDegrees !== undefined) setRotateDegrees(String(data.rotateDegrees));
                }
            })
            .catch(err => console.error("Failed to load camera list:", err));
    }, [inputDeviceIndex, activeModal]);

    // Fetch primary camera on mount
    useEffect(() => {
        fetch('/api/cameras/primary')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.primaryCamera) {
                    setInputDeviceIndex(String(data.primaryCamera.index));
                }
            })
            .catch(err => console.error("Failed to load primary camera:", err))
            .finally(() => {
                // Fetch list after trying to set primary camera
                fetchCameraList();
            });
    }, []); 
    
    // Add inputDeviceIndex to fetchCameraList dependency if we want to refresh when it changes?
    // But fetchCameraList uses inputDeviceIndex. 
    // We called fetchCameraList in finally block of primary camera fetch.
    // Also we have useEffect that calls fetchCameraList on mount.
    // Let's modify the useEffect above.

    // Updated useEffect for initial load
    /* 
    useEffect(() => {
        // First try to get primary camera
        fetch('/api/cameras/primary')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.primaryCamera) {
                    setInputDeviceIndex(String(data.primaryCamera.index));
                }
            })
            .catch(err => console.error("Failed to load primary camera:", err))
            .finally(() => {
                // Then fetch camera list details
                fetchCameraList();
            });
    }, []); 
    */
    // But fetchCameraList depends on inputDeviceIndex. If we change it, does it re-run?
    // Yes if we include it in dependency array of useEffect.
    // But currently we only have `useEffect(() => { fetchCameraList(); }, []);`
    
    // Let's refactor:
    // 1. Initial load: Fetch primary camera.
    // 2. Set inputDeviceIndex.
    // 3. This should trigger a fetch of camera details for that index? 
    //    Or we just call fetchCameraList.
    
    // Actually, `fetchCameraList` depends on `inputDeviceIndex`.
    // If we change `inputDeviceIndex` state, and we want `fetchCameraList` to run with NEW index,
    // we should have `useEffect(() => { fetchCameraList(); }, [fetchCameraList]);` 
    // and `fetchCameraList` has `[inputDeviceIndex]` dependency.
    
    useEffect(() => {
        if (inputDeviceIndex) {
             fetchCameraList();
        }
    }, [fetchCameraList]); 
    // But we need to set initial inputDeviceIndex first.
    
    // Temp state for editing
    const [tempState, setTempState] = useState({});

    // ========================
    // Options
    // ========================
    const rotateOptions = [
        { label: '0', value: '0' },
        { label: '90', value: '90' },
        { label: '180', value: '180' },
        { label: '270', value: '270' }
    ];

    const inputDeviceOptions = inputDevices.map(d => ({
        label: d.name,
        value: String(d.index)
    }));

    // Calculate resolution options based on current selection (modal or main view)
    // If modal is active and we are editing camera, use tempState.inputDeviceIndex
    // Otherwise use the saved inputDeviceIndex
    const currentDeviceIndex = activeModal === 'camera' ? tempState.inputDeviceIndex : inputDeviceIndex;

    const selectedDevice = inputDevices.find(d => String(d.index) === String(currentDeviceIndex));

    let resolutionOptions = [];
    if (selectedDevice && selectedDevice.supported_resolutions && selectedDevice.supported_resolutions.length > 0) {
        resolutionOptions = selectedDevice.supported_resolutions.map(r => ({
            label: r.label,
            value: r.label
        }));
    } else {
        resolutionOptions = [{ label: '0 x 0', value: '0 x 0' }];
    }

    // ========================
    // Handlers
    // ========================
    const getDeviceStateFromDevice = (device) => {
        if (!device) return {};
        return {
            inputDeviceIndex: String(device.index),
            preferredResolution: device.width && device.height ? `${device.width} x ${device.height}` : '0 x 0',
            fps: device.fps,
            flipHorizontally: device.flip_horizontal,
            flipVertically: device.flip_vertical,
            rotateDegrees: String(device.rotate),
            brightness: device.brightness,
            contrast: device.contrast,
            hue: device.hue,
            saturation: device.saturation,
            sharpness: device.sharpness,
            gamma: device.gamma,
            whiteBalanceTemperature: device.white_balance_temperature,
            backlight: device.backlight,
            gain: device.gain,
            focus: device.focus,
            exposure: device.exposure,
            autoWhiteBalance: device.auto_white_balance_temperature,
            autoFocus: device.auto_focus,
            autoExposure: device.auto_exposure
        };
    };

    const openModal = useCallback((modalName) => {
        // Initialize temp state based on modal
        let state = {};
        if (modalName === 'camera') {
            const device = inputDevices.find(d => String(d.index) === String(inputDeviceIndex));
            if (device) {
                state = getDeviceStateFromDevice(device);
            } else {
                // Fallback to current global state
                state.inputDeviceIndex = inputDeviceIndex;
                state.preferredResolution = preferredResolution;
                state.fps = fps;
                state.flipHorizontally = flipHorizontally;
                state.flipVertically = flipVertically;
                state.rotateDegrees = rotateDegrees;
                state.brightness = brightness;
                state.contrast = contrast;
                state.hue = hue;
                state.saturation = saturation;
                state.sharpness = sharpness;
                state.gamma = gamma;
                state.whiteBalanceTemperature = whiteBalanceTemperature;
                state.backlight = backlight;
                state.gain = gain;
                state.focus = focus;
                state.exposure = exposure;
                state.autoWhiteBalance = autoWhiteBalance;
                state.autoFocus = autoFocus;
                state.autoExposure = autoExposure;
            }
        } else if (modalName === 'manual') {
            state.manualCropTop = manualCropTop;
            state.manualCropLeft = manualCropLeft;
            state.manualCropBottom = manualCropBottom;
            state.manualCropRight = manualCropRight;
            state.manualStretchWidth = manualStretchWidth;
            state.manualStretchHeight = manualStretchHeight;
            state.manualReticleX = manualReticleX;
            state.manualReticleY = manualReticleY;
            state.manualReticleColor = manualReticleColor;
            state.manualReticleSize = manualReticleSize;
        } else if (modalName === 'ai') {
            state.aiCropTop = aiCropTop;
            state.aiCropLeft = aiCropLeft;
            state.aiCropBottom = aiCropBottom;
            state.aiCropRight = aiCropRight;
            state.aiStretchWidth = aiStretchWidth;
            state.aiStretchHeight = aiStretchHeight;
        }
        setTempState(state);
        setOriginalModalState(JSON.parse(JSON.stringify(state))); // Deep copy
        setActiveModal(modalName);
    }, [
        inputDevices, // Add inputDevices to dependencies
        inputDeviceIndex, preferredResolution, flipHorizontally, flipVertically, rotateDegrees,
        brightness, contrast, hue, saturation, sharpness, gamma, whiteBalanceTemperature, backlight, gain, focus, exposure,
        autoWhiteBalance, autoFocus, autoExposure,
        manualCropTop, manualCropLeft, manualCropBottom, manualCropRight, manualStretchWidth, manualStretchHeight,
        manualReticleX, manualReticleY, manualReticleColor, manualReticleSize,
        aiCropTop, aiCropLeft, aiCropBottom, aiCropRight, aiStretchWidth, aiStretchHeight
    ]);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setTempState({});
        setOriginalModalState({});
        setShowCancelConfirmModal(false);
    }, []);

    const hasModalChanges = useCallback(() => {
        return JSON.stringify(tempState) !== JSON.stringify(originalModalState);
    }, [tempState, originalModalState]);

    const handleCancelRequest = useCallback(() => {
        if ((activeModal === 'camera' || activeModal === 'manual') && hasModalChanges()) {
            setShowCancelConfirmModal(true);
        } else {
            closeModal();
        }
    }, [activeModal, hasModalChanges, closeModal]);

    const handleCancelConfirm = useCallback(async () => {
        // Revert to original settings if camera modal
        if (activeModal === 'camera' && originalModalState.inputDeviceIndex) {
            // Re-apply original camera settings to backend (Apply without saving)
            try {
                const selectedDevice = inputDevices.find(d => String(d.index) === String(originalModalState.inputDeviceIndex));
                const payload = {
                    index: Number(originalModalState.inputDeviceIndex),
                    name: selectedDevice ? selectedDevice.name : '',
                    width: Number(originalModalState.preferredResolution.split(' x ')[0]),
                    height: Number(originalModalState.preferredResolution.split(' x ')[1]),
                    fps: Number(originalModalState.fps),
                    flip_horizontal: originalModalState.flipHorizontally,
                    flip_vertical: originalModalState.flipVertically,
                    rotate: Number(originalModalState.rotateDegrees),
                    brightness: Number(originalModalState.brightness),
                    contrast: Number(originalModalState.contrast),
                    hue: Number(originalModalState.hue),
                    saturation: Number(originalModalState.saturation),
                    sharpness: Number(originalModalState.sharpness),
                    gamma: Number(originalModalState.gamma),
                    white_balance_temperature: Number(originalModalState.whiteBalanceTemperature),
                    backlight: Number(originalModalState.backlight),
                    gain: Number(originalModalState.gain),
                    focus: Number(originalModalState.focus),
                    exposure: Number(originalModalState.exposure),
                    auto_white_balance_temperature: originalModalState.autoWhiteBalance,
                    auto_focus: originalModalState.autoFocus,
                    auto_exposure: originalModalState.autoExposure,
                    saveToDisk: false
                };

                await fetch('/api/cameras/savecamera', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // Update global state back to original
                setInputDeviceIndex(String(originalModalState.inputDeviceIndex));
            } catch (err) {
                console.error("Failed to revert camera settings:", err);
            }
        } else if (activeModal === 'manual') {
            // Revert manual control settings to original
            try {
                const manualPayload = {
                    index: Number(inputDeviceIndex),
                    crop_top: Number(originalModalState.manualCropTop),
                    crop_left: Number(originalModalState.manualCropLeft),
                    crop_bottom: Number(originalModalState.manualCropBottom),
                    crop_right: Number(originalModalState.manualCropRight),
                    width: Number(originalModalState.manualStretchWidth),
                    height: Number(originalModalState.manualStretchHeight),
                    static_reticle_x: Number(originalModalState.manualReticleX),
                    static_reticle_y: Number(originalModalState.manualReticleY),
                    static_reticle_color: originalModalState.manualReticleColor,
                    static_reticle_size: Number(originalModalState.manualReticleSize),
                    saveToDisk: false
                };

                await fetch('/api/cameras/savemanualcontrol', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(manualPayload)
                });

                // Update local state back to original
                setManualCropTop(Number(originalModalState.manualCropTop));
                setManualCropLeft(Number(originalModalState.manualCropLeft));
                setManualCropBottom(Number(originalModalState.manualCropBottom));
                setManualCropRight(Number(originalModalState.manualCropRight));
                setManualStretchWidth(Number(originalModalState.manualStretchWidth));
                setManualStretchHeight(Number(originalModalState.manualStretchHeight));
                setManualReticleX(Number(originalModalState.manualReticleX));
                setManualReticleY(Number(originalModalState.manualReticleY));
                setManualReticleColor(originalModalState.manualReticleColor);
                setManualReticleSize(Number(originalModalState.manualReticleSize));
            } catch (err) {
                console.error("Failed to revert manual control settings:", err);
            }
        }
        closeModal();
    }, [activeModal, originalModalState, inputDevices, closeModal, inputDeviceIndex]);

    const saveModal = useCallback((saveToDisk = false) => {
        let payload = {};
        if (activeModal === 'camera') {
            const selectedDevice = inputDevices.find(d => String(d.index) === String(tempState.inputDeviceIndex));
            payload = {
                index: Number(tempState.inputDeviceIndex),
                name: selectedDevice ? selectedDevice.name : '',
                width: Number(tempState.preferredResolution.split(' x ')[0]),
                height: Number(tempState.preferredResolution.split(' x ')[1]),
                fps: Number(tempState.fps),
                flip_horizontal: tempState.flipHorizontally,
                flip_vertical: tempState.flipVertically,
                rotate: Number(tempState.rotateDegrees),
                brightness: Number(tempState.brightness),
                contrast: Number(tempState.contrast),
                hue: Number(tempState.hue),
                saturation: Number(tempState.saturation),
                sharpness: Number(tempState.sharpness),
                gamma: Number(tempState.gamma),
                white_balance_temperature: Number(tempState.whiteBalanceTemperature),
                backlight: Number(tempState.backlight),
                gain: Number(tempState.gain),
                focus: Number(tempState.focus),
                exposure: Number(tempState.exposure),
                auto_white_balance_temperature: tempState.autoWhiteBalance,
                auto_focus: tempState.autoFocus,
                auto_exposure: tempState.autoExposure
            };
        }

        if (Object.keys(payload).length > 0) {
            fetch('/api/cameras/savecamera', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, saveToDisk })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        // Refresh camera list
                        fetch('/api/cameras/list')
                            .then(res => res.json())
                            .then(data => {
                                if (data.input_devices) {
                                    setInputDevices(data.input_devices);
                                    // If Apply (saveToDisk=false), refresh current modal values
                                    if (!saveToDisk && activeModal === 'camera') {
                                        const device = data.input_devices.find(d => String(d.index) === String(tempState.inputDeviceIndex));
                                        if (device) {
                                            setTempState(prev => ({
                                                ...prev,
                                                ...getDeviceStateFromDevice(device)
                                            }));
                                        }
                                    }
                                }
                                // Update main panel fields if saved or applied (for selected device)
                                const currentDevice = data.input_devices?.find(d => String(d.index) === String(inputDeviceIndex));
                                if (currentDevice) {
                                    setPreferredResolution(currentDevice.width && currentDevice.height ? `${currentDevice.width} x ${currentDevice.height}` : '0 x 0');
                                    setFps(currentDevice.fps);
                                    setFlipHorizontally(currentDevice.flip_horizontal);
                                    setFlipVertically(currentDevice.flip_vertical);
                                    setRotateDegrees(String(currentDevice.rotate));
                                }
                            });

                        if (saveToDisk) {
                            closeModal();
                        }
                    }
                })
                .catch(err => console.error("Failed to save camera settings:", err));
        } else {
            // For Manual modal, call API and update local state
            if (activeModal === 'manual') {
                const manualPayload = {
                    index: Number(inputDeviceIndex),
                    crop_top: Number(tempState.manualCropTop),
                    crop_left: Number(tempState.manualCropLeft),
                    crop_bottom: Number(tempState.manualCropBottom),
                    crop_right: Number(tempState.manualCropRight),
                    width: Number(tempState.manualStretchWidth),
                    height: Number(tempState.manualStretchHeight),
                    static_reticle_x: Number(tempState.manualReticleX),
                    static_reticle_y: Number(tempState.manualReticleY),
                    static_reticle_color: tempState.manualReticleColor,
                    static_reticle_size: Number(tempState.manualReticleSize),
                    saveToDisk
                };
                
                fetch('/api/cameras/savemanualcontrol', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(manualPayload)
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            // Update local state
                            setManualCropTop(Number(tempState.manualCropTop));
                            setManualCropLeft(Number(tempState.manualCropLeft));
                            setManualCropBottom(Number(tempState.manualCropBottom));
                            setManualCropRight(Number(tempState.manualCropRight));
                            setManualStretchWidth(Number(tempState.manualStretchWidth));
                            setManualStretchHeight(Number(tempState.manualStretchHeight));
                            setManualReticleX(Number(tempState.manualReticleX));
                            setManualReticleY(Number(tempState.manualReticleY));
                            setManualReticleColor(tempState.manualReticleColor);
                            setManualReticleSize(Number(tempState.manualReticleSize));
                            
                            // Refresh camera list to get updated values
                            fetchCameraList();
                            
                            // Only close modal if Save (saveToDisk=true), not on Apply
                            if (saveToDisk) {
                                closeModal();
                            }
                        }
                    })
                    .catch(err => console.error("Failed to save manual control settings:", err));
            } else if (activeModal === 'ai') {
                setAiCropTop(Number(tempState.aiCropTop));
                setAiCropLeft(Number(tempState.aiCropLeft));
                setAiCropBottom(Number(tempState.aiCropBottom));
                setAiCropRight(Number(tempState.aiCropRight));
                setAiStretchWidth(Number(tempState.aiStretchWidth));
                setAiStretchHeight(Number(tempState.aiStretchHeight));
                // Only close modal if Save (saveToDisk=true), not on Apply
                if (saveToDisk) {
                    closeModal();
                }
            } else {
                // For other modals, just close
                closeModal();
            }
        }
    }, [activeModal, tempState, closeModal, inputDeviceIndex, getDeviceStateFromDevice, fetchCameraList, inputDevices]);

    const updateTempState = useCallback((key, value) => {
        setTempState(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleReloadRequest = useCallback(() => {
        setShowReloadModal(true);
    }, []);

    // Force refresh streams when input device changes
    const refreshStreams = useCallback((newDeviceIndex) => {
        // We do this by toggling enabled states momentarily or just by updating the index which triggers re-render
        // But to ensure "stop" and "start", we might need to force a re-mount of Polygon components or
        // update a version key. Here, React's diffing on the `src` prop change is usually enough to 
        // trigger a new request. If we need to explicitly stop, we might need a short timeout.
        // However, the prompt says "stopped... then... started again".
        // The simplest way to force a "stop" in React is to unmount/remount or change key.

        // Let's use a stream version counter to force refresh of all video elements
        setStreamVersion(v => v + 1);
    }, []);

    const [streamVersion, setStreamVersion] = useState(0);

    const onInputDeviceChange = useCallback((val) => {
        const newDevice = inputDevices.find(d => String(d.index) === String(val));
        if (newDevice) {
            setTempState(prev => ({
                ...prev,
                ...getDeviceStateFromDevice(newDevice)
            }));
            // Update global input device index if this is intended to be live immediately?
            // The prompt implies changing "Input Device" in Modal affects "all live feeds".
            // If the user is just editing in modal, usually we wait for "Apply/Save".
            // BUT, if the requirement is "When user changes 'Input Device' ... all live feeds ... should be stopped... then started again with different input device id",
            // it implies immediate effect or effect on the preview in modal + potentially others if they share state?
            // "all live feeds in all polygons (on modal windows and as well in panels)"
            // This suggests global state change.

            // If we are in the modal, we are editing `tempState`.
            // The panel polygons use `inputDeviceIndex` (global state).
            // The modal polygon uses `tempState.inputDeviceIndex`.

            // If the user changes it in the modal, and we want to update ALL panels:
            // 1. We must update the global `inputDeviceIndex` immediately? 
            //    Normally "Edit" implies temporary state until Save.
            //    However, if the prompt asks for immediate effect on "all panels", 
            //    maybe we should update global state or the prompt implies the behavior *after* Apply?
            //    "When user changes 'Input Device' ... all live feeds ... should be stopped"
            //    It refers to the action in the "Modal window".

            // Let's assume for the "Edit Camera" modal, changing device there *previews* it there,
            // but if it affects "all panels", it implies we might need to temporarily switch the global view too?
            // Or maybe the user meant "When saved"?
            // "Update Camera web page -> edit button -> Modal window. When user changes 'Input Device'..."
            // It sounds like the *event* of changing the combo box.

            // If I update `setInputDeviceIndex(val)` here, it updates the background panels too.
            // That seems to match "all live feeds... should be stopped... started again... with different input device id".
            // So we will update both temp and global state? Or just global?
            // If we update global, `tempState` logic might be redundant for this field.
            // Let's update global `inputDeviceIndex` as well to satisfy "all polygons... in panels".

            setInputDeviceIndex(String(val));
            refreshStreams(val);
        } else {
            updateTempState('inputDeviceIndex', val);
        }
    }, [inputDevices, getDeviceStateFromDevice, refreshStreams, updateTempState]);


    const onResolutionChange = useCallback((val) => {
        updateTempState('preferredResolution', val);
        refreshStreams();
    }, [updateTempState, refreshStreams]);

    const handleReloadConfirm = useCallback(() => {
        setIsReloading(true);
        setPreviewEnabled(false);
        setManualPreviewEnabled(false);
        setAiPreviewEnabled(false);

        fetch('/api/reset', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log("Cameras reset successfully");
                    // Refresh camera list and update all components
                    return fetchCameraList();
                }
            })
            .catch(err => console.error("Failed to reset cameras:", err))
            .finally(() => {
                setIsReloading(false);
                setShowReloadModal(false);
            });
    }, [fetchCameraList]);

    // Validation for Manual Modal
    const getManualValidationErrors = () => {
        if (activeModal !== 'manual') return [];
        const errors = [];
        const top = Number(tempState.manualCropTop || 0);
        const left = Number(tempState.manualCropLeft || 0);
        const bottom = Number(tempState.manualCropBottom || 0);
        const right = Number(tempState.manualCropRight || 0);

        if (left + right >= 99) {
            errors.push('Total horizontal crop (Left + Right) cannot exceed 99%');
        }
        if (top + bottom >= 99) {
            errors.push('Total vertical crop (Top + Bottom) cannot exceed 99%');
        }
        return errors;
    };

    // Validation for AI Agent Modal
    const getAiValidationErrors = () => {
        if (activeModal !== 'ai') return [];
        const errors = [];
        const top = Number(tempState.aiCropTop || 0);
        const left = Number(tempState.aiCropLeft || 0);
        const bottom = Number(tempState.aiCropBottom || 0);
        const right = Number(tempState.aiCropRight || 0);

        if (left + right >= 99) {
            errors.push('Total horizontal crop (Left + Right) cannot exceed 99%');
        }
        if (top + bottom >= 99) {
            errors.push('Total vertical crop (Top + Bottom) cannot exceed 99%');
        }
        return errors;
    };

    const manualValidationErrors = getManualValidationErrors();
    const isManualValid = manualValidationErrors.length === 0;

    const aiValidationErrors = getAiValidationErrors();
    const isAiValid = aiValidationErrors.length === 0;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>

                {/* ======================== */}
                {/* Panel 1: Camera */}
                {/* ======================== */}
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Panel
                        title="Camera"
                        headerAction={
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                    label={<img src={reloadIcon} alt="Reload" width="24" height="24" />}
                                    onClick={handleReloadRequest}
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                />
                                <Button
                                    label={<img src={editIcon} alt="Edit" width="24" height="24" />}
                                    onClick={() => openModal('camera')}
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                />
                            </div>
                        }
                    >
                        <ColumnLayout gap="0.75rem">
                            <HorizontalSeparator label="General Setup" fullWidth={true} />
                            <RenderStaticField label="Input Device" value={inputDeviceIndex} />
                            <RenderStaticField label="Resolution" value={preferredResolution} />
                            <RenderStaticField label="FPS" value={fps} />

                            <HorizontalSeparator label="Flip and Rotate" fullWidth={true} />
                            <RenderStaticField label="Flip Horizontally" value={flipHorizontally ? 'Yes' : 'No'} />
                            <RenderStaticField label="Flip Vertically" value={flipVertically ? 'Yes' : 'No'} />
                            <RenderStaticField label="Rotate (degrees)" value={rotateDegrees} />

                            <HorizontalSeparator label="Preview" fullWidth={true} />
                            <Switch
                                label="Enabled"
                                value={previewEnabled}
                                onChange={setPreviewEnabled}
                            />
                            <Polygon
                                key={`cam-prev-${streamVersion}`}
                                style={{ width: '100%', height: 'auto', aspectRatio: '4/3', border: '1px solid #444' }}
                                src={previewEnabled ? `/api/cameras/stream/${inputDeviceIndex}` : cameraOffIcon}
                                stretchMode="fit"
                                mode="viewer"
                                background="#000099"
                                zoomPanEnabled={true}
                            />
                        </ColumnLayout>
                    </Panel>
                </div>

                {/* ======================== */}
                {/* Panel 2: Manual Control - Input Img */}
                {/* ======================== */}
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Panel
                        title="Manual Control - Input Img"
                        headerAction={
                            <Button
                                label={<img src={editIcon} alt="Edit" width="24" height="24" />}
                                onClick={() => openModal('manual')}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                            />
                        }
                    >
                        <ColumnLayout gap="0.75rem">
                            <HorizontalSeparator label="Crop" fullWidth={true} />
                            <RenderStaticField label="Top" value={`${Number(manualCropTop).toFixed(2)}% (${Math.round(manualCropTop * resHeight / 100)} pixels)`} />
                            <RenderStaticField label="Left" value={`${Number(manualCropLeft).toFixed(2)}% (${Math.round(manualCropLeft * resWidth / 100)} pixels)`} />
                            <RenderStaticField label="Bottom" value={`${Number(manualCropBottom).toFixed(2)}% (${Math.round(manualCropBottom * resHeight / 100)} pixels)`} />
                            <RenderStaticField label="Right" value={`${Number(manualCropRight).toFixed(2)}% (${Math.round(manualCropRight * resWidth / 100)} pixels)`} />

                            <HorizontalSeparator label="Stretch" fullWidth={true} />
                            <RenderStaticField label="Width" value={`${manualStretchWidth} pixels`} />
                            <RenderStaticField label="Height" value={`${manualStretchHeight} pixels`} />

                            <HorizontalSeparator label="Preview" fullWidth={true} />
                            <Switch
                                label="Enabled"
                                value={manualPreviewEnabled}
                                onChange={setManualPreviewEnabled}
                            />
                            <Polygon
                                key={`man-prev-${streamVersion}`}
                                style={{ width: '100%', height: 'auto', aspectRatio: '4/3', border: '1px solid #444' }}
                                src={manualPreviewEnabled ? `/api/cameras/stream-manual/${inputDeviceIndex}` : cameraOffIcon}
                                stretchMode="fit"
                                mode="viewer"
                                background="#009900"
                                zoomPanEnabled={true}
                                showReticle={manualPreviewEnabled}
                                reticleX={manualReticleX}
                                reticleY={manualReticleY}
                                reticleColor={manualReticleColor}
                                reticleSize={manualReticleSize}
                            />
                        </ColumnLayout>
                    </Panel>
                </div>

                {/* ======================== */}
                {/* Panel 3: AI Agent - Input Img */}
                {/* ======================== */}
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Panel
                        title="AI Agent - Input Img"
                        headerAction={
                            <Button
                                label={<img src={editIcon} alt="Edit" width="24" height="24" />}
                                onClick={() => openModal('ai')}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                            />
                        }
                    >
                        <ColumnLayout gap="0.75rem">
                            <HorizontalSeparator label="Crop" fullWidth={true} />
                            <RenderStaticField label="Top" value={`${Number(aiCropTop).toFixed(2)}% (${Math.round(aiCropTop * resHeight / 100)} pixels)`} />
                            <RenderStaticField label="Left" value={`${Number(aiCropLeft).toFixed(2)}% (${Math.round(aiCropLeft * resWidth / 100)} pixels)`} />
                            <RenderStaticField label="Bottom" value={`${Number(aiCropBottom).toFixed(2)}% (${Math.round(aiCropBottom * resHeight / 100)} pixels)`} />
                            <RenderStaticField label="Right" value={`${Number(aiCropRight).toFixed(2)}% (${Math.round(aiCropRight * resWidth / 100)} pixels)`} />

                            <HorizontalSeparator label="Stretch" fullWidth={true} />
                            <RenderStaticField label="Width" value={`${aiStretchWidth} pixels`} />
                            <RenderStaticField label="Height" value={`${aiStretchHeight} pixels`} />

                            <HorizontalSeparator label="Preview" fullWidth={true} />
                            <Switch
                                label="Enabled"
                                value={aiPreviewEnabled}
                                onChange={setAiPreviewEnabled}
                            />
                            <Polygon
                                key={`ai-prev-${streamVersion}`}
                                style={{ width: '100%', height: 'auto', aspectRatio: '4/3', border: '1px solid #444' }}
                                src={aiPreviewEnabled ? `/api/cameras/stream-ai/${inputDeviceIndex}` : cameraOffIcon}
                                stretchMode="fit"
                                mode="viewer"
                                background="#990000"
                                zoomPanEnabled={true}
                            />
                        </ColumnLayout>
                    </Panel>
                </div>
            </div>

            {/* ======================== */}
            {/* Modal: Camera */}
            {/* ======================== */}
            {activeModal === 'camera' && (
                <ModalWindow
                    isOpen={true}
                    title="Edit Camera Settings"
                    onOk={() => saveModal(true)}
                    onCancel={handleCancelRequest}
                    okLabel="Save"
                    customFooterButtons={[
                        <Button
                            key="apply"
                            label="Apply"
                            onClick={() => saveModal(false)}
                            color="#3b82f6"
                            style={{ height: '40px', display: 'flex', alignItems: 'center' }}
                        />
                    ]}
                >
                    <ColumnLayout gap="0.75rem">
                        <HorizontalSeparator label="General Setup" fullWidth={true} bleed="1rem" />
                        <ComboBox
                            label="Input Device"
                            items={inputDeviceOptions}
                            value={tempState.inputDeviceIndex}
                            onChange={onInputDeviceChange}
                            labelWidth="160px"
                        />
                        <ComboBox
                            label="Resolution"
                            items={resolutionOptions}
                            value={tempState.preferredResolution}
                            onChange={onResolutionChange}
                            labelWidth="160px"
                        />
                        <Slider
                            label="FPS"
                            value={tempState.fps}
                            onChange={(val) => updateTempState('fps', val)}
                            min={1}
                            max={240}
                            minSlider={1}
                            maxSlider={240}
                            step={1}
                            decimalPlaces={0}
                            allowManualInput={true}
                            labelWidth="160px"
                        />

                        <HorizontalSeparator label="Flip and Rotate" fullWidth={true} bleed="1rem" />
                        <Switch
                            label="Flip Horizontally"
                            value={tempState.flipHorizontally}
                            onChange={(val) => updateTempState('flipHorizontally', val)}
                            labelWidth="160px"
                        />
                        <Switch
                            label="Flip Vertically"
                            value={tempState.flipVertically}
                            onChange={(val) => updateTempState('flipVertically', val)}
                            labelWidth="160px"
                        />
                        <ComboBox
                            label="Rotate (degrees)"
                            items={rotateOptions}
                            value={tempState.rotateDegrees}
                            onChange={(val) => updateTempState('rotateDegrees', val)}
                            labelWidth="160px"
                        />

                        <HorizontalSeparator label="Image Settings" fullWidth={true} bleed="1rem" />
                        <Slider label="Brightness" value={tempState.brightness} onChange={(val) => updateTempState('brightness', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="100px" />
                        <Slider label="Contrast" value={tempState.contrast} onChange={(val) => updateTempState('contrast', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="100px" />
                        <Slider label="Hue" value={tempState.hue} onChange={(val) => updateTempState('hue', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="100px" />
                        <Slider label="Saturation" value={tempState.saturation} onChange={(val) => updateTempState('saturation', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="100px" />
                        <Slider label="Sharpness" value={tempState.sharpness} onChange={(val) => updateTempState('sharpness', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="100px" />
                        <Slider label="Gamma" value={tempState.gamma} onChange={(val) => updateTempState('gamma', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="100px" />
                        <Slider label="Gain" value={tempState.gain} onChange={(val) => updateTempState('gain', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="100px" />
                        <Slider label="Backlight" value={tempState.backlight} onChange={(val) => updateTempState('backlight', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="100px" />

                        <HorizontalSeparator label="Controls" fullWidth={true} bleed="1rem" />
                        <Switch label="Auto White Balance" value={tempState.autoWhiteBalance} onChange={(val) => updateTempState('autoWhiteBalance', val)} labelWidth="160px" />
                        <Slider label="White Balance Temp" value={tempState.whiteBalanceTemperature} onChange={(val) => updateTempState('whiteBalanceTemperature', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="160px" />

                        <Switch label="Auto Focus" value={tempState.autoFocus} onChange={(val) => updateTempState('autoFocus', val)} labelWidth="160px" />
                        <Slider label="Focus" value={tempState.focus} onChange={(val) => updateTempState('focus', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="160px" />

                        <Switch label="Auto Exposure" value={tempState.autoExposure} onChange={(val) => updateTempState('autoExposure', val)} labelWidth="160px" />
                        <Slider label="Exposure" value={tempState.exposure} onChange={(val) => updateTempState('exposure', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="160px" />

                        <HorizontalSeparator label="Preview" fullWidth={true} bleed="1rem" />
                        <Polygon
                            key={`modal-cam-prev-${streamVersion}`}
                            style={{ width: '100%', height: 'auto', aspectRatio: '4/3', border: '1px solid #444' }}
                            src={previewEnabled ? `/api/cameras/stream/${tempState.inputDeviceIndex}` : cameraOffIcon}
                            stretchMode="fit"
                            mode="viewer"
                            background="#000099"
                            zoomPanEnabled={true}
                        />
                    </ColumnLayout>
                </ModalWindow>
            )}

            {/* ======================== */}
            {/* Modal: Manual Control */}
            {/* ======================== */}
            {activeModal === 'manual' && (
                <ModalWindow
                    isOpen={true}
                    title="Edit Manual Control Settings"
                    onOk={() => saveModal(true)}
                    onCancel={handleCancelRequest}
                    okLabel="Save"
                    validationErrors={manualValidationErrors}
                    okDisabled={!isManualValid}
                    customFooterButtons={[
                        <Button
                            key="apply"
                            label="Apply"
                            onClick={() => saveModal(false)}
                            color={!isManualValid ? '#94a3b8' : '#3b82f6'}
                            disabled={!isManualValid}
                            style={{ height: '40px', display: 'flex', alignItems: 'center' }}
                        />
                    ]}
                >
                    <ColumnLayout gap="0.75rem">
                        <HorizontalSeparator label="Crop" fullWidth={true} bleed="1rem" />
                        <Slider
                            label={`Top % (${Math.round((tempState.manualCropTop || 0) * resHeight / 100)} pixels)`}
                            value={tempState.manualCropTop}
                            onChange={(val) => updateTempState('manualCropTop', val)}
                            min={0}
                            max={100}
                            step={0.01}
                            decimalPlaces={2}
                            allowManualInput={true}
                            labelWidth="150px"
                        />
                        <Slider
                            label={`Left % (${Math.round((tempState.manualCropLeft || 0) * resWidth / 100)} pixels)`}
                            value={tempState.manualCropLeft}
                            onChange={(val) => updateTempState('manualCropLeft', val)}
                            min={0}
                            max={100}
                            step={0.01}
                            decimalPlaces={2}
                            allowManualInput={true}
                            labelWidth="150px"
                        />
                        <Slider
                            label={`Bottom % (${Math.round((tempState.manualCropBottom || 0) * resHeight / 100)} pixels)`}
                            value={tempState.manualCropBottom}
                            onChange={(val) => updateTempState('manualCropBottom', val)}
                            min={0}
                            max={100}
                            step={0.01}
                            decimalPlaces={2}
                            allowManualInput={true}
                            labelWidth="150px"
                        />
                        <Slider
                            label={`Right % (${Math.round((tempState.manualCropRight || 0) * resWidth / 100)} pixels)`}
                            value={tempState.manualCropRight}
                            onChange={(val) => updateTempState('manualCropRight', val)}
                            min={0}
                            max={100}
                            step={0.01}
                            decimalPlaces={2}
                            allowManualInput={true}
                            labelWidth="150px"
                        />

                        <HorizontalSeparator label="Stretch" fullWidth={true} bleed="1rem" />
                        <NumericInput
                            label="Width"
                            value={tempState.manualStretchWidth}
                            onChange={(val) => updateTempState('manualStretchWidth', val)}
                            min={0}
                            max={8192}
                            step={1}
                            decimalPlaces={0}
                            labelWidth="150px"
                            labelPosition="left"
                        />
                        <NumericInput
                            label="Height"
                            value={tempState.manualStretchHeight}
                            onChange={(val) => updateTempState('manualStretchHeight', val)}
                            min={0}
                            max={4608}
                            step={1}
                            decimalPlaces={0}
                            labelWidth="150px"
                            labelPosition="left"
                        />

                        <HorizontalSeparator label="Static Reticle" fullWidth={true} bleed="1rem" />
                        <Slider
                            label="X coord"
                            value={tempState.manualReticleX}
                            onChange={(val) => updateTempState('manualReticleX', val)}
                            min={0}
                            max={1}
                            step={0.0001}
                            decimalPlaces={4}
                            allowManualInput={true}
                            labelWidth="150px"
                        />
                        <Slider
                            label="Y coord"
                            value={tempState.manualReticleY}
                            onChange={(val) => updateTempState('manualReticleY', val)}
                            min={0}
                            max={1}
                            step={0.0001}
                            decimalPlaces={4}
                            allowManualInput={true}
                            labelWidth="150px"
                        />
                        <ColorPicker
                            label="Color"
                            color={tempState.manualReticleColor}
                            onChange={(val) => updateTempState('manualReticleColor', val)}
                            showAlpha={true}
                            labelWidth="150px"
                        />
                        <Slider
                            label="Size"
                            value={tempState.manualReticleSize}
                            onChange={(val) => updateTempState('manualReticleSize', val)}
                            min={0.1}
                            max={10}
                            step={0.1}
                            decimalPlaces={1}
                            allowManualInput={true}
                            labelWidth="150px"
                        />

                        <HorizontalSeparator label="Preview" fullWidth={true} bleed="1rem" />
                        <Polygon
                            key={`modal-man-prev-${streamVersion}`}
                            style={{ width: '100%', height: 'auto', aspectRatio: '4/3', border: '1px solid #444' }}
                            src={manualPreviewEnabled ? `/api/cameras/stream-manual/${inputDeviceIndex}` : cameraOffIcon}
                            stretchMode="fit"
                            mode="viewer"
                            background="#009900"
                            zoomPanEnabled={true}
                            showReticle={manualPreviewEnabled}
                            reticleX={tempState.manualReticleX}
                            reticleY={tempState.manualReticleY}
                            reticleColor={tempState.manualReticleColor}
                            reticleSize={tempState.manualReticleSize}
                        />
                    </ColumnLayout>
                </ModalWindow>
            )}

            {/* ======================== */}
            {/* Modal: AI Agent */}
            {/* ======================== */}
            {activeModal === 'ai' && (
                <ModalWindow
                    isOpen={true}
                    title="Edit AI Agent Settings"
                    onOk={() => saveModal(true)}
                    onCancel={closeModal}
                    okLabel="Save"
                    validationErrors={aiValidationErrors}
                    okDisabled={!isAiValid}
                    customFooterButtons={[
                        <Button
                            key="apply"
                            label="Apply"
                            onClick={() => saveModal(false)}
                            color={!isAiValid ? '#94a3b8' : '#3b82f6'}
                            disabled={!isAiValid}
                            style={{ height: '40px', display: 'flex', alignItems: 'center' }}
                        />
                    ]}
                >
                    <ColumnLayout gap="0.75rem">
                        <HorizontalSeparator label="Crop" fullWidth={true} bleed="1rem" />
                        <Slider
                            label={`Top % (${Math.round((tempState.aiCropTop || 0) * resHeight / 100)} pixels)`}
                            value={tempState.aiCropTop}
                            onChange={(val) => updateTempState('aiCropTop', val)}
                            min={0}
                            max={100}
                            step={0.01}
                            decimalPlaces={2}
                            allowManualInput={true}
                            labelWidth="150px"
                        />
                        <Slider
                            label={`Left % (${Math.round((tempState.aiCropLeft || 0) * resWidth / 100)} pixels)`}
                            value={tempState.aiCropLeft}
                            onChange={(val) => updateTempState('aiCropLeft', val)}
                            min={0}
                            max={100}
                            step={0.01}
                            decimalPlaces={2}
                            allowManualInput={true}
                            labelWidth="150px"
                        />
                        <Slider
                            label={`Bottom % (${Math.round((tempState.aiCropBottom || 0) * resHeight / 100)} pixels)`}
                            value={tempState.aiCropBottom}
                            onChange={(val) => updateTempState('aiCropBottom', val)}
                            min={0}
                            max={100}
                            step={0.01}
                            decimalPlaces={2}
                            allowManualInput={true}
                            labelWidth="150px"
                        />
                        <Slider
                            label={`Right % (${Math.round((tempState.aiCropRight || 0) * resWidth / 100)} pixels)`}
                            value={tempState.aiCropRight}
                            onChange={(val) => updateTempState('aiCropRight', val)}
                            min={0}
                            max={100}
                            step={0.01}
                            decimalPlaces={2}
                            allowManualInput={true}
                            labelWidth="150px"
                        />

                        <HorizontalSeparator label="Stretch" fullWidth={true} bleed="1rem" />
                        <NumericInput
                            label="Width"
                            value={tempState.aiStretchWidth}
                            onChange={(val) => updateTempState('aiStretchWidth', val)}
                            min={0}
                            max={8192}
                            step={1}
                            decimalPlaces={0}
                            labelWidth="150px"
                            labelPosition="left"
                        />
                        <NumericInput
                            label="Height"
                            value={tempState.aiStretchHeight}
                            onChange={(val) => updateTempState('aiStretchHeight', val)}
                            min={0}
                            max={4608}
                            step={1}
                            decimalPlaces={0}
                            labelWidth="150px"
                            labelPosition="left"
                        />

                        <HorizontalSeparator label="Preview" fullWidth={true} bleed="1rem" />
                        <Polygon
                            key={`modal-ai-prev-${streamVersion}`}
                            style={{ width: '100%', height: 'auto', aspectRatio: '4/3', border: '1px solid #444' }}
                            src={aiPreviewEnabled ? `/api/cameras/stream-ai/${inputDeviceIndex}` : cameraOffIcon}
                            stretchMode="fit"
                            mode="viewer"
                            background="#990000"
                            zoomPanEnabled={true}
                        />
                    </ColumnLayout>
                </ModalWindow>
            )}

            {/* ======================== */}
            {/* Modal: Reload Confirmation */}
            {/* ======================== */}
            {showReloadModal && (
                <ModalWindow
                    isOpen={true}
                    title="Confirm Reload"
                    onOk={handleReloadConfirm}
                    onCancel={() => !isReloading && setShowReloadModal(false)}
                    okLabel={isReloading ? "Saving..." : "Yes"}
                    okDisabled={isReloading}
                    cancelLabel="No"
                >
                    <div style={{ padding: '1rem' }}>
                        Do you want to refresh list of camera devices? This operation may take several seconds.
                    </div>
                </ModalWindow>
            )}

            {/* ======================== */}
            {/* Modal: Cancel Confirmation */}
            {/* ======================== */}
            {showCancelConfirmModal && (
                <ModalWindow
                    isOpen={true}
                    title="Unsaved Changes"
                    onOk={handleCancelConfirm}
                    onCancel={() => setShowCancelConfirmModal(false)}
                    okLabel="Yes"
                    cancelLabel="No"
                >
                    <div style={{ padding: '1rem' }}>
                        Modifications you have made will be lost. Do you want to continue?
                    </div>
                </ModalWindow>
            )}
        </div>
    );
};

export default Cameras;
