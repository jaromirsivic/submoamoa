import React, { useState, useEffect, useRef } from 'react';
import Panel from './components/Panel';
import Button from './components/Button';
import ModalWindow from './components/ModalWindow';
import Textbox from './components/Textbox';
import NumericInput from './components/NumericInput';
import Switch from './components/Switch';
import MultiSwitch from './components/MultiSwitch';
import Slider from './components/Slider';
import Table from './components/Table';
import ComboBox from './components/ComboBox';
import ColumnLayout from './components/ColumnLayout';
import StaticText from './components/StaticText';
import HorizontalSeparator from './components/HorizontalSeparator';

import { getMotorsSettings, saveMotorsSettings, startMotorAction, stopMotorAction } from './lib/api';
import masterData from './assets/masterdata.json';

import linearIcon from './assets/icons/linear.svg';
import stepperIcon from './assets/icons/stepperMotor.svg';
import editIcon from './assets/icons/edit.svg';

const Motors = () => {
    const [motors, setMotors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMotor, setEditingMotor] = useState(null);
    const [editingMotorIndex, setEditingMotorIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Histogram Quick Test Timer state
    const [motorActionTimer, setMotorActionTimer] = useState(0); // timer in ms
    const [motorActionActive, setMotorActionActive] = useState(false);
    const timerIntervalRef = useRef(null);
    const activeMotorPinRef = useRef(null); // track which pin is active for cleanup

    // Load initial data from API
    useEffect(() => {
        const loadMotors = async () => {
            try {
                setIsLoading(true);
                const data = await getMotorsSettings();
                setMotors(data || []);
            } catch (error) {
                console.error('Failed to load motors settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadMotors();
    }, []);

    // Prepare dropdown options
    const motorTypeOptions = masterData.motors.motorTypes.map(type => ({
        label: type,
        value: type
    }));

    const motorRoleOptions = masterData.motors.motorRoles.map(role => ({
        label: role,
        value: role
    }));

    const pinOptions = masterData.pins.map(pin => ({
        label: `${pin.index} - ${pin.name}`,
        value: pin.index,
        disabled: !pin.isGPIO || pin.isSPI,
        color: pin.isSPI ? '#ffffe0' : (pin.isPWM ? '#90ee90' : undefined)
    }));

    const handleEdit = (motor, index) => {
        const motorCopy = JSON.parse(JSON.stringify(motor)); // Deep copy

        // Initialize automaticCalibrationEnabled if not present (backward compatibility)
        if (motorCopy.automaticCalibrationEnabled === undefined) {
            motorCopy.automaticCalibrationEnabled = true;
        }

        // Initialize/Sync speedHistogram UI state from histogram data
        if (!motorCopy.speedHistogram) {
            motorCopy.speedHistogram = {
                pwmMultiplier: 1.0,
                defaultState: 'stop',
                histogram: []
            };
        }

        // If histogram data exists, populate the UI table from it
        if (motorCopy.histogram && Array.isArray(motorCopy.histogram)) {
            motorCopy.speedHistogram.histogram = motorCopy.histogram.map(item => [
                { value: item.pwmMultiplier !== undefined ? item.pwmMultiplier : 0 },
                { value: item.forwardSeconds !== undefined ? item.forwardSeconds : 0 },
                { value: item.reverseSeconds !== undefined ? item.reverseSeconds : 0 }
            ]);
        } else if (!motorCopy.speedHistogram.histogram || !Array.isArray(motorCopy.speedHistogram.histogram)) {
            // Default if no data anywhere
            motorCopy.speedHistogram.histogram = [
                [{ value: '0.00' }, { value: '0' }, { value: '0' }],
                [{ value: '1.00' }, { value: '10' }, { value: '10' }]
            ];
        }

        setEditingMotor(motorCopy);
        setEditingMotorIndex(index);
        setIsModalOpen(true);
    };

    // Timer management functions
    const startMotorActionTimer = () => {
        // Clear any existing interval
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        // Reset timer to 0
        setMotorActionTimer(0);
        setMotorActionActive(true);
        // Start new interval
        timerIntervalRef.current = setInterval(() => {
            setMotorActionTimer(prev => prev + 100);
        }, 100);
    };

    const stopMotorActionTimer = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setMotorActionActive(false);
    };

    const handleCloseModal = async () => {
        // Stop timer and reset J8 if motor action was active
        if (motorActionActive && activeMotorPinRef.current !== null) {
            stopMotorActionTimer();
            try {
                await stopMotorAction(activeMotorPinRef.current);
            } catch (error) {
                console.error('Failed to stop motor action on modal close:', error);
            }
        }
        // Reset timer state
        setMotorActionTimer(0);
        setMotorActionActive(false);
        activeMotorPinRef.current = null;

        setIsModalOpen(false);
        setEditingMotor(null);
        setEditingMotorIndex(-1);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // Sync UI table data back to histogram property
            if (editingMotor.speedHistogram && Array.isArray(editingMotor.speedHistogram.histogram)) {
                editingMotor.histogram = editingMotor.speedHistogram.histogram.map(row => ({
                    pwmMultiplier: Number(row[0]?.value || 0),
                    forwardSeconds: Number(row[1]?.value || 0),
                    reverseSeconds: Number(row[2]?.value || 0)
                }));
            }

            // Update the motors list with the edited motor
            const updatedMotors = motors.map((m, index) =>
                index === editingMotorIndex ? editingMotor : m
            );

            // Save only motors section via API
            await saveMotorsSettings(updatedMotors);
            console.log('Motors settings saved successfully');

            // Update local state
            setMotors(updatedMotors);
            handleCloseModal();
        } catch (error) {
            console.error('Error saving settings:', error);
            alert(`Failed to save settings: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const updateMotorField = (field, value) => {
        let newValue = value;
        if (['forwardPin', 'reversePin', 'mcp3008ForwardPin', 'mcp3008ReversePin'].includes(field)) {
            newValue = parseInt(value, 10);
        }

        if (field === 'name') {
            // Validation: Max 128 chars, alphanumeric + space + underscore + hyphen
            if (value.length > 128) return;
            if (!/^[a-zA-Z0-9 _-]*$/.test(value)) return;
        }
        setEditingMotor(prev => ({ ...prev, [field]: newValue }));
    };

    const updateDutyCycleField = (field, value) => {
        setEditingMotor(prev => ({
            ...prev,
            dutyCycle: {
                ...prev.dutyCycle,
                [field]: value
            }
        }));
    };

    const updateSpeedHistogramField = (field, value) => {
        setEditingMotor(prev => ({
            ...prev,
            speedHistogram: {
                ...prev.speedHistogram,
                [field]: value
            }
        }));
    };

    const getValidationErrors = () => {
        if (!editingMotor) return [];

        const errors = [];

        // Name validation
        if (!editingMotor.name || editingMotor.name.trim() === '') {
            errors.push('Name cannot be empty');
        }

        if (editingMotor.name && editingMotor.name.length > 128) {
            errors.push('Name cannot exceed 128 characters');
        }

        if (editingMotor.name && editingMotor.name.trim() && !/^[a-zA-Z0-9 _-]+$/.test(editingMotor.name)) {
            errors.push('Name can only contain letters, numbers, spaces, underscores, and hyphens');
        }

        // Name uniqueness validation
        const duplicateMotor = motors.find((m, index) =>
            m.name === editingMotor.name && index !== editingMotorIndex
        );

        if (duplicateMotor) {
            errors.push('A motor with this name already exists');
        }

        // Pin validation - Pin 0 (Dummy GPIO) is exempt from this check
        if (editingMotor.forwardPin !== 0 && editingMotor.forwardPin === editingMotor.reversePin) {
            errors.push('Forward Pin and Reverse Pin must be different');
        }

        // Check if Forward Pin is used by another motor (Pin 0 is exempt)
        if (editingMotor.forwardPin !== 0) {
            const forwardPinConflict = motors.find((m, index) =>
                index !== editingMotorIndex && (m.forwardPin === editingMotor.forwardPin || m.reversePin === editingMotor.forwardPin)
            );
            if (forwardPinConflict) {
                errors.push(`Forward Pin ${editingMotor.forwardPin} is already used by motor '${forwardPinConflict.name}'`);
            }
        }

        // Check if Reverse Pin is used by another motor (Pin 0 is exempt)
        if (editingMotor.reversePin !== 0) {
            const reversePinConflict = motors.find((m, index) =>
                index !== editingMotorIndex && (m.forwardPin === editingMotor.reversePin || m.reversePin === editingMotor.reversePin)
            );
            if (reversePinConflict) {
                errors.push(`Reverse Pin ${editingMotor.reversePin} is already used by motor '${reversePinConflict.name}'`);
            }
        }

        return errors;
    };

    const getValidationWarnings = () => {
        if (!editingMotor) return [];
        const warnings = [];

        // No warnings needed - pin conflicts are now errors

        return warnings;
    };

    const getNameValidationError = () => {
        if (!editingMotor) return false;
        if (!editingMotor.name || editingMotor.name.trim() === '') return true;
        if (editingMotor.name.length > 128) return true;
        if (!/^[a-zA-Z0-9 _-]+$/.test(editingMotor.name)) return true;

        const duplicateMotor = motors.find((m, index) =>
            m.name === editingMotor.name && index !== editingMotorIndex
        );

        return !!duplicateMotor;
    };

    const getPinDisplayName = (pinIndex) => {
        const pin = masterData.pins.find(p => p.index === pinIndex);
        return pin ? `${pin.index} - ${pin.name}` : pinIndex;
    };

    const getMotorIcon = (type) => {
        if (type === 'linearActuator') return linearIcon;
        if (type === 'stepperMotor') return stepperIcon;
        return null;
    };

    const getForwardPinError = () => {
        if (!editingMotor) return false;

        // Pin 0 is exempt from all validation
        if (editingMotor.forwardPin === 0) return false;

        // Check if same as reverse pin
        if (editingMotor.forwardPin === editingMotor.reversePin) return true;

        // Check if used by another motor
        const forwardPinConflict = motors.find((m, index) =>
            index !== editingMotorIndex && (m.forwardPin === editingMotor.forwardPin || m.reversePin === editingMotor.forwardPin)
        );

        return !!forwardPinConflict;
    };

    const getReversePinError = () => {
        if (!editingMotor) return false;

        // Pin 0 is exempt from all validation
        if (editingMotor.reversePin === 0) return false;

        // Check if same as forward pin
        if (editingMotor.forwardPin === editingMotor.reversePin) return true;

        // Check if used by another motor
        const reversePinConflict = motors.find((m, index) =>
            index !== editingMotorIndex && (m.forwardPin === editingMotor.reversePin || m.reversePin === editingMotor.reversePin)
        );

        return !!reversePinConflict;
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="page-container">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                    <StaticText text="Loading motors settings..." />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {motors.map((motor, index) => (
                    <Panel
                        key={index}
                        backgroundColor={motor.enabled ? undefined : '#c8d8e0'}
                        style={{
                            flex: '1 1 400px',
                            minWidth: '300px'
                        }}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {getMotorIcon(motor.type) && <img src={getMotorIcon(motor.type)} alt="" width="24" height="24" />}
                                <span style={{ color: '#333' }}>{motor.name} {motor.enabled ? '' : '(Disabled)'}</span>
                            </div>
                        }
                        headerAction={
                            <Button
                                label={<img src={editIcon} alt="Edit" width="24" height="24" />}
                                onClick={() => handleEdit(motor, index)}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                            />
                        }
                    >

                        <div style={{ opacity: motor.enabled ? 1 : 0.5 }}>
                            <ColumnLayout gap="0.5rem">
                                <StaticText text={<>Enabled: <span style={{ fontWeight: 'bold' }}>{motor.enabled ? 'Yes' : 'No'}</span></>} />
                                <StaticText text={<>Type: <span style={{ fontWeight: 'bold' }}>{motor.type}</span></>} />
                                <StaticText text={<>Role: <span style={{ fontWeight: 'bold' }}>{motor.role}</span></>} />
                                <StaticText text={<>Inertia: <span style={{ fontWeight: 'bold' }}>{motor.inertia}</span></>} />

                                <HorizontalSeparator label="Pins" fullWidth={true} bleed="1.5rem" />
                                <StaticText text={<>Forward: <span style={{ fontWeight: 'bold' }}>{getPinDisplayName(motor.forwardPin)}</span></>} />
                                <StaticText text={<>Reverse: <span style={{ fontWeight: 'bold' }}>{getPinDisplayName(motor.reversePin)}</span></>} />
                                <StaticText text={<>MCP3008 Fwd: <span style={{ fontWeight: 'bold' }}>{motor.mcp3008ForwardPin}</span></>} />
                                <StaticText text={<>MCP3008 Rev: <span style={{ fontWeight: 'bold' }}>{motor.mcp3008ReversePin}</span></>} />

                                <HorizontalSeparator label="Duty Cycle" fullWidth={true} bleed="1.5rem" />
                                <StaticText text={<>Enabled: <span style={{ fontWeight: 'bold' }}>{motor.dutyCycle.enabled ? 'Yes' : 'No'}</span></>} />
                                <StaticText text={<>Max Run: <span style={{ fontWeight: 'bold' }}>{motor.dutyCycle.maxRunningTimeSeconds}s</span></>} />
                                <StaticText text={<>Min Rest: <span style={{ fontWeight: 'bold' }}>{motor.dutyCycle.minRestTimeSeconds}s</span></>} />
                            </ColumnLayout>
                        </div>
                    </Panel >
                ))}
            </div >

            {editingMotor && (
                <ModalWindow
                    isOpen={isModalOpen}
                    title={`Edit ${editingMotor.name}`}
                    onOk={handleSave}
                    onCancel={handleCloseModal}
                    okLabel={isSaving ? "Saving..." : "Save"}
                    okDisabled={isSaving}
                    validationErrors={getValidationErrors()}
                    validationWarnings={getValidationWarnings()}
                >
                    <ColumnLayout gap="0.5rem">
                        <Switch
                            label="Enabled"
                            value={editingMotor.enabled}
                            onChange={(val) => updateMotorField('enabled', val)}
                        />

                        <Textbox
                            label="Name"
                            value={editingMotor.name}
                            onChange={(val) => updateMotorField('name', val)}
                            disabled={editingMotor.role !== 'general'}
                            style={{
                                border: getNameValidationError() ? '2px solid #ef4444' : undefined,
                                boxShadow: getNameValidationError() ? '0 0 8px rgba(239, 68, 68, 0.6)' : undefined,
                                borderRadius: '4px',
                                transition: 'all 0.2s ease',
                                padding: getNameValidationError() ? '0.25rem' : undefined
                            }}
                        />

                        <ComboBox
                            label="Type"
                            items={motorTypeOptions}
                            value={editingMotor.type}
                            onChange={(val) => updateMotorField('type', val)}
                            disabled={true}
                        />

                        <ComboBox
                            label="Role"
                            items={motorRoleOptions}
                            value={editingMotor.role}
                            onChange={(val) => updateMotorField('role', val)}
                            disabled={true}
                        />

                        <Slider
                            label="Inertia"
                            value={editingMotor.inertia}
                            onChange={(val) => updateMotorField('inertia', Math.round(val * 100) / 100)}
                            min={0}
                            max={2}
                            step={0.01}
                            allowManualInput={true}
                            decimalPlaces={2}
                        />

                        <HorizontalSeparator label="Pins" fullWidth={true} bleed="1rem" />
                        <ColumnLayout gap="0.5rem">
                            <ComboBox
                                label="Forward Pin"
                                items={pinOptions}
                                value={editingMotor.forwardPin}
                                onChange={(val) => updateMotorField('forwardPin', val)}
                                style={{
                                    border: getForwardPinError() ? '2px solid #ef4444' : undefined,
                                    boxShadow: getForwardPinError() ? '0 0 8px rgba(239, 68, 68, 0.6)' : undefined,
                                    borderRadius: '4px',
                                    transition: 'all 0.2s ease',
                                    padding: getForwardPinError() ? '0.25rem' : undefined
                                }}
                            />
                            <ComboBox
                                label="Reverse Pin"
                                items={pinOptions}
                                value={editingMotor.reversePin}
                                onChange={(val) => updateMotorField('reversePin', val)}
                                style={{
                                    border: getReversePinError() ? '2px solid #ef4444' : undefined,
                                    boxShadow: getReversePinError() ? '0 0 8px rgba(239, 68, 68, 0.6)' : undefined,
                                    borderRadius: '4px',
                                    transition: 'all 0.2s ease',
                                    padding: getReversePinError() ? '0.25rem' : undefined
                                }}
                            />

                            <Switch
                                label="Automatic Calibration Enabled"
                                value={editingMotor.automaticCalibrationEnabled ?? true}
                                onChange={(val) => updateMotorField('automaticCalibrationEnabled', val)}
                            />

                            <NumericInput
                                label="MCP3008 Forward Pin"
                                labelPosition="left"
                                value={editingMotor.mcp3008ForwardPin}
                                onChange={(val) => updateMotorField('mcp3008ForwardPin', val)}
                                min={0}
                                max={7}
                                disabled={!editingMotor.automaticCalibrationEnabled}
                            />
                            <NumericInput
                                label="MCP3008 Reverse Pin"
                                labelPosition="left"
                                value={editingMotor.mcp3008ReversePin}
                                onChange={(val) => updateMotorField('mcp3008ReversePin', val)}
                                min={0}
                                max={7}
                                disabled={!editingMotor.automaticCalibrationEnabled}
                            />
                        </ColumnLayout>

                        <HorizontalSeparator label="Duty Cycle" fullWidth={true} bleed="1rem" />
                        <ColumnLayout gap="0.5rem">
                            <Switch
                                label="Enabled"
                                value={editingMotor.dutyCycle.enabled}
                                onChange={(val) => updateDutyCycleField('enabled', val)}
                            />
                            <NumericInput
                                label="Max Running Time (s)"
                                labelPosition="left"
                                value={editingMotor.dutyCycle.maxRunningTimeSeconds}
                                onChange={(val) => updateDutyCycleField('maxRunningTimeSeconds', val)}
                                min={0}
                                disabled={!editingMotor.dutyCycle.enabled}
                            />
                            <NumericInput
                                label="Min Rest Time (s)"
                                labelPosition="left"
                                value={editingMotor.dutyCycle.minRestTimeSeconds}
                                onChange={(val) => updateDutyCycleField('minRestTimeSeconds', val)}
                                min={0}
                                disabled={!editingMotor.dutyCycle.enabled}
                            />
                        </ColumnLayout>

                        <HorizontalSeparator label="Histogram Quick Test" fullWidth={true} bleed="1rem" />
                        <ColumnLayout gap="1rem">
                            <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                                Use "PWM Multiplier" and "Reverse" / "Forward" buttons to test how long it takes to extend the stroke of linear actuator
                                from fully retracted position to fully extended position and vice versa.
                            </p>
                            <Slider
                                label="PWM Multiplier"
                                value={editingMotor.speedHistogram.pwmMultiplier}
                                onChange={(val) => updateSpeedHistogramField('pwmMultiplier', val)}
                                min={0}
                                max={1}
                                step={0.01}
                                allowManualInput={true}
                                decimalPlaces={2}
                            />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <StaticText text="Motor Action" />
                                    <MultiSwitch
                                        options={[
                                            { label: 'Reverse', value: 'reverse' },
                                            { label: 'Stop', value: 'stop' },
                                            { label: 'Forward', value: 'forward' }
                                        ]}
                                        value={editingMotor.speedHistogram.defaultState}
                                        onChange={async (val) => {
                                            updateSpeedHistogramField('defaultState', val);

                                            if (val === 'forward' || val === 'reverse') {
                                                // Determine which pin to use based on direction
                                                const pinIndex = val === 'forward'
                                                    ? editingMotor.forwardPin
                                                    : editingMotor.reversePin;
                                                const pwmMultiplier = editingMotor.speedHistogram.pwmMultiplier;

                                                try {
                                                    // Call API and wait for response
                                                    await startMotorAction(pinIndex, pwmMultiplier);
                                                    // Store active pin for cleanup
                                                    activeMotorPinRef.current = pinIndex;
                                                    // Reset and start timer after successful API response
                                                    startMotorActionTimer();
                                                } catch (error) {
                                                    console.error('Failed to start motor action:', error);
                                                }
                                            } else if (val === 'stop') {
                                                // Stop the motor and timer
                                                stopMotorActionTimer();
                                                if (activeMotorPinRef.current !== null) {
                                                    try {
                                                        await stopMotorAction(activeMotorPinRef.current);
                                                    } catch (error) {
                                                        console.error('Failed to stop motor action:', error);
                                                    }
                                                    activeMotorPinRef.current = null;
                                                }
                                            }
                                        }}
                                        orientation="horizontal"
                                    />
                                </div>
                                <StaticText
                                    text={`Timer: ${(motorActionTimer / 1000).toFixed(2)}s`}
                                    style={{
                                        fontSize: '0.9rem',
                                        color: motorActionActive ? '#22c55e' : '#666',
                                        fontWeight: motorActionActive ? 'bold' : 'normal'
                                    }}
                                />
                            </div>

                            <HorizontalSeparator label="Speed Histogram" fullWidth={true} bleed="1rem" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <StaticText text="Histogram" />
                                <Table
                                    width="100%"
                                    height={300}
                                    columnsHeaders={[
                                        { name: 'PWM Multiplier', width: 120, align: 'center' },
                                        { name: 'Forward sec.', width: 120, align: 'center' },
                                        { name: 'Reverse sec.', width: 120, align: 'center' }
                                    ]}
                                    cells={editingMotor.speedHistogram.histogram}
                                    onCellsChange={(newCells) => updateSpeedHistogramField('histogram', newCells)}
                                    canAddRows={true}
                                    canDeleteRows={true}
                                    canAddColumns={false}
                                    canDeleteColumns={false}
                                    maxRows={20}
                                    minRows={2}
                                />
                            </div>
                        </ColumnLayout>
                    </ColumnLayout>
                </ModalWindow>
            )}
        </div >
    );
};

export default Motors;
