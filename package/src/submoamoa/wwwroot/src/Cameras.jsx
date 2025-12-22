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
import Polygon from './components/Polygon';
import editIcon from './assets/icons/edit.svg';
import reloadIcon from './assets/icons/reload.svg';
import cameraOffIcon from './assets/icons/cameraOff.svg';

const boldTextStyle = { fontWeight: 'bold' };

// Helper to render static text field - defined outside component
const RenderStaticField = ({ label, value }) => (
    <StaticText text={<>{label}: <span style={boldTextStyle}>{value}</span></>} />
);

/**
 * Cameras settings page (simplified version of Camera page without previews)
 */
const Cameras = () => {
    // ========================
    // State: Camera Panel
    // ========================
    const [inputDeviceIndex, setInputDeviceIndex] = useState('0');
    const [preferredResolution, setPreferredResolution] = useState('1920 x 1080');
    const [acceptedResolution, setAcceptedResolution] = useState('1920 x 1080');
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
    const [manualCropTop, setManualCropTop] = useState('0% (0 pixels)');
    const [manualCropLeft, setManualCropLeft] = useState('0% (0 pixels)');
    const [manualCropBottom, setManualCropBottom] = useState('0% (0 pixels)');
    const [manualCropRight, setManualCropRight] = useState('0% (0 pixels)');
    const [manualStretchWidth, setManualStretchWidth] = useState('640 pixels');
    const [manualStretchHeight, setManualStretchHeight] = useState('480 pixels');

    // ========================
    // State: AI Agent - Input Img Panel
    // ========================
    const [aiCropTop, setAiCropTop] = useState('0% (0 pixels)');
    const [aiCropLeft, setAiCropLeft] = useState('0% (0 pixels)');
    const [aiCropBottom, setAiCropBottom] = useState('0% (0 pixels)');
    const [aiCropRight, setAiCropRight] = useState('0% (0 pixels)');
    const [aiStretchWidth, setAiStretchWidth] = useState('640 pixels');
    const [aiStretchHeight, setAiStretchHeight] = useState('480 pixels');

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

    useEffect(() => {
        fetch('/api/cameras/list')
            .then(res => res.json())
            .then(data => {
                // Update settings from backend
                if (data.inputDeviceIndex !== undefined) setInputDeviceIndex(String(data.inputDeviceIndex));
                if (data.preferredResolution) setPreferredResolution(data.preferredResolution);
                if (data.acceptedResolution) setAcceptedResolution(data.acceptedResolution);
                if (data.flipHorizontally !== undefined) setFlipHorizontally(data.flipHorizontally);
                if (data.flipVertically !== undefined) setFlipVertically(data.flipVertically);
                if (data.rotateDegrees !== undefined) setRotateDegrees(String(data.rotateDegrees));

                // Update other properties if present (assuming backend sends them flattened or we map them)
                // For now, based on instructions, just loading device list and general settings.
                // If specific camera properties (brightness etc) are needed from backend, we might need a separate call 
                // or they should be part of the response for the *current* camera. 
                // The prompt says "Backend should return all properties of the Camera class stored in the settings.json camera -> general section."
                // And "Create a list of those values... and incorporate this structure into the message".

                if (data.input_devices) {
                    setInputDevices(data.input_devices);
                }
            })
            .catch(err => console.error("Failed to load camera list:", err));
    }, []);

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
            acceptedResolution: device.width && device.height ? `${device.width} x ${device.height}` : '0 x 0',
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
                state.acceptedResolution = acceptedResolution;
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
        } else if (modalName === 'ai') {
            state.aiCropTop = aiCropTop;
            state.aiCropLeft = aiCropLeft;
            state.aiCropBottom = aiCropBottom;
            state.aiCropRight = aiCropRight;
            state.aiStretchWidth = aiStretchWidth;
            state.aiStretchHeight = aiStretchHeight;
        }
        setTempState(state);
        setActiveModal(modalName);
    }, [
        inputDevices, // Add inputDevices to dependencies
        inputDeviceIndex, preferredResolution, acceptedResolution, flipHorizontally, flipVertically, rotateDegrees,
        brightness, contrast, hue, saturation, sharpness, gamma, whiteBalanceTemperature, backlight, gain, focus, exposure,
        autoWhiteBalance, autoFocus, autoExposure,
        manualCropTop, manualCropLeft, manualCropBottom, manualCropRight, manualStretchWidth, manualStretchHeight,
        aiCropTop, aiCropLeft, aiCropBottom, aiCropRight, aiStretchWidth, aiStretchHeight
    ]);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setTempState({});
    }, []);

    const saveModal = useCallback((saveToDisk = false) => {
        let payload = {};
        if (activeModal === 'camera') {
            payload = {
                index: Number(tempState.inputDeviceIndex),
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
            // For other modals (manual, ai), just close for now as per previous logic (or add logic if needed)
            // Assuming requirement only specified Camera modal for now for save/apply logic
            if (activeModal !== 'camera') {
                 closeModal();
            }
        }
    }, [activeModal, tempState, closeModal, inputDeviceIndex, getDeviceStateFromDevice]);

    const updateTempState = useCallback((key, value) => {
        setTempState(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleReloadRequest = useCallback(() => {
        setShowReloadModal(true);
    }, []);

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
                }
            })
            .catch(err => console.error("Failed to reset cameras:", err))
            .finally(() => {
                setIsReloading(false);
                setShowReloadModal(false);
            });
    }, []);

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
                                style={{ width: '100%', height: 'auto', aspectRatio: '4/3', border: '1px solid #444' }}
                                src={previewEnabled ? `/api/cameras/stream/${inputDeviceIndex}` : cameraOffIcon}
                                stretchMode="fit"
                                mode="viewer"
                                background="#222"
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
                            <RenderStaticField label="Top" value={manualCropTop} />
                            <RenderStaticField label="Left" value={manualCropLeft} />
                            <RenderStaticField label="Bottom" value={manualCropBottom} />
                            <RenderStaticField label="Right" value={manualCropRight} />

                            <HorizontalSeparator label="Stretch" fullWidth={true} />
                            <RenderStaticField label="Width" value={manualStretchWidth} />
                            <RenderStaticField label="Height" value={manualStretchHeight} />

                            <HorizontalSeparator label="Preview" fullWidth={true} />
                            <Switch
                                label="Enabled"
                                value={manualPreviewEnabled}
                                onChange={setManualPreviewEnabled}
                            />
                            <Polygon
                                style={{ width: '100%', height: 'auto', aspectRatio: '4/3', border: '1px solid #444' }}
                                src={manualPreviewEnabled ? `/api/cameras/stream-manual/${inputDeviceIndex}` : cameraOffIcon}
                                stretchMode="fit"
                                mode="viewer"
                                background="#222"
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
                            <RenderStaticField label="Top" value={aiCropTop} />
                            <RenderStaticField label="Left" value={aiCropLeft} />
                            <RenderStaticField label="Bottom" value={aiCropBottom} />
                            <RenderStaticField label="Right" value={aiCropRight} />

                            <HorizontalSeparator label="Stretch" fullWidth={true} />
                            <RenderStaticField label="Width" value={aiStretchWidth} />
                            <RenderStaticField label="Height" value={aiStretchHeight} />

                            <HorizontalSeparator label="Preview" fullWidth={true} />
                            <Switch
                                label="Enabled"
                                value={aiPreviewEnabled}
                                onChange={setAiPreviewEnabled}
                            />
                            <Polygon
                                style={{ width: '100%', height: 'auto', aspectRatio: '4/3', border: '1px solid #444' }}
                                src={aiPreviewEnabled ? `/api/cameras/stream-ai/${inputDeviceIndex}` : cameraOffIcon}
                                stretchMode="fit"
                                mode="viewer"
                                background="#222"
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
                    onCancel={closeModal}
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
                            onChange={(val) => {
                                const newDevice = inputDevices.find(d => String(d.index) === String(val));
                                if (newDevice) {
                                    setTempState(prev => ({
                                        ...prev,
                                        ...getDeviceStateFromDevice(newDevice)
                                    }));
                                } else {
                                    updateTempState('inputDeviceIndex', val);
                                }
                            }}
                            labelWidth="160px"
                        />
                        <ComboBox
                            label="Resolution"
                            items={resolutionOptions}
                            value={tempState.preferredResolution}
                            onChange={(val) => updateTempState('preferredResolution', val)}
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
                        {/* Only show WB slider if Auto is off? User didn't specify logic, but usually good UX. I'll just show all for now as per instructions "Add all Camera properties" unless I want to be fancy. Prompt said "Add all Camera properties...". I'll show it always to be safe. */}
                        <Slider label="White Balance Temp" value={tempState.whiteBalanceTemperature} onChange={(val) => updateTempState('whiteBalanceTemperature', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="160px" />

                        <Switch label="Auto Focus" value={tempState.autoFocus} onChange={(val) => updateTempState('autoFocus', val)} labelWidth="160px" />
                        <Slider label="Focus" value={tempState.focus} onChange={(val) => updateTempState('focus', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="160px" />

                        <Switch label="Auto Exposure" value={tempState.autoExposure} onChange={(val) => updateTempState('autoExposure', val)} labelWidth="160px" />
                        <Slider label="Exposure" value={tempState.exposure} onChange={(val) => updateTempState('exposure', val)} min={-1000} max={1000} minSlider={-256} maxSlider={256} step={1} decimalPlaces={1} allowManualInput={true} labelWidth="160px" />
                        
                        <HorizontalSeparator label="Preview" fullWidth={true} bleed="1rem" />
                        <Polygon
                            style={{ width: '100%', height: 'auto', aspectRatio: '4/3', border: '1px solid #444' }}
                            src={`/api/cameras/stream/${tempState.inputDeviceIndex}`}
                            stretchMode="fit"
                            mode="viewer"
                            background="#222"
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
                    onOk={saveModal}
                    onCancel={closeModal}
                    okLabel="Save"
                >
                    <ColumnLayout gap="0.75rem">
                        <HorizontalSeparator label="Crop" fullWidth={true} bleed="1rem" />
                        <Textbox
                            label="Top"
                            value={tempState.manualCropTop}
                            onChange={(val) => updateTempState('manualCropTop', val)}
                        />
                        <Textbox
                            label="Left"
                            value={tempState.manualCropLeft}
                            onChange={(val) => updateTempState('manualCropLeft', val)}
                        />
                        <Textbox
                            label="Bottom"
                            value={tempState.manualCropBottom}
                            onChange={(val) => updateTempState('manualCropBottom', val)}
                        />
                        <Textbox
                            label="Right"
                            value={tempState.manualCropRight}
                            onChange={(val) => updateTempState('manualCropRight', val)}
                        />

                        <HorizontalSeparator label="Stretch" fullWidth={true} bleed="1rem" />
                        <Textbox
                            label="Width"
                            value={tempState.manualStretchWidth}
                            onChange={(val) => updateTempState('manualStretchWidth', val)}
                        />
                        <Textbox
                            label="Height"
                            value={tempState.manualStretchHeight}
                            onChange={(val) => updateTempState('manualStretchHeight', val)}
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
                    onOk={saveModal}
                    onCancel={closeModal}
                    okLabel="Save"
                >
                    <ColumnLayout gap="0.75rem">
                        <HorizontalSeparator label="Crop" fullWidth={true} bleed="1rem" />
                        <Textbox
                            label="Top"
                            value={tempState.aiCropTop}
                            onChange={(val) => updateTempState('aiCropTop', val)}
                        />
                        <Textbox
                            label="Left"
                            value={tempState.aiCropLeft}
                            onChange={(val) => updateTempState('aiCropLeft', val)}
                        />
                        <Textbox
                            label="Bottom"
                            value={tempState.aiCropBottom}
                            onChange={(val) => updateTempState('aiCropBottom', val)}
                        />
                        <Textbox
                            label="Right"
                            value={tempState.aiCropRight}
                            onChange={(val) => updateTempState('aiCropRight', val)}
                        />

                        <HorizontalSeparator label="Stretch" fullWidth={true} bleed="1rem" />
                        <Textbox
                            label="Width"
                            value={tempState.aiStretchWidth}
                            onChange={(val) => updateTempState('aiStretchWidth', val)}
                        />
                        <Textbox
                            label="Height"
                            value={tempState.aiStretchHeight}
                            onChange={(val) => updateTempState('aiStretchHeight', val)}
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
        </div>
    );
};

export default Cameras;
