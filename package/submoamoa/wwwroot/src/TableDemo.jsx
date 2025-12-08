import React, { useState } from 'react';
import Table from './components/Table';
import Panel from './components/Panel';
import StaticText from './components/StaticText';
import HorizontalSeparator from './components/HorizontalSeparator';

const TableDemo = () => {
    // Example 1: Basic table with column and row headers
    const columnHeaders1 = [
        { name: 'Product', width: 150, align: 'left', backgroundColor: '#4a90d9', textColor: '#ffffff' },
        { name: 'Q1', width: 80, align: 'center', backgroundColor: '#4a90d9', textColor: '#ffffff' },
        { name: 'Q2', width: 80, align: 'center', backgroundColor: '#4a90d9', textColor: '#ffffff' },
        { name: 'Q3', width: 80, align: 'center', backgroundColor: '#4a90d9', textColor: '#ffffff' },
        { name: 'Q4', width: 80, align: 'center', backgroundColor: '#4a90d9', textColor: '#ffffff' },
        { name: 'Total', width: 100, align: 'right', backgroundColor: '#2d5986', textColor: '#ffffff', fontWeight: 'bold' }
    ];

    const rowHeaders1 = [
        { name: '2021', height: 32, align: 'center', backgroundColor: '#e8e8e8' },
        { name: '2022', height: 32, align: 'center', backgroundColor: '#e8e8e8' },
        { name: '2023', height: 32, align: 'center', backgroundColor: '#e8e8e8' },
        { name: '2024', height: 32, align: 'center', backgroundColor: '#e8e8e8' }
    ];

    const [cells1, setCells1] = useState([
        [
            { value: 'Widget A', align: 'left' },
            { value: '1250', align: 'right' },
            { value: '1340', align: 'right' },
            { value: '1520', align: 'right' },
            { value: '1680', align: 'right' },
            { value: '5790', align: 'right', fontWeight: 'bold', backgroundColor: '#f0f8ff' }
        ],
        [
            { value: 'Widget B', align: 'left' },
            { value: '980', align: 'right' },
            { value: '1120', align: 'right' },
            { value: '1350', align: 'right' },
            { value: '1480', align: 'right' },
            { value: '4930', align: 'right', fontWeight: 'bold', backgroundColor: '#f0f8ff' }
        ],
        [
            { value: 'Widget C', align: 'left' },
            { value: '2100', align: 'right' },
            { value: '2350', align: 'right' },
            { value: '2580', align: 'right' },
            { value: '2890', align: 'right' },
            { value: '9920', align: 'right', fontWeight: 'bold', backgroundColor: '#f0f8ff' }
        ],
        [
            { value: 'Widget D', align: 'left' },
            { value: '750', align: 'right' },
            { value: '820', align: 'right' },
            { value: '910', align: 'right' },
            { value: '1050', align: 'right' },
            { value: '3530', align: 'right', fontWeight: 'bold', backgroundColor: '#f0f8ff' }
        ]
    ]);

    // Example 2: Editable table with add/delete capabilities
    const columnHeaders2 = [
        { name: 'Name', width: 150, align: 'left' },
        { name: 'Email', width: 200, align: 'left' },
        { name: 'Department', width: 120, align: 'center' },
        { name: 'Salary', width: 100, align: 'right' }
    ];

    const [cells2, setCells2] = useState([
        [
            { value: 'John Doe', align: 'left' },
            { value: 'john@example.com', align: 'left' },
            { value: 'Engineering', align: 'center' },
            { value: '$85,000', align: 'right' }
        ],
        [
            { value: 'Jane Smith', align: 'left' },
            { value: 'jane@example.com', align: 'left' },
            { value: 'Marketing', align: 'center' },
            { value: '$72,000', align: 'right' }
        ],
        [
            { value: 'Bob Johnson', align: 'left' },
            { value: 'bob@example.com', align: 'left' },
            { value: 'Sales', align: 'center' },
            { value: '$68,000', align: 'right' }
        ]
    ]);

    // Example 3: Simple table without headers
    const [cells3, setCells3] = useState([
        [{ value: 'A1' }, { value: 'B1' }, { value: 'C1' }, { value: 'D1' }],
        [{ value: 'A2' }, { value: 'B2' }, { value: 'C2' }, { value: 'D2' }],
        [{ value: 'A3' }, { value: 'B3' }, { value: 'C3' }, { value: 'D3' }],
        [{ value: 'A4' }, { value: 'B4' }, { value: 'C4' }, { value: 'D4' }]
    ]);

    // Example 4: Color-coded data table
    const columnHeaders4 = [
        { name: 'Metric', width: 120, align: 'left', backgroundColor: '#333', textColor: '#fff' },
        { name: 'Jan', width: 70, align: 'center', backgroundColor: '#333', textColor: '#fff' },
        { name: 'Feb', width: 70, align: 'center', backgroundColor: '#333', textColor: '#fff' },
        { name: 'Mar', width: 70, align: 'center', backgroundColor: '#333', textColor: '#fff' },
        { name: 'Status', width: 80, align: 'center', backgroundColor: '#333', textColor: '#fff' }
    ];

    const [cells4] = useState([
        [
            { value: 'Revenue', align: 'left', fontWeight: 'bold' },
            { value: '45K', align: 'center' },
            { value: '52K', align: 'center' },
            { value: '61K', align: 'center' },
            { value: '↑ Good', align: 'center', backgroundColor: '#d4edda', textColor: '#155724' }
        ],
        [
            { value: 'Expenses', align: 'left', fontWeight: 'bold' },
            { value: '38K', align: 'center' },
            { value: '41K', align: 'center' },
            { value: '44K', align: 'center' },
            { value: '→ OK', align: 'center', backgroundColor: '#fff3cd', textColor: '#856404' }
        ],
        [
            { value: 'Profit', align: 'left', fontWeight: 'bold' },
            { value: '7K', align: 'center' },
            { value: '11K', align: 'center' },
            { value: '17K', align: 'center' },
            { value: '↑ Great', align: 'center', backgroundColor: '#c3e6cb', textColor: '#155724' }
        ],
        [
            { value: 'Customers', align: 'left', fontWeight: 'bold' },
            { value: '120', align: 'center' },
            { value: '115', align: 'center' },
            { value: '108', align: 'center' },
            { value: '↓ Alert', align: 'center', backgroundColor: '#f8d7da', textColor: '#721c24' }
        ]
    ]);

    return (
        <div className="page-container" style={{ padding: '1rem' }}>
            <h1 style={{ marginBottom: '1rem' }}>Table Component Demo</h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Example 1 */}
                <Panel title="Example 1: Sales Data Table (with Row & Column Headers)">
                    <div style={{ marginBottom: '1rem' }}>
                        <StaticText text="A read-only sales report with pinned headers. Try scrolling if content overflows." />
                    </div>
                    <Table
                        height={200}
                        columnsHeaders={columnHeaders1}
                        rowsHeaders={rowHeaders1}
                        cells={cells1}
                        cellsEditable={true}
                        onCellsChange={setCells1}
                    />
                    <div style={{ marginTop: '0.5rem', fontSize: '12px', color: '#666' }}>
                        <strong>Features:</strong> Column headers (blue), Row headers (gray), Editable cells, Ctrl+C/V for copy/paste
                    </div>
                </Panel>

                {/* Example 2 */}
                <Panel title="Example 2: Employee Directory (Add/Delete Rows)">
                    <div style={{ marginBottom: '1rem' }}>
                        <StaticText text="Editable employee table with ability to add and delete rows. Max 10 rows." />
                    </div>
                    <Table
                        height={200}
                        columnsHeaders={columnHeaders2}
                        cells={cells2}
                        cellsEditable={true}
                        canAddRows={true}
                        canDeleteRows={true}
                        maxRows={10}
                        onCellsChange={setCells2}
                    />
                    <div style={{ marginTop: '0.5rem', fontSize: '12px', color: '#666' }}>
                        <strong>Features:</strong> Add rows (+), Delete rows (×), Max 10 rows limit, Undo (Ctrl+Z), Redo (Ctrl+Y)
                    </div>
                </Panel>

                {/* Example 3 */}
                <Panel title="Example 3: Simple Grid (No Headers)">
                    <div style={{ marginBottom: '1rem' }}>
                        <StaticText text="Simple spreadsheet-like grid. Select multiple cells and press Ctrl+Enter to fill all with the same value." />
                    </div>
                    <Table
                        height={180}
                        cells={cells3}
                        cellsEditable={true}
                        canAddRows={true}
                        canAddColumns={true}
                        maxRows={8}
                        maxColumns={6}
                        onCellsChange={setCells3}
                    />
                    <div style={{ marginTop: '0.5rem', fontSize: '12px', color: '#666' }}>
                        <strong>Features:</strong> No headers, Add rows/columns, Drag fill handle (corner), Shift+Click for range selection
                    </div>
                </Panel>

                {/* Example 4 */}
                <Panel title="Example 4: Dashboard Metrics (Color-Coded)">
                    <div style={{ marginBottom: '1rem' }}>
                        <StaticText text="Dashboard-style metrics table with color-coded status indicators." />
                    </div>
                    <Table
                        height={180}
                        columnsHeaders={columnHeaders4}
                        cells={cells4}
                        cellsEditable={false}
                    />
                    <div style={{ marginTop: '0.5rem', fontSize: '12px', color: '#666' }}>
                        <strong>Features:</strong> Read-only, Custom cell colors, Status indicators
                    </div>
                </Panel>

                {/* Keyboard Shortcuts */}
                <Panel title="Keyboard Shortcuts Reference">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <HorizontalSeparator label="Navigation" fullWidth />
                            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '13px' }}>
                                <li><strong>Arrow Keys</strong> - Move selection</li>
                                <li><strong>Tab</strong> - Move right</li>
                                <li><strong>Shift+Tab</strong> - Move left</li>
                                <li><strong>Shift+Arrow</strong> - Extend selection</li>
                            </ul>
                        </div>
                        <div>
                            <HorizontalSeparator label="Editing" fullWidth />
                            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '13px' }}>
                                <li><strong>Enter</strong> - Edit cell / Confirm</li>
                                <li><strong>Escape</strong> - Cancel edit</li>
                                <li><strong>Delete</strong> - Clear selection</li>
                                <li><strong>Type</strong> - Start editing</li>
                            </ul>
                        </div>
                        <div>
                            <HorizontalSeparator label="Clipboard" fullWidth />
                            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '13px' }}>
                                <li><strong>Ctrl+C</strong> - Copy</li>
                                <li><strong>Ctrl+X</strong> - Cut</li>
                                <li><strong>Ctrl+V</strong> - Paste</li>
                                <li><strong>Ctrl+Enter</strong> - Fill selection</li>
                            </ul>
                        </div>
                        <div>
                            <HorizontalSeparator label="History" fullWidth />
                            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '13px' }}>
                                <li><strong>Ctrl+Z</strong> - Undo</li>
                                <li><strong>Ctrl+Y</strong> - Redo</li>
                            </ul>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
};

export default TableDemo;
