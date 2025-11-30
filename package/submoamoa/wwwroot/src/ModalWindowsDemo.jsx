import React, { useState } from 'react';
import ModalWindow from './components/ModalWindow';
import Button from './components/Button';
import Panel from './components/Panel';

const ModalWindowsDemo = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalResult, setModalResult] = useState('');
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
    const [sliderValue1, setSliderValue1] = useState(50);
    const [sliderValue2, setSliderValue2] = useState(60);

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setModalResult('');
    };

    const handleOpenValidationModal = () => {
        setIsValidationModalOpen(true);
        setModalResult('');
    };

    const handleOk = () => {
        setModalResult('OK clicked');
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setModalResult('Cancel clicked');
        setIsModalOpen(false);
    };

    const handleValidationOk = () => {
        setModalResult('Validation OK clicked');
        setIsValidationModalOpen(false);
    };

    const handleValidationCancel = () => {
        setModalResult('Validation Cancel clicked');
        setIsValidationModalOpen(false);
    };

    const validationErrors = [];
    if (sliderValue1 >= sliderValue2) {
        validationErrors.push('Slider 1 must be less than Slider 2');
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Modal Windows Demo</h1>
            <Panel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
                    <p>Click the button below to open a modal window.</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button label="Open Simple Modal" onClick={handleOpenModal} />
                        <Button label="Open Validation Modal" onClick={handleOpenValidationModal} />
                    </div>
                    {modalResult && <p>Last result: {modalResult}</p>}
                </div>
            </Panel>

            <ModalWindow
                isOpen={isModalOpen}
                title="Demo Modal"
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>This is a demonstration of the ModalWindow component.</p>
                <p>You can put any content here.</p>
                {Array.from({ length: 20 }).map((_, i) => (
                    <p key={i}>Scrollable content line {i + 1}</p>
                ))}
            </ModalWindow>

            <ModalWindow
                isOpen={isValidationModalOpen}
                title="Validation Modal"
                onOk={handleValidationOk}
                onCancel={handleValidationCancel}
                validationErrors={validationErrors}
            >
                <p>Adjust values to trigger validation errors.</p>
                <div style={{ marginBottom: '1rem', padding: '1rem', border: sliderValue1 >= sliderValue2 ? '1px solid red' : '1px solid #ccc', borderRadius: '4px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Slider 1 Value: {sliderValue1}</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderValue1}
                        onChange={(e) => setSliderValue1(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem', padding: '1rem', border: sliderValue1 >= sliderValue2 ? '1px solid red' : '1px solid #ccc', borderRadius: '4px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Slider 2 Value: {sliderValue2}</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderValue2}
                        onChange={(e) => setSliderValue2(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Rule: Slider 1 must be strictly less than Slider 2.
                </p>
                {Array.from({ length: 15 }).map((_, i) => (
                    <p key={i}>Extra content to force scroll {i + 1}</p>
                ))}
            </ModalWindow>
        </div>
    );
};

export default ModalWindowsDemo;
