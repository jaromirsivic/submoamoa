import React from 'react';
import Panel from './components/Panel';
import Button from './components/Button';
import ComboBox from './components/ComboBox';
import StaticText from './components/StaticText';
import NumericInput from './components/NumericInput';
import Switch from './components/Switch';
import ColumnLayout from './components/ColumnLayout';
import RowLayout from './components/RowLayout';
import HorizontalSeparator from './components/HorizontalSeparator';
import editIcon from './assets/icons/edit.svg';

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
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
                {/* Panel 1: General Setup */}
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Panel
                        title="General Setup"
                        headerAction={<Button label={<img src={editIcon} alt="Edit" width="24" height="24" />} onClick={() => handleApply('General')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} />}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <ColumnLayout gap="0.25rem">
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
                        </div>
                    </Panel>
                </div>

                {/* Panel 2: Crop and Size */}
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Panel
                        title="Crop and Size"
                        headerAction={<Button label={<img src={editIcon} alt="Edit" width="24" height="24" />} onClick={() => handleApply('Crop and Size')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} />}
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
                        headerAction={<Button label={<img src={editIcon} alt="Edit" width="24" height="24" />} onClick={() => handleApply('AI Attention Area')} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} />}
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
        </div>
    );
};

export default Camera;
