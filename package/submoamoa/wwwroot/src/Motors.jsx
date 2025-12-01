import React, { useState, useEffect } from 'react';
import Panel from './components/Panel';
import Button from './components/Button';
import ModalWindow from './components/ModalWindow';
import Textbox from './components/Textbox';
import NumericInput from './components/NumericInput';
import Switch from './components/Switch';
import ComboBox from './components/ComboBox';
import ColumnLayout from './components/ColumnLayout';
import RowLayout from './components/RowLayout';
import StaticText from './components/StaticText';

import settingsData from './assets/settings.json';
import masterData from './assets/masterdata.json';

import linearIcon from './assets/icons/linear.svg';
import stepperIcon from './assets/icons/stepperMotor.svg';

const Motors = () => {
    const [motors, setMotors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMotor, setEditingMotor] = useState(null);
    const [editingMotorIndex, setEditingMotorIndex] = useState(-1);

    // Load initial data
    useEffect(() => {
        setMotors(settingsData.motors);
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
        setEditingMotor(motorCopy);
        setEditingMotorIndex(index);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMotor(null);
        setEditingMotorIndex(-1);
    };

    const handleSave = () => {
        // Update the motors list with the edited motor
        // Note: This only updates local state, does not persist to file
        setMotors(prevMotors => prevMotors.map(m =>
            m.name === editingMotor.name ? editingMotor : m
        ));
        handleCloseModal();
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
                        }
                        }
                    >
                        <div style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {getMotorIcon(motor.type) && <img src={getMotorIcon(motor.type)} alt="" width="24" height="24" />}
                                <h3 style={{ margin: 0, color: '#333' }}>{motor.name} {motor.enabled ? '' : '(Disabled)'}</h3>
                            </div>
                            <Button label="Edit" onClick={() => handleEdit(motor, index)} />
                        </div>

                        <div style={{ opacity: motor.enabled ? 1 : 0.5 }}>
                            <ColumnLayout gap="0.5rem">
                                <StaticText text={`Enabled: ${motor.enabled ? 'Yes' : 'No'}`} />
                                <StaticText text={`Type: ${motor.type}`} />
                                <StaticText text={`Role: ${motor.role}`} />
                                <StaticText text={`Softness: ${motor.softness}`} />

                                <div style={{ marginTop: '0.5rem' }}>
                                    <strong>Pins:</strong>
                                    <ul style={{ listStyle: 'none', paddingLeft: '1rem', margin: 0 }}>
                                        <li>Forward: {getPinDisplayName(motor.forwardPin)}</li>
                                        <li>Reverse: {getPinDisplayName(motor.reversePin)}</li>
                                        <li>MCP3008 Fwd: {motor.mcp3008ForwardPin}</li>
                                        <li>MCP3008 Rev: {motor.mcp3008ReversePin}</li>
                                    </ul>
                                </div>

                                <div style={{ marginTop: '0.5rem' }}>
                                    <strong>Duty Cycle:</strong>
                                    <ul style={{ listStyle: 'none', paddingLeft: '1rem', margin: 0 }}>
                                        <li>Enabled: {motor.dutyCycle.enabled ? 'Yes' : 'No'}</li>
                                        <li>Max Run: {motor.dutyCycle.maxRunningTimeSeconds}s</li>
                                        <li>Min Rest: {motor.dutyCycle.minRestTimeSeconds}s</li>
                                    </ul>
                                </div>
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
                    validationErrors={getValidationErrors()}
                    validationWarnings={getValidationWarnings()}
                >
                    <ColumnLayout gap="1rem">
                        <Switch
                            label="Enabled"
                            value={editingMotor.enabled}
                            onChange={(val) => updateMotorField('enabled', val)}
                        />

                        <div style={{
                            padding: '0.5rem',
                            border: getNameValidationError() ? '2px solid #ef4444' : '1px solid transparent',
                            boxShadow: getNameValidationError() ? '0 0 8px rgba(239, 68, 68, 0.6)' : 'none',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease'
                        }}>
                            <Textbox
                                label="Name"
                                value={editingMotor.name}
                                onChange={(val) => updateMotorField('name', val)}
                                disabled={editingMotor.role !== 'general'}
                            />
                        </div>

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

                        <NumericInput
                            label="Softness"
                            value={editingMotor.softness}
                            onChange={(val) => updateMotorField('softness', val)}
                            step={0.1}
                            min={0}
                            max={1}
                        />

                        <fieldset style={{ border: '1px solid #e5e7eb', padding: '0.5rem', borderRadius: '4px' }}>
                            <legend>Pins</legend>
                            <ColumnLayout gap="0.5rem">
                                <div style={{
                                    padding: '0.5rem',
                                    border: getForwardPinError() ? '2px solid #ef4444' : '1px solid transparent',
                                    boxShadow: getForwardPinError() ? '0 0 8px rgba(239, 68, 68, 0.6)' : 'none',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <ComboBox
                                        label="Forward Pin"
                                        items={pinOptions}
                                        value={editingMotor.forwardPin}
                                        onChange={(val) => updateMotorField('forwardPin', val)}
                                    />
                                </div>
                                <div style={{
                                    padding: '0.5rem',
                                    border: getReversePinError() ? '2px solid #ef4444' : '1px solid transparent',
                                    boxShadow: getReversePinError() ? '0 0 8px rgba(239, 68, 68, 0.6)' : 'none',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <ComboBox
                                        label="Reverse Pin"
                                        items={pinOptions}
                                        value={editingMotor.reversePin}
                                        onChange={(val) => updateMotorField('reversePin', val)}
                                    />
                                </div>

                                <Switch
                                    label="Automatic Calibration Enabled"
                                    value={editingMotor.automaticCalibrationEnabled ?? true}
                                    onChange={(val) => updateMotorField('automaticCalibrationEnabled', val)}
                                />

                                <NumericInput
                                    label="MCP3008 Forward Pin"
                                    value={editingMotor.mcp3008ForwardPin}
                                    onChange={(val) => updateMotorField('mcp3008ForwardPin', val)}
                                    min={0}
                                    max={7}
                                    disabled={!editingMotor.automaticCalibrationEnabled}
                                />
                                <NumericInput
                                    label="MCP3008 Reverse Pin"
                                    value={editingMotor.mcp3008ReversePin}
                                    onChange={(val) => updateMotorField('mcp3008ReversePin', val)}
                                    min={0}
                                    max={7}
                                    disabled={!editingMotor.automaticCalibrationEnabled}
                                />
                            </ColumnLayout>
                        </fieldset>

                        <fieldset style={{ border: '1px solid #e5e7eb', padding: '0.5rem', borderRadius: '4px' }}>
                            <legend>Duty Cycle</legend>
                            <ColumnLayout gap="0.5rem">
                                <Switch
                                    label="Enabled"
                                    value={editingMotor.dutyCycle.enabled}
                                    onChange={(val) => updateDutyCycleField('enabled', val)}
                                />
                                <NumericInput
                                    label="Max Running Time (s)"
                                    value={editingMotor.dutyCycle.maxRunningTimeSeconds}
                                    onChange={(val) => updateDutyCycleField('maxRunningTimeSeconds', val)}
                                    min={0}
                                    disabled={!editingMotor.dutyCycle.enabled}
                                />
                                <NumericInput
                                    label="Min Rest Time (s)"
                                    value={editingMotor.dutyCycle.minRestTimeSeconds}
                                    onChange={(val) => updateDutyCycleField('minRestTimeSeconds', val)}
                                    min={0}
                                    disabled={!editingMotor.dutyCycle.enabled}
                                />
                            </ColumnLayout>
                        </fieldset>
                    </ColumnLayout>
                </ModalWindow>
            )}
        </div >
    );
};

export default Motors;
