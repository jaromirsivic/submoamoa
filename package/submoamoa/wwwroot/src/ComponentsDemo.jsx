import React, { useState } from 'react';
import Panel from './components/Panel';
import Button from './components/Button';
import StaticText from './components/StaticText';
import Switch from './components/Switch';
import Checkbox from './components/Checkbox';
import Textbox from './components/Textbox';
import NumericInput from './components/NumericInput';
import Slider from './components/Slider';
import ComboBox from './components/ComboBox';
import Carousel from './components/Carousel';
import ImageComponent from './components/ImageComponent';
import ColumnLayout from './components/ColumnLayout';
import RowLayout from './components/RowLayout';
import ModalWindow from './components/ModalWindow';

// Import assets
import switchImg from './assets/switch.png';
import sliderImg from './assets/slider.png';

const ComponentsDemo = () => {
    const [switchValue, setSwitchValue] = useState(false);
    const [checkboxValue, setCheckboxValue] = useState(false);
    const [textValue, setTextValue] = useState('');
    const [numValue, setNumValue] = useState(10);
    const [sliderValue, setSliderValue] = useState(50);
    const [comboValue, setComboValue] = useState('option1');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const comboItems = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2 (Blue)', value: 'option2', color: '#e0f2fe' },
        { label: 'Option 3 (Disabled)', value: 'option3', disabled: true },
        { label: 'Option 4', value: 'option4' }
    ];

    const carouselImages = [
        switchImg,
        sliderImg,
        'https://via.placeholder.com/600x400?text=Image+3',
        'https://via.placeholder.com/600x400?text=Image+4'
    ];

    return (
        <div className="page-container">
            <ColumnLayout gap="2rem">

                <Panel>
                    <h2>Layout Components</h2>
                    <RowLayout gap="1rem">
                        <div style={{ padding: '1rem', border: '1px dashed gray', flex: 1 }}>Column 1 (Row Layout)</div>
                        <div style={{ padding: '1rem', border: '1px dashed gray', flex: 1 }}>Column 2 (Row Layout)</div>
                        <div style={{ padding: '1rem', border: '1px dashed gray', flex: 1 }}>Column 3 (Row Layout)</div>
                    </RowLayout>
                    <br />
                    <Button label="Open Modal" onClick={() => setIsModalOpen(true)} />
                </Panel>

                <Panel>
                    <h2>Panel Component</h2>
                    <p>This is a panel with default settings.</p>
                </Panel>

                <Panel backgroundColor="#f0f9ff" textColor="#0369a1">
                    <h2>Colored Panel</h2>
                    <p>This panel has a custom background and text color.</p>
                </Panel>

                <Panel>
                    <h2>Buttons</h2>
                    <RowLayout>
                        <Button label="Primary Button" onClick={() => alert('Clicked!')} />
                        <Button label="Red Button" color="#ef4444" onClick={() => alert('Red Clicked!')} />
                        <Button label="Disabled Button" disabled onClick={() => { }} />
                    </RowLayout>
                </Panel>

                <Panel>
                    <h2>Static Text</h2>
                    <StaticText text="This is some static text." />
                    <br />
                    <StaticText text="This is disabled static text." disabled />
                </Panel>

                <Panel>
                    <h2>Switches & Checkboxes (Responsive)</h2>
                    <ColumnLayout gap="1rem">
                        <Switch
                            label="Enable Feature (Left Label)"
                            value={switchValue}
                            onChange={setSwitchValue}
                        />
                        <Switch
                            label="Top Label Switch"
                            labelPosition="top"
                            value={switchValue}
                            onChange={setSwitchValue}
                        />
                        <Switch label="Disabled Switch" value={true} disabled onChange={() => { }} />

                        <Checkbox
                            label="Accept Terms (Left Label)"
                            value={checkboxValue}
                            onChange={setCheckboxValue}
                        />
                        <Checkbox
                            label="Top Label Checkbox"
                            labelPosition="top"
                            value={checkboxValue}
                            onChange={setCheckboxValue}
                        />
                        <Checkbox label="Disabled Checkbox" value={true} disabled onChange={() => { }} />
                    </ColumnLayout>
                </Panel>

                <Panel>
                    <h2>Inputs (Responsive)</h2>
                    <ColumnLayout gap="1rem" style={{ maxWidth: '400px' }}>
                        <Textbox
                            label="Username"
                            hint="Enter your username..."
                            value={textValue}
                            onChange={setTextValue}
                        />
                        <Textbox
                            label="Disabled Input"
                            value="Cannot change"
                            disabled
                            onChange={() => { }}
                        />

                        <div className="responsive-input-container">
                            <span>Numeric Input:</span>
                            <NumericInput
                                value={numValue}
                                onChange={setNumValue}
                                min={0}
                                max={20}
                            />
                        </div>
                        <NumericInput value={5} disabled onChange={() => { }} />

                        <div style={{ marginTop: '1rem' }}>
                            <span>Slider (Value: {sliderValue})</span>
                            <Slider
                                value={sliderValue}
                                onChange={setSliderValue}
                                min={0}
                                max={100}
                            />
                        </div>
                        <Slider value={30} disabled onChange={() => { }} />

                        <ComboBox
                            items={comboItems}
                            value={comboValue}
                            onChange={setComboValue}
                        />
                        <ComboBox items={comboItems} value="option1" disabled onChange={() => { }} />
                    </ColumnLayout>
                </Panel>

                <Panel>
                    <h2>Media (Carousel Auto-play)</h2>
                    <div className="row">
                        <div className="col">
                            <h3>Carousel (Maximize Enabled)</h3>
                            <Carousel images={carouselImages} allowMaximize />
                        </div>
                        <div className="col">
                            <h3>Single Image</h3>
                            <ImageComponent src={switchImg} alt="Switch Sketch" />
                        </div>
                    </div>
                </Panel>

            </ColumnLayout>

            <ModalWindow
                isOpen={isModalOpen}
                title="Example Modal"
                onOk={() => setIsModalOpen(false)}
                onCancel={() => setIsModalOpen(false)}
            >
                <p>This is a modal window content.</p>
                <p>You can put any components here.</p>
            </ModalWindow>
        </div>
    );
};

export default ComponentsDemo;
