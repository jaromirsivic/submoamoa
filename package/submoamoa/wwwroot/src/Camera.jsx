import React, { useState } from 'react';
import Panel from './components/Panel';
import Button from './components/Button';
import ComboBox from './components/ComboBox';
import StaticText from './components/StaticText';
import NumericInput from './components/NumericInput';
import Slider from './components/Slider';
import Switch from './components/Switch';
import ColumnLayout from './components/ColumnLayout';
import HorizontalSeparator from './components/HorizontalSeparator';
import ColorPicker from './components/ColorPicker';
import ModalWindow from './components/ModalWindow';
import editIcon from './assets/icons/edit.svg';

const Camera = () => {
    // State for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Camera settings state
    const [cameraSettings, setCameraSettings] = useState({
        source: 'cam1',
        flipHorizontally: false,
        flipVertically: false,
        rotate: '0',
        cropLeft: 0,
        cropTop: 0,
        cropRight: 0,
        cropBottom: 0,
        resizeEnabled: true,
        resizeWidth: 640,
        resizeHeight: 480,
        showReticle: true,
        reticleX: 50,
        reticleY: 50,
        reticleColor: '#ff0000cc',
        reticleSize: 1
    });

    // Temp state for modal editing
    const [tempSettings, setTempSettings] = useState({ ...cameraSettings });

    // Source options
    const sourceOptions = [
        { label: 'Camera 1', value: 'cam1' },
        { label: 'Camera 2', value: 'cam2' },
        { label: 'USB Webcam', value: 'usb1' }
    ];

    // Rotation options
    const rotateOptions = [
        { label: '0°', value: '0' },
        { label: '90°', value: '90' },
        { label: '180°', value: '180' },
        { label: '270°', value: '270' }
    ];

    const handleEditClick = () => {
        setTempSettings({ ...cameraSettings });
        setIsModalOpen(true);
    };

    const handleModalOk = () => {
        setCameraSettings({ ...tempSettings });
        setIsModalOpen(false);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
    };

    const updateTempSetting = (key, value) => {
        setTempSettings(prev => ({ ...prev, [key]: value }));
    };

    // Get display text for source
    const getSourceLabel = (value) => {
        const option = sourceOptions.find(o => o.value === value);
        return option ? option.label : value;
    };

    // Get display text for rotation
    const getRotateLabel = (value) => {
        const option = rotateOptions.find(o => o.value === value);
        return option ? option.label : value;
    };

    // Bold label style
    const boldLabelStyle = { fontWeight: 'bold' };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
                {/* Panel 1: Camera */}
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Panel
                        title="Camera"
                        headerAction={<Button label={<img src={editIcon} alt="Edit" width="24" height="24" />} onClick={handleEditClick} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} />}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <ColumnLayout gap="0.5rem">
                                <StaticText text={<>Camera Source: <span style={boldLabelStyle}>{getSourceLabel(cameraSettings.source)}</span></>} />

                                <HorizontalSeparator label="Flip, Rotate and Crop" fullWidth={true} />
                                <StaticText text={<>Flip Horizontally: <span style={boldLabelStyle}>{cameraSettings.flipHorizontally ? 'Yes' : 'No'}</span></>} />
                                <StaticText text={<>Flip Vertically: <span style={boldLabelStyle}>{cameraSettings.flipVertically ? 'Yes' : 'No'}</span></>} />
                                <StaticText text={<>Rotate: <span style={boldLabelStyle}>{getRotateLabel(cameraSettings.rotate)}</span></>} />
                                <StaticText text={<>Crop Left (%): <span style={boldLabelStyle}>{cameraSettings.cropLeft}</span></>} />
                                <StaticText text={<>Crop Top (%): <span style={boldLabelStyle}>{cameraSettings.cropTop}</span></>} />
                                <StaticText text={<>Crop Right (%): <span style={boldLabelStyle}>{cameraSettings.cropRight}</span></>} />
                                <StaticText text={<>Crop Bottom (%): <span style={boldLabelStyle}>{cameraSettings.cropBottom}</span></>} />

                                <HorizontalSeparator label="Resize" fullWidth={true} />
                                <StaticText text={<>Enabled: <span style={boldLabelStyle}>{cameraSettings.resizeEnabled ? 'Yes' : 'No'}</span></>} />
                                <StaticText text={<>Width (px): <span style={boldLabelStyle}>{cameraSettings.resizeWidth}</span></>} />
                                <StaticText text={<>Height (px): <span style={boldLabelStyle}>{cameraSettings.resizeHeight}</span></>} />

                                <HorizontalSeparator label="Reticle" fullWidth={true} />
                                <StaticText text={<>Show Reticle: <span style={boldLabelStyle}>{cameraSettings.showReticle ? 'Yes' : 'No'}</span></>} />
                                <StaticText text={<>X (%): <span style={boldLabelStyle}>{cameraSettings.reticleX}</span></>} />
                                <StaticText text={<>Y (%): <span style={boldLabelStyle}>{cameraSettings.reticleY}</span></>} />
                                <ColorPicker
                                    label="Color:"
                                    color={cameraSettings.reticleColor}
                                    disabled={true}
                                    showAlpha={true}
                                />
                                <StaticText text={<>Size: <span style={boldLabelStyle}>{cameraSettings.reticleSize}</span></>} />
                            </ColumnLayout>
                        </div>
                    </Panel>
                </div>

                {/* Panel 2: Crop and Size (keeping existing) */}
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Panel
                        title="Crop and Size"
                        headerAction={<Button label={<img src={editIcon} alt="Edit" width="24" height="24" />} onClick={() => { }} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} />}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <ColumnLayout gap="0.25rem">
                                {/* Crop Controls Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <HorizontalSeparator label="Crop Controls" fullWidth={true} />
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                                        <ColumnLayout gap="0.25rem">
                                            <StaticText text="Crop Top (px): 0" />
                                            <StaticText text="Crop Bottom (px): 0" />
                                            <StaticText text="Crop Left (px): 0" />
                                            <StaticText text="Crop Right (px): 0" />
                                        </ColumnLayout>
                                    </div>
                                </div>

                                {/* New Dimensions Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <HorizontalSeparator label="New Dimensions" fullWidth={true} />
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                                        <ColumnLayout gap="0.25rem">
                                            <StaticText text="New Width (px): 1920" />
                                            <StaticText text="New Height (px): 1080" />
                                        </ColumnLayout>
                                    </div>
                                </div>

                                {/* Center Point Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <HorizontalSeparator label="Center Point" fullWidth={true} />
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                                        <ColumnLayout gap="0.25rem">
                                            <Switch
                                                label="Enabled"
                                                value={true}
                                                onChange={() => { }}
                                            />
                                            <NumericInput
                                                label="Position X"
                                                value={320}
                                                onChange={() => { }}
                                            />
                                            <NumericInput
                                                label="Position Y"
                                                value={240}
                                                onChange={() => { }}
                                            />
                                        </ColumnLayout>
                                    </div>
                                </div>
                            </ColumnLayout>
                        </div>
                    </Panel>
                </div>

                {/* Panel 3: AI Attention Area */}
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Panel
                        title="AI Attention Area"
                        headerAction={<Button label={<img src={editIcon} alt="Edit" width="24" height="24" />} onClick={() => { }} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} />}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <ColumnLayout gap="0.25rem">
                                <Switch
                                    label="Use masked area for AI object detection"
                                    value={false}
                                    onChange={() => { }}
                                />
                            </ColumnLayout>
                        </div>
                    </Panel>
                </div>
            </div>

            {/* Modal Window for editing Camera settings */}
            <ModalWindow
                isOpen={isModalOpen}
                title="Camera"
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okLabel="Save"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <ComboBox
                        label="Camera Source"
                        items={sourceOptions}
                        value={tempSettings.source}
                        onChange={(value) => updateTempSetting('source', value)}
                    />

                    <HorizontalSeparator label="Flip, Rotate and Crop" fullWidth={true} bleed="1rem" />
                    <Switch
                        label="Flip Horizontally"
                        value={tempSettings.flipHorizontally}
                        onChange={(value) => updateTempSetting('flipHorizontally', value)}
                    />
                    <Switch
                        label="Flip Vertically"
                        value={tempSettings.flipVertically}
                        onChange={(value) => updateTempSetting('flipVertically', value)}
                    />
                    <ComboBox
                        label="Rotate"
                        items={rotateOptions}
                        value={tempSettings.rotate}
                        onChange={(value) => updateTempSetting('rotate', value)}
                    />
                    <Slider
                        label="Crop Left (%)"
                        value={tempSettings.cropLeft}
                        onChange={(value) => updateTempSetting('cropLeft', value)}
                        min={0}
                        max={100}
                        step={0.5}
                        allowManualInput={true}
                    />
                    <Slider
                        label="Crop Top (%)"
                        value={tempSettings.cropTop}
                        onChange={(value) => updateTempSetting('cropTop', value)}
                        min={0}
                        max={100}
                        step={0.5}
                        allowManualInput={true}
                    />
                    <Slider
                        label="Crop Right (%)"
                        value={tempSettings.cropRight}
                        onChange={(value) => updateTempSetting('cropRight', value)}
                        min={0}
                        max={100}
                        step={0.5}
                        allowManualInput={true}
                    />
                    <Slider
                        label="Crop Bottom (%)"
                        value={tempSettings.cropBottom}
                        onChange={(value) => updateTempSetting('cropBottom', value)}
                        min={0}
                        max={100}
                        step={0.5}
                        allowManualInput={true}
                    />

                    <HorizontalSeparator label="Resize" fullWidth={true} bleed="1rem" />
                    <Switch
                        label="Enabled"
                        value={tempSettings.resizeEnabled}
                        onChange={(value) => updateTempSetting('resizeEnabled', value)}
                    />
                    <Slider
                        label="Width (px)"
                        value={tempSettings.resizeWidth}
                        onChange={(value) => updateTempSetting('resizeWidth', value)}
                        min={0}
                        max={3840}
                        step={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label="Height (px)"
                        value={tempSettings.resizeHeight}
                        onChange={(value) => updateTempSetting('resizeHeight', value)}
                        min={0}
                        max={2160}
                        step={1}
                        allowManualInput={true}
                    />

                    <HorizontalSeparator label="Reticle" fullWidth={true} bleed="1rem" />
                    <Switch
                        label="Show Reticle"
                        value={tempSettings.showReticle}
                        onChange={(value) => updateTempSetting('showReticle', value)}
                    />
                    <Slider
                        label="X (%)"
                        value={tempSettings.reticleX}
                        onChange={(value) => updateTempSetting('reticleX', value)}
                        min={0}
                        max={100}
                        step={0.5}
                        allowManualInput={true}
                    />
                    <Slider
                        label="Y (%)"
                        value={tempSettings.reticleY}
                        onChange={(value) => updateTempSetting('reticleY', value)}
                        min={0}
                        max={100}
                        step={0.5}
                        allowManualInput={true}
                    />
                    <ColorPicker
                        label="Color"
                        color={tempSettings.reticleColor}
                        onChange={(value) => updateTempSetting('reticleColor', value)}
                        showAlpha={true}
                    />
                    <Slider
                        label="Size"
                        value={tempSettings.reticleSize}
                        onChange={(value) => updateTempSetting('reticleSize', value)}
                        min={0.25}
                        max={5}
                        step={0.25}
                        allowManualInput={true}
                    />
                </div>
            </ModalWindow>
        </div>
    );
};

export default Camera;
