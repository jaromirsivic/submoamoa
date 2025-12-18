import React, { useState, useCallback } from 'react';
import Panel from './components/Panel';
import Button from './components/Button';
import ComboBox from './components/ComboBox';
import Textbox from './components/Textbox';
import Switch from './components/Switch';
import ColumnLayout from './components/ColumnLayout';
import HorizontalSeparator from './components/HorizontalSeparator';
import Polygon from './components/Polygon';
import ModalWindow from './components/ModalWindow';
import StaticText from './components/StaticText';
import editIcon from './assets/icons/edit.svg';

/**
 * Camera settings page with three panels:
 * 1. Camera - General settings, flip/rotate, and camera preview
 * 2. Manual Control - Input Img - Crop and stretch settings for manual control
 * 3. AI Agent - Input Img - Crop, stretch, and attention area settings for AI
 */
const Camera = () => {
    // ========================
    // State: Camera Panel
    // ========================
    const [inputDeviceIndex, setInputDeviceIndex] = useState('0');
    const [preferredResolution, setPreferredResolution] = useState('1920 x 1080');
    const [acceptedResolution, setAcceptedResolution] = useState('1920 x 1080');
    const [flipHorizontally, setFlipHorizontally] = useState(false);
    const [flipVertically, setFlipVertically] = useState(false);
    const [rotateDegrees, setRotateDegrees] = useState('0');

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
    const [attentionAreaEnabled, setAttentionAreaEnabled] = useState(false);
    const [attentionAreaPolygons, setAttentionAreaPolygons] = useState([]);

    // ========================
    // Modals State
    // ========================
    const [activeModal, setActiveModal] = useState(null); // 'camera', 'manual', 'ai', or null
    
    // Temp state for editing
    const [tempState, setTempState] = useState({});

    // ========================
    // Rotation Options
    // ========================
    const rotateOptions = [
        { label: '0', value: '0' },
        { label: '90', value: '90' },
        { label: '180', value: '180' },
        { label: '270', value: '270' }
    ];

    // ========================
    // Handlers
    // ========================
    const openModal = (modalName) => {
        // Initialize temp state based on modal
        const state = {};
        if (modalName === 'camera') {
            state.inputDeviceIndex = inputDeviceIndex;
            state.preferredResolution = preferredResolution;
            state.acceptedResolution = acceptedResolution;
            state.flipHorizontally = flipHorizontally;
            state.flipVertically = flipVertically;
            state.rotateDegrees = rotateDegrees;
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
            state.attentionAreaEnabled = attentionAreaEnabled;
            // For polygons, we use the main state directly or handle it separately if needed.
            // Since polygon editing is interactive, we might want to edit it "live" or in a separate way.
            // For now, let's keep polygon editing out of the modal or include it if requested.
            // The prompt says "appropriate input controls in the window". 
            // Since Attention Area is complex (Polygon), editing it inside a modal might be cramped.
            // But let's assume we can enable/disable it in modal. 
            // The Polygon editor itself is usually on the main page for better UX, but let's see.
        }
        setTempState(state);
        setActiveModal(modalName);
    };

    const closeModal = () => {
        setActiveModal(null);
        setTempState({});
    };

    const saveModal = () => {
        if (activeModal === 'camera') {
            setInputDeviceIndex(tempState.inputDeviceIndex);
            setPreferredResolution(tempState.preferredResolution);
            setAcceptedResolution(tempState.acceptedResolution);
            setFlipHorizontally(tempState.flipHorizontally);
            setFlipVertically(tempState.flipVertically);
            setRotateDegrees(tempState.rotateDegrees);
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
            setAttentionAreaEnabled(tempState.attentionAreaEnabled);
        }
        closeModal();
    };

    const updateTempState = (key, value) => {
        setTempState(prev => ({ ...prev, [key]: value }));
    };

    const handleShowFullScreenCamera = useCallback(() => {
        console.log('Show full screen camera preview');
    }, []);

    const handleShowFullScreenManual = useCallback(() => {
        console.log('Show full screen manual control preview');
    }, []);

    const handleShowFullScreenAI = useCallback(() => {
        console.log('Show full screen AI agent preview');
    }, []);

    const handleAttentionAreaPolygonsChange = useCallback((polygons) => {
        setAttentionAreaPolygons(polygons);
    }, []);

    // ========================
    // Styles
    // ========================
    const previewContainerStyle = {
        width: '100%',
        height: '200px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '0.5rem'
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-end'
    };

    const boldTextStyle = { fontWeight: 'bold' };

    // Helper to render static text field
    const RenderStaticField = ({ label, value }) => (
        <StaticText text={<>{label}: <span style={boldTextStyle}>{value}</span></>} />
    );

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
                            <RenderStaticField label="Input Device Index" value={inputDeviceIndex} />
                            <RenderStaticField label="Preferred resolution" value={preferredResolution} />
                            <RenderStaticField label="Accepted Resolution" value={acceptedResolution} />

                            <HorizontalSeparator label="Flip and Rotate" fullWidth={true} />
                            <RenderStaticField label="Flip Horizontally" value={flipHorizontally ? 'Yes' : 'No'} />
                            <RenderStaticField label="Flip Vertically" value={flipVertically ? 'Yes' : 'No'} />
                            <RenderStaticField label="Rotate (degrees)" value={rotateDegrees} />

                            <HorizontalSeparator label="Preview" fullWidth={true} />
                            <div style={previewContainerStyle}>
                                <Polygon
                                    mode="viewer"
                                    background="#f8f8f8"
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                            <div style={buttonContainerStyle}>
                                <Button
                                    label="Show Full Screen"
                                    onClick={handleShowFullScreenCamera}
                                />
                            </div>
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
                            <div style={previewContainerStyle}>
                                <Polygon
                                    mode="viewer"
                                    background="#f8f8f8"
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                            <div style={buttonContainerStyle}>
                                <Button
                                    label="Show Full Screen"
                                    onClick={handleShowFullScreenManual}
                                />
                            </div>
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

                            <HorizontalSeparator label="Attention Area" fullWidth={true} />
                            <RenderStaticField label="Attention Area Enabled" value={attentionAreaEnabled ? 'Yes' : 'No'} />
                            <div style={previewContainerStyle}>
                                <Polygon
                                    mode={attentionAreaEnabled ? 'designer' : 'viewer'}
                                    background="#f8f8f8"
                                    style={{ width: '100%', height: '100%' }}
                                    polygons={attentionAreaPolygons}
                                    onChange={handleAttentionAreaPolygonsChange}
                                    borderColor="#ff6600"
                                    fillColor="#ff660033"
                                />
                            </div>
                            <div style={buttonContainerStyle}>
                                <Button
                                    label="Show Full Screen"
                                    onClick={handleShowFullScreenAI}
                                />
                            </div>
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
                        <HorizontalSeparator label="General Setup" fullWidth={true} />
                        <Textbox
                            label="Input Device Index"
                            value={tempState.inputDeviceIndex}
                            onChange={(val) => updateTempState('inputDeviceIndex', val)}
                        />
                        <Textbox
                            label="Preferred resolution"
                            value={tempState.preferredResolution}
                            onChange={(val) => updateTempState('preferredResolution', val)}
                        />
                        <Textbox
                            label="Accepted Resolution"
                            value={tempState.acceptedResolution}
                            onChange={(val) => updateTempState('acceptedResolution', val)}
                            disabled={true}
                        />

                        <HorizontalSeparator label="Flip and Rotate" fullWidth={true} />
                        <Switch
                            label="Flip Horizontally"
                            value={tempState.flipHorizontally}
                            onChange={(val) => updateTempState('flipHorizontally', val)}
                        />
                        <Switch
                            label="Flip Vertically"
                            value={tempState.flipVertically}
                            onChange={(val) => updateTempState('flipVertically', val)}
                        />
                        <ComboBox
                            label="Rotate (degrees)"
                            items={rotateOptions}
                            value={tempState.rotateDegrees}
                            onChange={(val) => updateTempState('rotateDegrees', val)}
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
                        <HorizontalSeparator label="Crop" fullWidth={true} />
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

                        <HorizontalSeparator label="Stretch" fullWidth={true} />
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
                        <HorizontalSeparator label="Crop" fullWidth={true} />
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

                        <HorizontalSeparator label="Stretch" fullWidth={true} />
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

                        <HorizontalSeparator label="Attention Area" fullWidth={true} />
                        <Switch
                            label="Attention Area Enabled"
                            value={tempState.attentionAreaEnabled}
                            onChange={(val) => updateTempState('attentionAreaEnabled', val)}
                        />
                    </ColumnLayout>
                </ModalWindow>
            )}
        </div>
    );
};

export default Camera;
