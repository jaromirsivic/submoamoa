import React from 'react';
import Panel from './components/Panel';
import Button from './components/Button';
import ComboBox from './components/ComboBox';
import StaticText from './components/StaticText';
import NumericInput from './components/NumericInput';
import Switch from './components/Switch';
import ColumnLayout from './components/ColumnLayout';
import RowLayout from './components/RowLayout';

const Camera = () => {
    // Mock data for source options
    const sourceOptions = [
        { label: 'Camera 1', value: 'cam1' },
        { label: 'Camera 2', value: 'cam2' }
    ];

    const handleApply = (panelName) => {
        console.log(`Applying changes for ${panelName}`);
        // Add logic to save settings for the specific panel
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Panel 1: General Settings */}
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Panel title="Camera Setup - General">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ColumnLayout gap="1rem">
                                <ComboBox
                                    label="Source (Device)"
                                    items={sourceOptions}
                                    value="cam1"
                                    onChange={() => { }}
                                />
                                <StaticText text="Width (px): 1920" />
                                <StaticText text="Height (px): 1080" />
                                <StaticText text="FPS: 30" />
                            </ColumnLayout>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <Button label="Apply" onClick={() => handleApply('General')} />
                            </div>
                        </div>
                    </Panel>
                </div>

                {/* Panel 2: Manual Controls */}
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Panel title="Camera Setup - Manual Control">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ColumnLayout gap="1.5rem">
                                {/* Crop Controls Section */}
                                <fieldset style={{ border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '4px' }}>
                                    <legend style={{ padding: '0 0.5rem', color: '#666', fontWeight: '500' }}>Crop Controls</legend>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                                        <ColumnLayout gap="1rem">
                                            <NumericInput label="Crop Top (px)" value={0} onChange={() => { }} />
                                            <NumericInput label="Crop Bottom (px)" value={0} onChange={() => { }} />
                                            <NumericInput label="Crop Left (px)" value={0} onChange={() => { }} />
                                            <NumericInput label="Crop Right (px)" value={0} onChange={() => { }} />
                                        </ColumnLayout>
                                    </div>
                                </fieldset>

                                {/* New Dimensions Section */}
                                <fieldset style={{ border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '4px' }}>
                                    <legend style={{ padding: '0 0.5rem', color: '#666', fontWeight: '500' }}>New Dimensions</legend>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                                        <ColumnLayout gap="1rem">
                                            <NumericInput label="New Width (px)" value={1920} onChange={() => { }} />
                                            <NumericInput label="New Height (px)" value={1080} onChange={() => { }} />
                                        </ColumnLayout>
                                    </div>
                                </fieldset>
                            </ColumnLayout>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <Button label="Apply" onClick={() => handleApply('Manual Control')} />
                            </div>
                        </div>
                    </Panel>
                </div>

                {/* Panel 3: AI Detection */}
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Panel title="Camera Setup - AI Detection">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ColumnLayout gap="1rem">
                                <Switch
                                    label="Use masked area for AI object detection"
                                    value={false}
                                    onChange={() => { }}
                                />
                            </ColumnLayout>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <Button label="Apply" onClick={() => handleApply('AI Detection')} />
                            </div>
                        </div>
                    </Panel>
                </div>
            </div>
        </div>
    );
};

export default Camera;
