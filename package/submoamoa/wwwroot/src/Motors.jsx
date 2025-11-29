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

const Motors = () => {
    const [motors, setMotors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMotor, setEditingMotor] = useState(null);

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
        value: pin.index
    }));

    const handleEdit = (motor) => {
        setEditingMotor(JSON.parse(JSON.stringify(motor))); // Deep copy
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMotor(null);
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
        setEditingMotor(prev => ({ ...prev, [field]: value }));
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

    return (
        <div className="page-container">
            <ColumnLayout gap="1rem">
                {motors.map((motor, index) => (
                    <Panel key={index} title={motor.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <ColumnLayout gap="0.5rem" style={{ flex: 1 }}>
                                <StaticText text={`Enabled: ${motor.enabled ? 'Yes' : 'No'}`} />
                                <StaticText text={`Type: ${motor.type}`} />
                                <StaticText text={`Role: ${motor.role}`} />
                                <StaticText text={`Softness: ${motor.softness}`} />

                                <div style={{ marginTop: '0.5rem' }}>
                                    <strong>Pins:</strong>
                                    <ul style={{ listStyle: 'none', paddingLeft: '1rem', margin: 0 }}>
                                        <li>Forward: {motor.forwardPin}</li>
                                        <li>Reverse: {motor.reversePin}</li>
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

                            <Button label="Edit" onClick={() => handleEdit(motor)} />
                        </div>
                    </Panel>
                ))}
            </ColumnLayout>

            {editingMotor && (
                <ModalWindow
                    isOpen={isModalOpen}
                    title={`Edit ${editingMotor.name}`}
                    onOk={handleSave}
                    onCancel={handleCloseModal}
                >
                    <ColumnLayout gap="1rem" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        <Switch
                            label="Enabled"
                            value={editingMotor.enabled}
                            onChange={(val) => updateMotorField('enabled', val)}
                        />

                        <Textbox
                            label="Name"
                            value={editingMotor.name}
                            onChange={(val) => updateMotorField('name', val)}
                        />

                        <ComboBox
                            label="Type"
                            items={motorTypeOptions}
                            value={editingMotor.type}
                            onChange={(val) => updateMotorField('type', val)}
                        />

                        <ComboBox
                            label="Role"
                            items={motorRoleOptions}
                            value={editingMotor.role}
                            onChange={(val) => updateMotorField('role', val)}
                        />

                        <NumericInput
                            label="Softness"
                            value={editingMotor.softness}
                            onChange={(val) => updateMotorField('softness', val)}
                            step={0.1}
                            min={0}
                            max={1}
                        />

                        <fieldset style={{ border: '1px solid var(--color-border)', padding: '0.5rem', borderRadius: '4px' }}>
                            <legend>Pins</legend>
                            <ColumnLayout gap="0.5rem">
                                <ComboBox
                                    label="Forward Pin"
                                    items={pinOptions}
                                    value={editingMotor.forwardPin}
                                    onChange={(val) => updateMotorField('forwardPin', val)}
                                />
                                <ComboBox
                                    label="Reverse Pin"
                                    items={pinOptions}
                                    value={editingMotor.reversePin}
                                    onChange={(val) => updateMotorField('reversePin', val)}
                                />
                                <NumericInput
                                    label="MCP3008 Forward Pin" // Assuming these are just indices 0-7
                                    value={editingMotor.mcp3008ForwardPin}
                                    onChange={(val) => updateMotorField('mcp3008ForwardPin', val)}
                                    min={0}
                                    max={7}
                                />
                                <NumericInput
                                    label="MCP3008 Reverse Pin"
                                    value={editingMotor.mcp3008ReversePin}
                                    onChange={(val) => updateMotorField('mcp3008ReversePin', val)}
                                    min={0}
                                    max={7}
                                />
                            </ColumnLayout>
                        </fieldset>

                        <fieldset style={{ border: '1px solid var(--color-border)', padding: '0.5rem', borderRadius: '4px' }}>
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
                                />
                                <NumericInput
                                    label="Min Rest Time (s)"
                                    value={editingMotor.dutyCycle.minRestTimeSeconds}
                                    onChange={(val) => updateDutyCycleField('minRestTimeSeconds', val)}
                                    min={0}
                                />
                            </ColumnLayout>
                        </fieldset>
                    </ColumnLayout>
                </ModalWindow>
            )}
        </div>
    );
};

export default Motors;
