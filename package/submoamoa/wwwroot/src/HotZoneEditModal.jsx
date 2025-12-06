import React, { useState, useEffect } from 'react';
import ModalWindow from './components/ModalWindow';
import MultiSwitch from './components/MultiSwitch';
import Slider from './components/Slider';
import HorizontalSeparator from './components/HorizontalSeparator';
import { getHotZoneSettings, saveHotZoneSettings } from './lib/api';
import { generateHotZoneSceneObjects, validateHotZoneSettings } from './lib/HotZoneCloudPointsGenerator';

// Default hot zone settings
const defaultHotZoneSettings = {
    units: 'cm',
    computationQuality: 15,
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

const HotZoneEditModal = ({ isOpen, onClose, onSave, onPreview }) => {
    const [settings, setSettings] = useState(defaultHotZoneSettings);
    const [tempSettings, setTempSettings] = useState(defaultHotZoneSettings);
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
            // Trigger initial preview? Maybe not needed if we open with current settings which usually matches scene.
        } catch (error) {
            console.error('Failed to load hot zone settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getValidationErrors = () => {
        const errors = [];
        if (tempSettings.arms.leftArmMinLength >= tempSettings.arms.leftArmMaxLength) {
            errors.push('Left Arm Min Length must be less than Left Arm Max Length');
        }
        if (tempSettings.arms.rightArmMinLength >= tempSettings.arms.rightArmMaxLength) {
            errors.push('Right Arm Min Length must be less than Right Arm Max Length');
        }

        // Strict business validation
        const isValid = validateHotZoneSettings(tempSettings);
        if (!isValid) {
            errors.push("Invalid Hot Zone Settings. With this setup the motors will not be able to move from fully retracted position to fully extended position. Please adjust the hot zone settings.");
        }

        return errors;
    };

    const getValidationWarnings = () => {
        const warnings = [];
        // Removed the business validation from warnings as it is now an error.
        return warnings;
    };

    const handleSave = async () => {
        const errors = getValidationErrors();
        if (errors.length > 0) {
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
            alert(error.message || 'Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTempSettings({ ...settings });
        // Revert preview to saved settings
        if (onPreview) {
            onPreview(settings);
        }
        onClose();
    };

    const updateUnits = (value) => {
        const newSettings = { ...tempSettings, units: value };
        setTempSettings(newSettings);
        if (onPreview) onPreview(newSettings);
    };

    // Helpers to update specific nested properties and trigger preview
    // We need to recreate the whole object for preview

    const applyPreview = (newSettings) => {
        if (onPreview) onPreview(newSettings);
    };

    const updateCenterPole = (field, value) => {
        setTempSettings(prev => {
            const next = {
                ...prev,
                centerPole: { ...prev.centerPole, [field]: value }
            };
            return next; // State update is enough for React to re-render, but preview needs immediate data or effect
        });
    };

    // Actually, state setter callback is not good for side-effects.
    // We should compute next state first.

    const handleSliderChange = (section, field, value) => {
        setTempSettings(prev => {
            if (section === 'root') {
                return { ...prev, [field]: value };
            }
            return {
                ...prev,
                [section]: { ...prev[section], [field]: value }
            };
        });
    };

    const handleSliderAfterChange = (section, field, value) => {
        // Construct the new settings object based on current tempSettings
        // Note: tempSettings might be stale inside closure if we just called setTempSettings?
        // Actually, since Slider calls onChange (updates state) and then later onAfterChange (e.g. on mouse up),
        // by the time onAfterChange fires, `tempSettings` in this render cycle should be the updated one IF the component re-rendered?
        // Wait, onAfterChange fires immediately after updateValue in mouseMove loop if dragging?
        // No, onAfterChange in Slider fires on MouseUp.
        // During dragging, onChange fires, updates state, re-renders component.
        // So when MouseUp happens, `tempSettings` should be current.

        // HOWEVER, `handleSliderAfterChange` is created on each render.
        // So when it is called, `tempSettings` is the value from the render where the callback was created.
        // Since we re-render on every drag step, the callback passed to onAfterChange will have the latest `tempSettings` if we use the one from that render.
        // BUT, onAfterChange receives the FINAL value.
        // We can just construct the new settings using that value + the other current settings.

        const newSettings = { ...tempSettings };
        if (section === 'root') {
            newSettings[field] = value;
        } else {
            newSettings[section] = { ...tempSettings[section], [field]: value };
        }

        applyPreview(newSettings);
    };

    const unit = tempSettings.units;
    const errors = getValidationErrors();
    const hasErrors = errors.length > 0;

    return (
        <ModalWindow
            isOpen={isOpen}
            title="Hot Zone"
            onOk={handleSave}
            onCancel={handleCancel}
            okLabel={isSaving ? "Saving..." : "Save"}
            okDisabled={isSaving || isLoading || hasErrors}
            validationErrors={errors}
            validationWarnings={getValidationWarnings()}
            movable={true}
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

                    <Slider
                        label="Computation Quality"
                        value={tempSettings.computationQuality}
                        onChange={(value) => handleSliderChange('root', 'computationQuality', value)}
                        onAfterChange={(value) => handleSliderAfterChange('root', 'computationQuality', value)}
                        min={5}
                        max={50}
                        step={1}
                        allowManualInput={true}
                    />

                    <HorizontalSeparator label="Center Pole" fullWidth={true} bleed="1rem" />
                    <Slider
                        label={`Mic Stick Radius (${unit})`}
                        value={tempSettings.centerPole.micStickRadius}
                        onChange={(value) => handleSliderChange('centerPole', 'micStickRadius', value)}
                        onAfterChange={(value) => handleSliderAfterChange('centerPole', 'micStickRadius', value)}
                        min={10}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`Height (${unit})`}
                        value={tempSettings.centerPole.height}
                        onChange={(value) => handleSliderChange('centerPole', 'height', value)}
                        onAfterChange={(value) => handleSliderAfterChange('centerPole', 'height', value)}
                        min={0}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`Y Distance from Arm Poles (${unit})`}
                        value={tempSettings.centerPole.yDistanceFromArmPoles}
                        onChange={(value) => handleSliderChange('centerPole', 'yDistanceFromArmPoles', value)}
                        onAfterChange={(value) => handleSliderAfterChange('centerPole', 'yDistanceFromArmPoles', value)}
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
                        onChange={(value) => handleSliderChange('armPoles', 'height', value)}
                        onAfterChange={(value) => handleSliderAfterChange('armPoles', 'height', value)}
                        min={0}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`X Distance (${unit})`}
                        value={tempSettings.armPoles.xDistance}
                        onChange={(value) => handleSliderChange('armPoles', 'xDistance', value)}
                        onAfterChange={(value) => handleSliderAfterChange('armPoles', 'xDistance', value)}
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
                        onChange={(value) => handleSliderChange('arms', 'leftArmMinLength', value)}
                        onAfterChange={(value) => handleSliderAfterChange('arms', 'leftArmMinLength', value)}
                        min={1}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`Left Arm Max Length (${unit})`}
                        value={tempSettings.arms.leftArmMaxLength}
                        onChange={(value) => handleSliderChange('arms', 'leftArmMaxLength', value)}
                        onAfterChange={(value) => handleSliderAfterChange('arms', 'leftArmMaxLength', value)}
                        min={1}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`Right Arm Min Length (${unit})`}
                        value={tempSettings.arms.rightArmMinLength}
                        onChange={(value) => handleSliderChange('arms', 'rightArmMinLength', value)}
                        onAfterChange={(value) => handleSliderAfterChange('arms', 'rightArmMinLength', value)}
                        min={1}
                        max={300}
                        step={0.1}
                        decimalPlaces={1}
                        allowManualInput={true}
                    />
                    <Slider
                        label={`Right Arm Max Length (${unit})`}
                        value={tempSettings.arms.rightArmMaxLength}
                        onChange={(value) => handleSliderChange('arms', 'rightArmMaxLength', value)}
                        onAfterChange={(value) => handleSliderAfterChange('arms', 'rightArmMaxLength', value)}
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
