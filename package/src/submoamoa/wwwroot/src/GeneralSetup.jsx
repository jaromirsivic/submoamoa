import React, { useState, useEffect } from 'react';
import Panel from './components/Panel';
import Button from './components/Button';
import ModalWindow from './components/ModalWindow';
import Textbox from './components/Textbox';
import NumericInput from './components/NumericInput';
import MultiSwitch from './components/MultiSwitch';
import ColumnLayout from './components/ColumnLayout';
import StaticText from './components/StaticText';
import HorizontalSeparator from './components/HorizontalSeparator';

import { getGeneralSettings, saveGeneralSettings } from './lib/api';
import editIcon from './assets/icons/edit.svg';

const GeneralSetup = () => {
    const [settings, setSettings] = useState({
        controllerSetup: {
            controller: 'localhost',
            remoteHost: '192.168.0.1',
            remotePort: 8888
        }
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSettings, setEditingSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load initial data from API
    useEffect(() => {
        const loadSettings = async () => {
            try {
                setIsLoading(true);
                const data = await getGeneralSettings();
                if (data && data.controllerSetup) {
                    setSettings(data);
                }
            } catch (error) {
                console.error('Failed to load general settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleEdit = () => {
        const settingsCopy = JSON.parse(JSON.stringify(settings));
        setEditingSettings(settingsCopy);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSettings(null);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await saveGeneralSettings(editingSettings);
            console.log('General settings saved successfully');
            setSettings(editingSettings);
            handleCloseModal();
        } catch (error) {
            console.error('Error saving settings:', error);
            alert(`Failed to save settings: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const updateControllerSetupField = (field, value) => {
        setEditingSettings(prev => ({
            ...prev,
            controllerSetup: {
                ...prev.controllerSetup,
                [field]: value
            }
        }));
    };

    const getControllerDisplayName = (controller) => {
        return controller === 'localhost' ? 'Localhost Raspberry Pi' : 'Remote pigpio daemon';
    };

    const isRemoteMode = editingSettings?.controllerSetup?.controller === 'remote';

    // Show loading state
    if (isLoading) {
        return (
            <div className="page-container">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                    <StaticText text="Loading settings..." />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Panel
                    style={{
                        flex: '1 1 400px',
                        minWidth: '300px',
                        maxWidth: '600px'
                    }}
                    title="Controller Setup"
                    headerAction={
                        <Button
                            label={<img src={editIcon} alt="Edit" width="24" height="24" />}
                            onClick={handleEdit}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        />
                    }
                >
                    <ColumnLayout gap="0.5rem">
                        <StaticText text={<>Controller: <span style={{ fontWeight: 'bold' }}>{getControllerDisplayName(settings.controllerSetup.controller)}</span></>} />
                        <StaticText text={<>Remote Host: <span style={{ fontWeight: 'bold' }}>{settings.controllerSetup.remoteHost}</span></>} />
                        <StaticText text={<>Remote Port: <span style={{ fontWeight: 'bold' }}>{settings.controllerSetup.remotePort}</span></>} />
                    </ColumnLayout>
                </Panel>
            </div>

            {editingSettings && (
                <ModalWindow
                    isOpen={isModalOpen}
                    title="Edit Controller Setup"
                    onOk={handleSave}
                    onCancel={handleCloseModal}
                    okLabel={isSaving ? "Saving..." : "Save"}
                    okDisabled={isSaving}
                >
                    <ColumnLayout gap="1rem">
                        <HorizontalSeparator label="Controller Setup" fullWidth={true} bleed="1rem" />
                        <ColumnLayout gap="0.5rem">
                            <div className="responsive-input-container" style={{ width: '100%' }}>
                                <span style={{ whiteSpace: 'nowrap' }}>Controller:</span>
                                <MultiSwitch
                                    options={[
                                        { label: 'Localhost Raspberry Pi', value: 'localhost' },
                                        { label: 'Remote pigpio daemon', value: 'remote' }
                                    ]}
                                    value={editingSettings.controllerSetup.controller}
                                    onChange={(val) => updateControllerSetupField('controller', val)}
                                    orientation="horizontal"
                                />
                            </div>

                            <Textbox
                                label="Remote Host"
                                value={editingSettings.controllerSetup.remoteHost}
                                onChange={(val) => updateControllerSetupField('remoteHost', val)}
                                disabled={!isRemoteMode}
                            />

                            <NumericInput
                                label="Remote Port"
                                labelPosition="left"
                                value={editingSettings.controllerSetup.remotePort}
                                onChange={(val) => updateControllerSetupField('remotePort', val)}
                                min={0}
                                max={65535}
                                disabled={!isRemoteMode}
                            />
                        </ColumnLayout>
                    </ColumnLayout>
                </ModalWindow>
            )}
        </div>
    );
};

export default GeneralSetup;
