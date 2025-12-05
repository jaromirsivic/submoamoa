import React, { useState } from 'react';
import Panel from './components/Panel';
import Button from './components/Button';
import StaticText from './components/StaticText';
import Switch from './components/Switch';
import MultiSwitch from './components/MultiSwitch';
import Checkbox from './components/Checkbox';
import Textbox from './components/Textbox';
import NumericInput from './components/NumericInput';
import Slider from './components/Slider';
import ComboBox from './components/ComboBox';
import Carousel from './components/Carousel';
import ImageComponent from './components/ImageComponent';
import Image from './components/Image';
import Polygon from './components/Polygon';
import ColumnLayout from './components/ColumnLayout';
import RowLayout from './components/RowLayout';
import ModalWindow from './components/ModalWindow';
import ColorPicker from './components/ColorPicker';

// Import assets
import switchImg from './assets/switch.png';
import sliderImg from './assets/slider.png';
import emptyImage from './assets/EmptyImage.jpg';

const ComponentsDemo = () => {
    const [switchValue, setSwitchValue] = useState(false);
    const [checkboxValue, setCheckboxValue] = useState(false);
    const [textValue, setTextValue] = useState('');
    const [numValue, setNumValue] = useState(10);
    const [sliderValue, setSliderValue] = useState(50);
    const [comboValue, setComboValue] = useState('option1');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [multiSwitchValue1, setMultiSwitchValue1] = useState('option1');
    const [multiSwitchValue2, setMultiSwitchValue2] = useState('medium');
    const [multiSwitchValue3, setMultiSwitchValue3] = useState('left');
    const [polygons1, setPolygons1] = useState([]);
    const [polygons2, setPolygons2] = useState([]);
    const [polygons3, setPolygons3] = useState([
        [
            { "x": 0.17985610554627954, "y": 0.40345979394505405 },
            { "x": 0.2045220862731593, "y": 0.7315847715933138 },
            { "x": 0.35097634683900786, "y": 0.5976562092879016 },
            { "x": 0.26927028568121864, "y": 0.31640622844653615 }
        ],
        [
            { "x": 0.39568343690647745, "y": 0.47042407509776013 },
            { "x": 0.44501539836023696, "y": 0.6646204904406077 },
            { "x": 0.4727646266779767, "y": 0.5039062156741132 },
            { "x": 0.45118189354195687, "y": 0.31640622844653615 },
            { "x": 0.38335044654303757, "y": 0.31640622844653615 }
        ],
        [
            { "x": 0.534429578495176, "y": 0.5172990719046544 },
            { "x": 0.5760534209717857, "y": 0.6914062029016902 },
            { "x": 0.6145940158575353, "y": 0.4369419345214071 }
        ]
    ]);
    // State for reticle demo polygons
    const [polygons4, setPolygons4] = useState([]);
    const [polygons5, setPolygons5] = useState([]);
    const [polygons6, setPolygons6] = useState([]);
    const [polygons7, setPolygons7] = useState([]);
    const [polygons8, setPolygons8] = useState([]);
    const [polygons9, setPolygons9] = useState([]);
    const [polygons10, setPolygons10] = useState([]);
    // State for ColorPicker demos
    const [color1, setColor1] = useState('#3b82f6');
    const [color2, setColor2] = useState('#22c55e');
    const [color3, setColor3] = useState('#ef4444cc');
    const [color4, setColor4] = useState('#8b5cf6');

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
                    <h2>MultiSwitch</h2>
                    <ColumnLayout gap="1.5rem">
                        <div>
                            <h3>Horizontal Orientation (Default)</h3>
                            <MultiSwitch
                                options={[
                                    { label: 'Option 1', value: 'option1' },
                                    { label: 'Option 2', value: 'option2' },
                                    { label: 'Option 3', value: 'option3' }
                                ]}
                                value={multiSwitchValue1}
                                onChange={setMultiSwitchValue1}
                            />
                            <StaticText text={`Selected: ${multiSwitchValue1}`} style={{ marginTop: '0.5rem' }} />
                        </div>

                        <div>
                            <h3>Vertical Orientation</h3>
                            <MultiSwitch
                                options={[
                                    { label: 'Small', value: 'small' },
                                    { label: 'Medium', value: 'medium' },
                                    { label: 'Large', value: 'large' },
                                    { label: 'Extra Large', value: 'xlarge' }
                                ]}
                                value={multiSwitchValue2}
                                onChange={setMultiSwitchValue2}
                                orientation="vertical"
                                style={{ width: '150px' }}
                            />
                            <StaticText text={`Selected: ${multiSwitchValue2}`} style={{ marginTop: '0.5rem' }} />
                        </div>

                        <div>
                            <h3>Custom Colors</h3>
                            <MultiSwitch
                                options={[
                                    { label: 'Left', value: 'left' },
                                    { label: 'Center', value: 'center' },
                                    { label: 'Right', value: 'right' }
                                ]}
                                value={multiSwitchValue3}
                                onChange={setMultiSwitchValue3}
                                selectedColor="#3b82f6"
                                unselectedColor="#e2e8f0"
                                selectedTextColor="#ffffff"
                                textColor="#475569"
                            />
                        </div>

                        <div>
                            <h3>With Disabled Option</h3>
                            <MultiSwitch
                                options={[
                                    { label: 'Active', value: 'active' },
                                    { label: 'Disabled', value: 'disabled', disabled: true },
                                    { label: 'Pending', value: 'pending' }
                                ]}
                                value="active"
                                onChange={() => { }}
                            />
                        </div>

                        <div>
                            <h3>Disabled MultiSwitch</h3>
                            <MultiSwitch
                                options={[
                                    { label: 'On', value: 'on' },
                                    { label: 'Off', value: 'off' }
                                ]}
                                value="on"
                                onChange={() => { }}
                                disabled
                            />
                        </div>
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
                            <span>Slider</span>
                            <Slider
                                value={sliderValue}
                                onChange={setSliderValue}
                                min={0}
                                max={100}
                                allowManualInput
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

                <Panel>
                    <h2>Image Component</h2>
                    <ColumnLayout gap="2rem">
                        <div>
                            <h3>Stretch Modes</h3>
                            <RowLayout gap="1rem">
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>Fit (default)</h4>
                                    <div style={{ width: '100%', height: '200px', border: '1px solid #ccc' }}>
                                        <Image
                                            src="https://via.placeholder.com/300x200?text=Fit+Mode"
                                            stretchMode="fit"
                                            background="#f0f0f0"
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>Stretch</h4>
                                    <div style={{ width: '100%', height: '200px', border: '1px solid #ccc' }}>
                                        <Image
                                            src="https://via.placeholder.com/300x200?text=Stretch+Mode"
                                            stretchMode="stretch"
                                            background="#f0f0f0"
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>Original Size</h4>
                                    <div style={{ width: '100%', height: '200px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image
                                            src="https://via.placeholder.com/150x100?text=Original"
                                            stretchMode="originalSize"
                                            background="#f0f0f0"
                                        />
                                    </div>
                                </div>
                            </RowLayout>
                        </div>

                        <div>
                            <h3>Border Examples</h3>
                            <RowLayout gap="1rem">
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>No Border (default)</h4>
                                    <div style={{ width: '100%', height: '150px', border: '1px solid #ccc' }}>
                                        <Image
                                            src="https://via.placeholder.com/200x150?text=No+Border"
                                            border={0}
                                            stretchMode="fit"
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>2px Border</h4>
                                    <div style={{ width: '100%', height: '150px' }}>
                                        <Image
                                            src="https://via.placeholder.com/200x150?text=2px+Border"
                                            border={2}
                                            stretchMode="fit"
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>4px Border</h4>
                                    <div style={{ width: '100%', height: '150px' }}>
                                        <Image
                                            src="https://via.placeholder.com/200x150?text=4px+Border"
                                            border={4}
                                            stretchMode="fit"
                                        />
                                    </div>
                                </div>
                            </RowLayout>
                        </div>

                        <div>
                            <h3>Background Color Examples</h3>
                            <RowLayout gap="1rem">
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>Transparent (default)</h4>
                                    <div style={{ width: '100%', height: '150px', border: '1px solid #ccc', background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
                                        <Image
                                            src="https://via.placeholder.com/100x100?text=Small"
                                            stretchMode="fit"
                                            background="transparent"
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>Light Blue Background</h4>
                                    <div style={{ width: '100%', height: '150px', border: '1px solid #ccc' }}>
                                        <Image
                                            src="https://via.placeholder.com/100x100?text=Small"
                                            stretchMode="fit"
                                            background="#e0f2fe"
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>Light Yellow Background</h4>
                                    <div style={{ width: '100%', height: '150px', border: '1px solid #ccc' }}>
                                        <Image
                                            src="https://via.placeholder.com/100x100?text=Small"
                                            stretchMode="fit"
                                            background="#fef3c7"
                                        />
                                    </div>
                                </div>
                            </RowLayout>
                        </div>

                        <div>
                            <h3>Combined Example</h3>
                            <div style={{ width: '100%', maxWidth: '400px' }}>
                                <Image
                                    src="https://via.placeholder.com/300x200?text=Combined+Example"
                                    border={3}
                                    stretchMode="fit"
                                    background="#f0f9ff"
                                />
                            </div>
                        </div>
                    </ColumnLayout>
                </Panel>

                <Panel>
                    <h2>Polygon Component</h2>
                    <ColumnLayout gap="2rem">
                        <div>
                            <h3>Basic Usage</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                <strong>Drawing:</strong> Click to add points. Click on the first point (orange) to close the polygon.<br />
                                <strong>Editing:</strong> Drag points to move them. Double-click on polygon to delete it.
                            </p>
                            <div style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}>
                                <Polygon
                                    src={emptyImage}
                                    stretchMode="fit"
                                    background="#f0f0f0"
                                    borderColor="#009900ff"
                                    fillColor="#00ee0055"
                                    lineWidth={2}
                                    maxPoints={32}
                                    polygons={polygons1}
                                    onChange={setPolygons1}
                                />
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Button
                                    label="Show JSON"
                                    onClick={() => alert(JSON.stringify(polygons1, null, 2))}
                                />
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                    {polygons1.length} polygon(s)
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3>Multiple Polygons</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                After closing a polygon, click outside to start drawing a new one.
                            </p>
                            <div style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}>
                                <Polygon
                                    src={emptyImage}
                                    stretchMode="fit"
                                    background="#e0f2fe"
                                    borderColor="#0066ccff"
                                    fillColor="#0066cc44"
                                    lineWidth={3}
                                    maxPoints={16}
                                    polygons={polygons2}
                                    onChange={setPolygons2}
                                />
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Button
                                    label="Show JSON"
                                    onClick={() => alert(JSON.stringify(polygons2, null, 2))}
                                />
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                    {polygons2.length} polygon(s)
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3>Without Background Image</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                Polygon component can work without a background image.
                            </p>
                            <div style={{ width: '100%', height: '300px', border: '1px solid #ccc', background: '#f9fafb' }}>
                                <Polygon
                                    src={emptyImage}
                                    stretchMode="fit"
                                    background="#f9fafb"
                                    borderColor="#ff6600ff"
                                    fillColor="#ff660033"
                                    lineWidth={2}
                                    maxPoints={32}
                                    polygons={polygons3}
                                    onChange={setPolygons3}
                                />
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Button
                                    label="Show JSON"
                                    onClick={() => alert(JSON.stringify(polygons3, null, 2))}
                                />
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                    {polygons3.length} polygon(s)
                                </span>
                            </div>
                        </div>
                    </ColumnLayout>
                </Panel>

                <Panel>
                    <h2>Polygon Reticle Feature</h2>
                    <ColumnLayout gap="2rem">
                        <div>
                            <h3>Basic Reticle (Default Position)</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                Reticle centered at position (0.5, 0.5) with default red color.
                            </p>
                            <div style={{ width: '100%', height: '300px', border: '1px solid #ccc' }}>
                                <Polygon
                                    src={emptyImage}
                                    stretchMode="fit"
                                    background="#f0f0f0"
                                    showReticle={true}
                                    polygons={polygons4}
                                    onChange={setPolygons4}
                                />
                            </div>
                        </div>

                        <div>
                            <h3>Custom Position Reticle</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                Reticle positioned at (0.25, 0.75) - bottom left quadrant.
                            </p>
                            <div style={{ width: '100%', height: '300px', border: '1px solid #ccc' }}>
                                <Polygon
                                    src={emptyImage}
                                    stretchMode="fit"
                                    background="#e0f2fe"
                                    showReticle={true}
                                    reticleX={0.25}
                                    reticleY={0.75}
                                    polygons={polygons5}
                                    onChange={setPolygons5}
                                />
                            </div>
                        </div>

                        <div>
                            <h3>Custom Color and Size</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                Blue reticle with size 1.5 and higher opacity.
                            </p>
                            <div style={{ width: '100%', height: '300px', border: '1px solid #ccc' }}>
                                <Polygon
                                    src={emptyImage}
                                    stretchMode="fit"
                                    background="#fef3c7"
                                    showReticle={true}
                                    reticleX={0.5}
                                    reticleY={0.5}
                                    reticleColor="#0066cc"
                                    reticleSize={1.5}
                                    reticleAlpha={0.8}
                                    polygons={polygons6}
                                    onChange={setPolygons6}
                                />
                            </div>
                        </div>

                        <div>
                            <h3>Multiple Reticles Comparison</h3>
                            <RowLayout gap="1rem">
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>Small (0.75x)</h4>
                                    <div style={{ width: '100%', height: '200px', border: '1px solid #ccc' }}>
                                        <Polygon
                                            src={emptyImage}
                                            stretchMode="stretch"
                                            background="#f9fafb"
                                            showReticle={true}
                                            reticleSize={0.75}
                                            reticleColor="#22c55e"
                                            polygons={polygons7}
                                            onChange={setPolygons7}
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>Normal (1x)</h4>
                                    <div style={{ width: '100%', height: '200px', border: '1px solid #ccc' }}>
                                        <Polygon
                                            src={emptyImage}
                                            stretchMode="stretch"
                                            background="#f9fafb"
                                            showReticle={true}
                                            reticleSize={1}
                                            reticleColor="#ff0000"
                                            polygons={polygons8}
                                            onChange={setPolygons8}
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h4>Large (2x)</h4>
                                    <div style={{ width: '100%', height: '200px', border: '1px solid #ccc' }}>
                                        <Polygon
                                            src={emptyImage}
                                            stretchMode="originalSize"
                                            background="#f9fafb"
                                            showReticle={true}
                                            reticleSize={2}
                                            reticleColor="#8b5cf6"
                                            polygons={polygons9}
                                            onChange={setPolygons9}
                                        />
                                    </div>
                                </div>
                            </RowLayout>
                        </div>
                    </ColumnLayout>
                </Panel>

                <Panel>
                    <h2>ColorPicker Component</h2>
                    <ColumnLayout gap="2rem">
                        <div>
                            <h3>Basic ColorPicker</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                Default picker with hex input.
                            </p>
                            <RowLayout gap="2rem">
                                <ColorPicker
                                    color={color1}
                                    onChange={setColor1}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '80px', height: '80px', backgroundColor: color1, borderRadius: '8px', border: '1px solid #ccc' }} />
                                    <StaticText text={`Selected: ${color1}`} />
                                </div>
                            </RowLayout>
                        </div>

                        <div>
                            <h3>Without Hex Input</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                Picker only, no hex input field.
                            </p>
                            <RowLayout gap="2rem">
                                <ColorPicker
                                    color={color2}
                                    onChange={setColor2}
                                    showHex={false}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '80px', height: '80px', backgroundColor: color2, borderRadius: '8px', border: '1px solid #ccc' }} />
                                    <StaticText text={`Selected: ${color2}`} />
                                </div>
                            </RowLayout>
                        </div>

                        <div>
                            <h3>With Alpha Slider</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                Includes alpha/transparency slider.
                            </p>
                            <RowLayout gap="2rem">
                                <ColorPicker
                                    color={color3}
                                    onChange={setColor3}
                                    showAlpha={true}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundColor: color3.slice(0, 7),
                                        opacity: color3.length === 9 ? parseInt(color3.slice(7, 9), 16) / 255 : 1,
                                        borderRadius: '8px',
                                        border: '1px solid #ccc'
                                    }} />
                                    <StaticText text={`Selected: ${color3}`} />
                                </div>
                            </RowLayout>
                        </div>

                        <div>
                            <h3>All Features</h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                Hex input + alpha slider.
                            </p>
                            <RowLayout gap="2rem">
                                <ColorPicker
                                    color={color4}
                                    onChange={setColor4}
                                    showHex={true}
                                    showAlpha={true}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundColor: color4.slice(0, 7),
                                        opacity: color4.length === 9 ? parseInt(color4.slice(7, 9), 16) / 255 : 1,
                                        borderRadius: '8px',
                                        border: '1px solid #ccc'
                                    }} />
                                    <StaticText text={`Selected: ${color4}`} />
                                </div>
                            </RowLayout>
                        </div>
                    </ColumnLayout>
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
