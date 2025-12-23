import React, { useState } from 'react';
import Panel from './components/Panel';
import ColumnLayout from './components/ColumnLayout';
import RowLayout from './components/RowLayout';
import DatePicker from './components/DatePicker';
import StaticText from './components/StaticText';
import Button from './components/Button';

/**
 * Demo page for DatePicker component in the Sandbox.
 * Showcases various configurations and use cases.
 */
const DatePickerDemo = () => {
    // State for different demo instances
    const [date1, setDate1] = useState(new Date());
    const [date2, setDate2] = useState(new Date(2024, 0, 15));
    const [date3, setDate3] = useState(new Date());
    const [date4, setDate4] = useState(new Date());
    const [date5, setDate5] = useState(new Date(2000, 5, 15));

    // Format date for display in demo
    const formatForDisplay = (date) => {
        if (!date) return 'null';
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    return (
        <div className="page-container">
            <ColumnLayout gap="2rem">
                <Panel>
                    <h2>DatePicker Component</h2>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>
                        A flexible date picker with calendar popup, keyboard input, and copy/paste support.
                    </p>
                </Panel>

                <Panel>
                    <h3>Basic Usage</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        Default DatePicker with <code>yyyy-mm-dd</code> format. Click to open calendar, type to enter date manually.
                    </p>
                    <ColumnLayout gap="1rem" style={{ maxWidth: '400px' }}>
                        <DatePicker
                            label="Select Date"
                            value={date1}
                            onChange={setDate1}
                        />
                        <div style={{ 
                            padding: '12px', 
                            backgroundColor: '#f8fafc', 
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem'
                        }}>
                            <strong>Selected:</strong> {formatForDisplay(date1)}
                        </div>
                    </ColumnLayout>
                </Panel>

                <Panel>
                    <h3>With Label and Custom Width</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        DatePicker with consistent label width for form alignment.
                    </p>
                    <ColumnLayout gap="1rem" style={{ maxWidth: '500px' }}>
                        <DatePicker
                            label="Start Date"
                            labelWidth="100px"
                            value={date2}
                            onChange={setDate2}
                        />
                        <DatePicker
                            label="End Date"
                            labelWidth="100px"
                            value={date3}
                            onChange={setDate3}
                        />
                    </ColumnLayout>
                </Panel>

                <Panel>
                    <h3>With Min/Max Constraints</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        DatePicker limited to dates between <strong>January 1, 2020</strong> and <strong>December 31, 2025</strong>.
                        Dates outside this range are disabled.
                    </p>
                    <ColumnLayout gap="1rem" style={{ maxWidth: '400px' }}>
                        <DatePicker
                            label="Constrained Date"
                            value={date4}
                            onChange={setDate4}
                            minValue={new Date(2020, 0, 1)}
                            maxValue={new Date(2025, 11, 31)}
                        />
                        <div style={{ 
                            padding: '12px', 
                            backgroundColor: '#fef3c7', 
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                        }}>
                            ⚠️ Try navigating to years before 2020 or after 2025 - those dates are disabled.
                        </div>
                    </ColumnLayout>
                </Panel>

                <Panel>
                    <h3>Different Date Formats</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        DatePicker supports various date formats through the <code>format</code> prop.
                    </p>
                    <ColumnLayout gap="1.5rem">
                        <RowLayout gap="2rem" style={{ flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>ISO Format (yyyy-mm-dd)</h4>
                                <DatePicker
                                    value={date5}
                                    onChange={setDate5}
                                    format="yyyy-mm-dd"
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>US Format (mm/dd/yyyy)</h4>
                                <DatePicker
                                    value={date5}
                                    onChange={setDate5}
                                    format="mm/dd/yyyy"
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>European Format (dd.mm.yyyy)</h4>
                                <DatePicker
                                    value={date5}
                                    onChange={setDate5}
                                    format="dd.mm.yyyy"
                                />
                            </div>
                        </RowLayout>
                        <div style={{ 
                            padding: '12px', 
                            backgroundColor: '#f0f9ff', 
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                        }}>
                            ℹ️ All three pickers above are bound to the same date value. Change one to see them all update.
                        </div>
                    </ColumnLayout>
                </Panel>

                <Panel>
                    <h3>Disabled State</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        DatePicker in disabled state - no interaction allowed.
                    </p>
                    <DatePicker
                        label="Disabled"
                        value={new Date(2024, 5, 15)}
                        onChange={() => {}}
                        disabled
                    />
                </Panel>

                <Panel>
                    <h3>Features</h3>
                    <ColumnLayout gap="0.75rem">
                        <StaticText text="✓ Click month/year to quickly jump to different months and years" />
                        <StaticText text="✓ Type date directly in the input field" />
                        <StaticText text="✓ Copy/paste dates in the specified format" />
                        <StaticText text="✓ Today button for quick selection of current date" />
                        <StaticText text="✓ Previous/next month navigation with arrow buttons" />
                        <StaticText text="✓ Visual indicators for today's date and selected date" />
                        <StaticText text="✓ Grayed out days from previous/next months" />
                        <StaticText text="✓ Min/max date constraints" />
                        <StaticText text="✓ Automatic popup positioning (opens above if no space below)" />
                    </ColumnLayout>
                </Panel>

                <Panel>
                    <h3>Programmatic Control</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        Set dates programmatically using buttons.
                    </p>
                    <ColumnLayout gap="1rem" style={{ maxWidth: '500px' }}>
                        <DatePicker
                            label="Controlled Date"
                            labelWidth="120px"
                            value={date1}
                            onChange={setDate1}
                        />
                        <RowLayout gap="0.5rem" style={{ flexWrap: 'wrap' }}>
                            <Button
                                label="Today"
                                onClick={() => setDate1(new Date())}
                            />
                            <Button
                                label="New Year 2025"
                                onClick={() => setDate1(new Date(2025, 0, 1))}
                            />
                            <Button
                                label="Christmas 2024"
                                onClick={() => setDate1(new Date(2024, 11, 25))}
                            />
                            <Button
                                label="Random"
                                onClick={() => {
                                    const year = 2000 + Math.floor(Math.random() * 50);
                                    const month = Math.floor(Math.random() * 12);
                                    const day = 1 + Math.floor(Math.random() * 28);
                                    setDate1(new Date(year, month, day));
                                }}
                            />
                        </RowLayout>
                    </ColumnLayout>
                </Panel>
            </ColumnLayout>
        </div>
    );
};

export default DatePickerDemo;

