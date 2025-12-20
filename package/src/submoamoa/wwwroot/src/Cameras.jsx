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
import cameraIcon from './assets/icons/camera.svg';

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
    // State: Backend Data
    // ========================
    const [inputDevices, setInputDevices] = useState([]);

    // ========================
    // Modals State
    // ========================
    const [activeModal, setActiveModal] = useState(null); // 'camera', 'manual', 'ai', or null

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
        label: d.label,
        value: String(d.value)
    }));

    // Calculate resolution options based on current selection (modal or main view)
    // If modal is active and we are editing camera, use tempState.inputDeviceIndex
    // Otherwise use the saved inputDeviceIndex
    const currentDeviceIndex = activeModal === 'camera' ? tempState.inputDeviceIndex : inputDeviceIndex;

    const selectedDevice = inputDevices.find(d => String(d.value) === String(currentDeviceIndex));

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
    const openModal = useCallback((modalName) => {
        // Initialize temp state based on modal
        const state = {};
        if (modalName === 'camera') {
            state.inputDeviceIndex = inputDeviceIndex;
            state.preferredResolution = preferredResolution;
            state.acceptedResolution = acceptedResolution;
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

    const saveModal = useCallback(() => {
        if (activeModal === 'camera') {
            setInputDeviceIndex(tempState.inputDeviceIndex);
            setPreferredResolution(tempState.preferredResolution);
            setAcceptedResolution(tempState.acceptedResolution);
            setFlipHorizontally(tempState.flipHorizontally);
            setFlipVertically(tempState.flipVertically);
            setRotateDegrees(tempState.rotateDegrees);
            setBrightness(tempState.brightness);
            setContrast(tempState.contrast);
            setHue(tempState.hue);
            setSaturation(tempState.saturation);
            setSharpness(tempState.sharpness);
            setGamma(tempState.gamma);
            setWhiteBalanceTemperature(tempState.whiteBalanceTemperature);
            setBacklight(tempState.backlight);
            setGain(tempState.gain);
            setFocus(tempState.focus);
            setExposure(tempState.exposure);
            setAutoWhiteBalance(tempState.autoWhiteBalance);
            setAutoFocus(tempState.autoFocus);
            setAutoExposure(tempState.autoExposure);
        } else if (activeModal === 'manual') {
            setManualCropTop(tempState.manualCropTop);
            setManualCropLeft(tempState.manualCropLeft);
            setManualCropBottom(tempState.manualCropBottom);
            setManualCropRight(tempState.manualCropRight);
            setManualStretchWidth(tempState.manualStretchWidth);
            setManualStretchHeight(tempState.manualStretchHeight);
        } else if (activeModal === 'ai') {
            setAiCropTop(tempState.aiCropTop);
            setAiCropLeft(tempState.aiCropLeft);
            setAiCropBottom(tempState.aiCropBottom);
            setAiCropRight(tempState.aiCropRight);
            setAiStretchWidth(tempState.aiStretchWidth);
            setAiStretchHeight(tempState.aiStretchHeight);
        }
        closeModal();
    }, [activeModal, tempState, closeModal]);

    const updateTempState = useCallback((key, value) => {
        setTempState(prev => ({ ...prev, [key]: value }));
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
                            <Button
                                label={<img src={editIcon} alt="Edit" width="24" height="24" />}
                                onClick={() => openModal('camera')}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                            />
                        }
                    >
                        <ColumnLayout gap="0.75rem">
                            <HorizontalSeparator label="General Setup" fullWidth={true} />
                            <RenderStaticField label="Input Device" value={inputDeviceIndex} />
                            <RenderStaticField label="Resolution" value={preferredResolution} />
                            <RenderStaticField label="Accepted Resolution" value={acceptedResolution} />

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
                                src={!previewEnabled ? cameraIcon : undefined}
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
                    onOk={saveModal}
                    onCancel={closeModal}
                    okLabel="Save"
                >
                    <ColumnLayout gap="0.75rem">
                        <HorizontalSeparator label="General Setup" fullWidth={true} bleed="1rem" />
                        <ComboBox
                            label="Input Device"
                            items={inputDeviceOptions}
                            value={tempState.inputDeviceIndex}
                            onChange={(val) => updateTempState('inputDeviceIndex', val)}
                            labelWidth="160px"
                        />
                        <ComboBox
                            label="Resolution"
                            items={resolutionOptions}
                            value={tempState.preferredResolution}
                            onChange={(val) => updateTempState('preferredResolution', val)}
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
        </div>
    );
};

export default Cameras;
