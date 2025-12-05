import React, { useState, useEffect } from 'react';
import ModalWindow from './components/ModalWindow';
import MultiSwitch from './components/MultiSwitch';
import Slider from './components/Slider';
import HorizontalSeparator from './components/HorizontalSeparator';
import { getHotZoneSettings, saveHotZoneSettings } from './lib/api';

// Default hot zone settings
const defaultHotZoneSettings = {
    units: 'cm',
    centerPole: {
        micStickRadius: 50,
        height: 150,
        yDistanceFromArmPoles: 100
    },
    armPoles: {
        height: 150,
        xDistance: 100
    },
    arms: {
        leftArmMinLength: 50,
        leftArmMaxLength: 150,
        rightArmMinLength: 50,
        rightArmMaxLength: 150
    }
};

const HotZoneEditModal = ({ isOpen, onClose, onSave }) => {
    const [settings, setSettings] = useState(defaultHotZoneSettings);
    const [tempSettings, setTempSettings] = useState(defaultHotZoneSettings);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Unit options
    const unitOptions = [
        { label: 'cm', value: 'cm' },
        { label: 'in', value: 'in' }
    ];

    // Load settings when modal opens
    useEffect(() => {
        if (isOpen) {
            loadSettings();
        }
    }, [isOpen]);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const data = await getHotZoneSettings();
            // Merge with defaults to ensure all properties exist
            const mergedSettings = {
                ...defaultHotZoneSettings,
                ...data,
                centerPole: { ...defaultHotZoneSettings.centerPole, ...data?.centerPole },
                armPoles: { ...defaultHotZoneSettings.armPoles, ...data?.armPoles },
                arms: { ...defaultHotZoneSettings.arms, ...data?.arms }
            };
            setSettings(mergedSettings);
            setTempSettings(mergedSettings);
        } catch (error) {
            console.error('Failed to load hot zone settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const validateSettings = () => {
        const errors = [];
        if (tempSettings.arms.leftArmMinLength >= tempSettings.arms.leftArmMaxLength) {
            errors.push('Left Arm Min Length must be less than Left Arm Max Length');
        }
        if (tempSettings.arms.rightArmMinLength >= tempSettings.arms.rightArmMaxLength) {
            errors.push('Right Arm Min Length must be less than Right Arm Max Length');
        }
        return errors;
    };

    const handleSave = async () => {
        const errors = validateSettings();
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            setIsSaving(true);
            await saveHotZoneSettings(tempSettings);
            setSettings({ ...tempSettings });
            if (onSave) {
                onSave(tempSettings);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save hot zone settings:', error);
            setValidationErrors([error.message || 'Failed to save settings. Please try again.']);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTempSettings({ ...settings });
        setValidationErrors([]);
        onClose();
    };

    const updateUnits = (value) => {
        setTempSettings(prev => ({ ...prev, units: value }));
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }
    };

    const updateCenterPole = (field, value) => {
        setTempSettings(prev => ({
            ...prev,
            centerPole: { ...prev.centerPole, [field]: value }
        }));
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }
    };

    const updateArmPoles = (field, value) => {
        setTempSettings(prev => ({
            ...prev,
            armPoles: { ...prev.armPoles, [field]: value }
        }));
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }
    };

    const updateArms = (field, value) => {
        setTempSettings(prev => ({
            ...prev,
            arms: { ...prev.arms, [field]: value }
        }));
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }
    };

    const unit = tempSettings.units;

    return (
        <ModalWindow
            isOpen={isOpen}
            title="Hot Zone"
            onOk={handleSave}
            onCancel={handleCancel}
            okLabel={isSaving ? "Saving..." : "Save"}
            okDisabled={isSaving || isLoading}
            validationErrors={validationErrors}
        >
            {isLoading ? (
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    Loading...
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Units:</span>
                        <MultiSwitch
                            options={unitOptions}
                            value={tempSettings.units}
                            onChange={updateUnits}
                        />
                    </div>

                    <HorizontalSeparator label="Center Pole" fullWidth={true} bleed="1rem" />
                    <Slider
                        label={`Mic Stick Radius (${unit})`}
                        value={tempSettings.centerPole.micStickRadius}
                        onChange={(value) => updateCenterPole('micStickRadius', value)}
                        min={10}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`Height (${unit})`}
                        value={tempSettings.centerPole.height}
                        onChange={(value) => updateCenterPole('height', value)}
                        min={0}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`Y Distance from Arm Poles (${unit})`}
                        value={tempSettings.centerPole.yDistanceFromArmPoles}
                        onChange={(value) => updateCenterPole('yDistanceFromArmPoles', value)}
                        min={-100}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />

                    <HorizontalSeparator label="Arm Poles" fullWidth={true} bleed="1rem" />
                    <Slider
                        label={`Height (${unit})`}
                        value={tempSettings.armPoles.height}
                        onChange={(value) => updateArmPoles('height', value)}
                        min={0}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`X Distance (${unit})`}
                        value={tempSettings.armPoles.xDistance}
                        onChange={(value) => updateArmPoles('xDistance', value)}
                        min={10}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />

                    <HorizontalSeparator label="Arms" fullWidth={true} bleed="1rem" />
                    <Slider
                        label={`Left Arm Min Length (${unit})`}
                        value={tempSettings.arms.leftArmMinLength}
                        onChange={(value) => updateArms('leftArmMinLength', value)}
                        min={1}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`Left Arm Max Length (${unit})`}
                        value={tempSettings.arms.leftArmMaxLength}
                        onChange={(value) => updateArms('leftArmMaxLength', value)}
                        min={1}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`Right Arm Min Length (${unit})`}
                        value={tempSettings.arms.rightArmMinLength}
                        onChange={(value) => updateArms('rightArmMinLength', value)}
                        min={1}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`Right Arm Max Length (${unit})`}
                        value={tempSettings.arms.rightArmMaxLength}
                        onChange={(value) => updateArms('rightArmMaxLength', value)}
                        min={1}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                </div>
            )}
        </ModalWindow>
    );
};

export default HotZoneEditModal;
