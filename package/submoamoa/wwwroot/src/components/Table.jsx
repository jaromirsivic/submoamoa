import React, { useState, useRef, useEffect, useCallback } from 'react';

const Table = ({
    width = '100%',
    height = 400,
    canAddRows = false,
    canAddColumns = false,
    canDeleteRows = false,
    canDeleteColumns = false,
    maxColumns = null,
    maxRows = null,
    cellsEditable = true,
    columnsHeaders = null,
    rowsHeaders = null,
    cells: initialCells = [],
    onCellsChange = null
}) => {
    // State
    const [cells, setCells] = useState(() => {
        // Deep clone initial cells
        return initialCells.map(row => row.map(cell => ({ ...cell })));
    });
    const [selection, setSelection] = useState({ start: null, end: null });
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [dragEnd, setDragEnd] = useState(null);
    const [isFillDragging, setIsFillDragging] = useState(false);
    const [fillDragStart, setFillDragStart] = useState(null);
    const [fillDragEnd, setFillDragEnd] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [clipboard, setClipboard] = useState(null);
    
    const tableRef = useRef(null);
    const inputRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Default column width and row height
    const defaultColWidth = 100;
    const defaultRowHeight = 32;
    const headerRowHeight = 36;
    const headerColWidth = 50;

    // Calculate dimensions
    const numCols = columnsHeaders ? columnsHeaders.length : (cells[0]?.length || 0);
    const numRows = rowsHeaders ? rowsHeaders.length : cells.length;

    // Get column width
    const getColWidth = (colIndex) => {
        if (columnsHeaders && columnsHeaders[colIndex]?.width) {
            return columnsHeaders[colIndex].width;
        }
        return defaultColWidth;
    };

    // Get row height
    const getRowHeight = (rowIndex) => {
        if (rowsHeaders && rowsHeaders[rowIndex]?.height) {
            return rowsHeaders[rowIndex].height;
        }
        return defaultRowHeight;
    };

    // Save state to history
    const saveToHistory = useCallback((newCells) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newCells)));
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    // Update cells and notify parent
    const updateCells = useCallback((newCells, saveHistory = true) => {
        if (saveHistory) {
            saveToHistory(newCells);
        }
        setCells(newCells);
        if (onCellsChange) {
            onCellsChange(newCells);
        }
    }, [onCellsChange, saveToHistory]);

    // Undo
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setCells(JSON.parse(JSON.stringify(history[historyIndex - 1])));
        }
    }, [history, historyIndex]);

    // Redo
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setCells(JSON.parse(JSON.stringify(history[historyIndex + 1])));
        }
    }, [history, historyIndex]);

    // Get cell value
    const getCellValue = (row, col) => {
        if (cells[row] && cells[row][col]) {
            return cells[row][col].value ?? '';
        }
        return '';
    };

    // Get cell style
    const getCellStyle = (row, col) => {
        const cell = cells[row]?.[col] || {};
        return {
            textAlign: cell.align || 'left',
            backgroundColor: cell.backgroundColor || '#ffffff',
            color: cell.textColor || '#000000',
            fontSize: cell.fontSize || '14px',
            fontFamily: cell.fontFamily || 'inherit',
            fontStyle: cell.fontStyle || 'normal',
            fontWeight: cell.fontWeight || 'normal'
        };
    };

    // Check if cell is editable
    const isCellEditable = (row, col) => {
        if (!cellsEditable) return false;
        const cell = cells[row]?.[col];
        if (cell && cell.editable === false) return false;
        return true;
    };

    // Check if cell is in selection
    const isCellSelected = (row, col) => {
        if (!selection.start) return false;
        const minRow = Math.min(selection.start.row, selection.end?.row ?? selection.start.row);
        const maxRow = Math.max(selection.start.row, selection.end?.row ?? selection.start.row);
        const minCol = Math.min(selection.start.col, selection.end?.col ?? selection.start.col);
        const maxCol = Math.max(selection.start.col, selection.end?.col ?? selection.start.col);
        return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
    };

    // Check if cell is in fill drag area
    const isCellInFillArea = (row, col) => {
        if (!fillDragStart || !fillDragEnd) return false;
        const minRow = Math.min(fillDragStart.row, fillDragEnd.row);
        const maxRow = Math.max(fillDragStart.row, fillDragEnd.row);
        const minCol = Math.min(fillDragStart.col, fillDragEnd.col);
        const maxCol = Math.max(fillDragStart.col, fillDragEnd.col);
        return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
    };

    // Handle cell click
    const handleCellClick = (row, col, e) => {
        if (e.shiftKey && selection.start) {
            setSelection({ start: selection.start, end: { row, col } });
        } else {
            setSelection({ start: { row, col }, end: { row, col } });
        }
        setEditingCell(null);
    };

    // Handle cell double click
    const handleCellDoubleClick = (row, col) => {
        if (isCellEditable(row, col)) {
            setEditingCell({ row, col });
            setEditValue(getCellValue(row, col));
        }
    };

    // Handle mouse down for selection
    const handleMouseDown = (row, col, e) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragStart({ row, col });
        setDragEnd({ row, col });
        if (!e.shiftKey) {
            setSelection({ start: { row, col }, end: { row, col } });
        }
    };

    // Handle mouse move for selection
    const handleMouseMove = (row, col) => {
        if (isDragging) {
            setDragEnd({ row, col });
            setSelection({ start: dragStart, end: { row, col } });
        }
        if (isFillDragging) {
            setFillDragEnd({ row, col });
        }
    };

    // Handle mouse up
    const handleMouseUp = () => {
        if (isFillDragging && fillDragStart && fillDragEnd) {
            // Apply fill
            applyFill();
        }
        setIsDragging(false);
        setIsFillDragging(false);
        setFillDragStart(null);
        setFillDragEnd(null);
    };

    // Apply fill operation
    const applyFill = () => {
        if (!selection.start || !fillDragEnd) return;
        
        const sourceValue = getCellValue(selection.start.row, selection.start.col);
        const sourceCell = cells[selection.start.row]?.[selection.start.col] || {};
        
        const minRow = Math.min(fillDragStart.row, fillDragEnd.row);
        const maxRow = Math.max(fillDragStart.row, fillDragEnd.row);
        const minCol = Math.min(fillDragStart.col, fillDragEnd.col);
        const maxCol = Math.max(fillDragStart.col, fillDragEnd.col);
        
        const newCells = cells.map((row, ri) =>
            row.map((cell, ci) => {
                if (ri >= minRow && ri <= maxRow && ci >= minCol && ci <= maxCol) {
                    if (isCellEditable(ri, ci)) {
                        return { ...cell, value: sourceValue };
                    }
                }
                return cell;
            })
        );
        
        updateCells(newCells);
    };

    // Handle fill handle mouse down
    const handleFillHandleMouseDown = (e) => {
        e.stopPropagation();
        if (!selection.start) return;
        setIsFillDragging(true);
        setFillDragStart(selection.start);
        setFillDragEnd(selection.end || selection.start);
    };

    // Handle edit input change
    const handleEditChange = (e) => {
        setEditValue(e.target.value);
    };

    // Handle edit input blur
    const handleEditBlur = () => {
        if (editingCell) {
            const newCells = cells.map((row, ri) =>
                row.map((cell, ci) => {
                    if (ri === editingCell.row && ci === editingCell.col) {
                        return { ...cell, value: editValue };
                    }
                    return cell;
                })
            );
            updateCells(newCells);
            setEditingCell(null);
        }
    };

    // Handle keyboard events
    const handleKeyDown = useCallback((e) => {
        if (!selection.start) return;

        // Ctrl+Z for undo
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
            return;
        }

        // Ctrl+Y for redo
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redo();
            return;
        }

        // Ctrl+C for copy
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            copySelection();
            return;
        }

        // Ctrl+V for paste
        if (e.ctrlKey && e.key === 'v') {
            e.preventDefault();
            pasteClipboard();
            return;
        }

        // Ctrl+X for cut
        if (e.ctrlKey && e.key === 'x') {
            e.preventDefault();
            cutSelection();
            return;
        }

        // Delete key
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (!editingCell) {
                e.preventDefault();
                deleteSelection();
            }
            return;
        }

        // Ctrl+Enter to fill selection with value
        if (e.ctrlKey && e.key === 'Enter') {
            if (editingCell) {
                e.preventDefault();
                fillSelectionWithValue(editValue);
                setEditingCell(null);
            }
            return;
        }

        // Enter to confirm edit or start editing
        if (e.key === 'Enter' && !e.ctrlKey) {
            if (editingCell) {
                handleEditBlur();
                // Move to next row
                const nextRow = Math.min(editingCell.row + 1, numRows - 1);
                setSelection({ start: { row: nextRow, col: editingCell.col }, end: { row: nextRow, col: editingCell.col } });
            } else if (selection.start && isCellEditable(selection.start.row, selection.start.col)) {
                handleCellDoubleClick(selection.start.row, selection.start.col);
            }
            return;
        }

        // Escape to cancel edit
        if (e.key === 'Escape') {
            setEditingCell(null);
            return;
        }

        // Arrow keys for navigation
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !editingCell) {
            e.preventDefault();
            const { row, col } = selection.start;
            let newRow = row;
            let newCol = col;

            switch (e.key) {
                case 'ArrowUp': newRow = Math.max(0, row - 1); break;
                case 'ArrowDown': newRow = Math.min(numRows - 1, row + 1); break;
                case 'ArrowLeft': newCol = Math.max(0, col - 1); break;
                case 'ArrowRight': newCol = Math.min(numCols - 1, col + 1); break;
            }

            if (e.shiftKey) {
                setSelection({ start: selection.start, end: { row: newRow, col: newCol } });
            } else {
                setSelection({ start: { row: newRow, col: newCol }, end: { row: newRow, col: newCol } });
            }
        }

        // Tab for horizontal navigation
        if (e.key === 'Tab' && !editingCell) {
            e.preventDefault();
            const { row, col } = selection.start;
            const newCol = e.shiftKey ? Math.max(0, col - 1) : Math.min(numCols - 1, col + 1);
            setSelection({ start: { row, col: newCol }, end: { row, col: newCol } });
        }

        // Start typing to edit
        if (!editingCell && !e.ctrlKey && !e.altKey && e.key.length === 1) {
            if (selection.start && isCellEditable(selection.start.row, selection.start.col)) {
                setEditingCell(selection.start);
                setEditValue(e.key);
            }
        }
    }, [selection, editingCell, editValue, numRows, numCols, cells, undo, redo]);

    // Copy selection
    const copySelection = () => {
        if (!selection.start) return;
        const minRow = Math.min(selection.start.row, selection.end?.row ?? selection.start.row);
        const maxRow = Math.max(selection.start.row, selection.end?.row ?? selection.start.row);
        const minCol = Math.min(selection.start.col, selection.end?.col ?? selection.start.col);
        const maxCol = Math.max(selection.start.col, selection.end?.col ?? selection.start.col);

        const copiedData = [];
        for (let r = minRow; r <= maxRow; r++) {
            const rowData = [];
            for (let c = minCol; c <= maxCol; c++) {
                rowData.push({ ...cells[r]?.[c] } || { value: '' });
            }
            copiedData.push(rowData);
        }
        setClipboard(copiedData);

        // Also copy to system clipboard as text
        const textData = copiedData.map(row => row.map(cell => cell.value ?? '').join('\t')).join('\n');
        navigator.clipboard?.writeText(textData);
    };

    // Cut selection
    const cutSelection = () => {
        copySelection();
        deleteSelection();
    };

    // Paste clipboard
    const pasteClipboard = async () => {
        if (!selection.start) return;

        let dataToPaste = clipboard;

        // Try to get from system clipboard
        try {
            const text = await navigator.clipboard?.readText();
            if (text) {
                dataToPaste = text.split('\n').map(row => 
                    row.split('\t').map(value => ({ value }))
                );
            }
        } catch (e) {
            // Use internal clipboard
        }

        if (!dataToPaste) return;

        const startRow = selection.start.row;
        const startCol = selection.start.col;

        const newCells = cells.map((row, ri) =>
            row.map((cell, ci) => {
                const pasteRow = ri - startRow;
                const pasteCol = ci - startCol;
                if (pasteRow >= 0 && pasteRow < dataToPaste.length &&
                    pasteCol >= 0 && pasteCol < dataToPaste[pasteRow].length) {
                    if (isCellEditable(ri, ci)) {
                        return { ...cell, value: dataToPaste[pasteRow][pasteCol].value };
                    }
                }
                return cell;
            })
        );

        updateCells(newCells);
    };

    // Delete selection
    const deleteSelection = () => {
        if (!selection.start) return;
        const minRow = Math.min(selection.start.row, selection.end?.row ?? selection.start.row);
        const maxRow = Math.max(selection.start.row, selection.end?.row ?? selection.start.row);
        const minCol = Math.min(selection.start.col, selection.end?.col ?? selection.start.col);
        const maxCol = Math.max(selection.start.col, selection.end?.col ?? selection.start.col);

        const newCells = cells.map((row, ri) =>
            row.map((cell, ci) => {
                if (ri >= minRow && ri <= maxRow && ci >= minCol && ci <= maxCol) {
                    if (isCellEditable(ri, ci)) {
                        return { ...cell, value: '' };
                    }
                }
                return cell;
            })
        );

        updateCells(newCells);
    };

    // Fill selection with value (Ctrl+Enter)
    const fillSelectionWithValue = (value) => {
        if (!selection.start) return;
        const minRow = Math.min(selection.start.row, selection.end?.row ?? selection.start.row);
        const maxRow = Math.max(selection.start.row, selection.end?.row ?? selection.start.row);
        const minCol = Math.min(selection.start.col, selection.end?.col ?? selection.start.col);
        const maxCol = Math.max(selection.start.col, selection.end?.col ?? selection.start.col);

        const newCells = cells.map((row, ri) =>
            row.map((cell, ci) => {
                if (ri >= minRow && ri <= maxRow && ci >= minCol && ci <= maxCol) {
                    if (isCellEditable(ri, ci)) {
                        return { ...cell, value };
                    }
                }
                return cell;
            })
        );

        updateCells(newCells);
    };

    // Add row
    const addRow = () => {
        if (maxRows && cells.length >= maxRows) return;
        const newRow = Array(numCols).fill(null).map(() => ({ value: '' }));
        const newCells = [...cells, newRow];
        updateCells(newCells);
    };

    // Add column
    const addColumn = () => {
        if (maxColumns && numCols >= maxColumns) return;
        const newCells = cells.map(row => [...row, { value: '' }]);
        updateCells(newCells);
    };

    // Delete row
    const deleteRow = (rowIndex) => {
        if (cells.length <= 1) return;
        const newCells = cells.filter((_, i) => i !== rowIndex);
        updateCells(newCells);
        setSelection({ start: null, end: null });
    };

    // Delete column
    const deleteColumn = (colIndex) => {
        if (numCols <= 1) return;
        const newCells = cells.map(row => row.filter((_, i) => i !== colIndex));
        updateCells(newCells);
        setSelection({ start: null, end: null });
    };

    // Effect to focus input when editing
    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingCell]);

    // Effect for keyboard events
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (tableRef.current?.contains(document.activeElement) || 
                tableRef.current === document.activeElement) {
                handleKeyDown(e);
            }
        };
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, [handleKeyDown]);

    // Effect for mouse up
    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, [isFillDragging, fillDragStart, fillDragEnd]);

    // Calculate total dimensions
    const totalWidth = Array(numCols).fill(0).reduce((sum, _, i) => sum + getColWidth(i), 0);
    const totalHeight = Array(numRows).fill(0).reduce((sum, _, i) => sum + getRowHeight(i), 0);

    // Styles
    const containerStyle = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: `${height}px`,
        border: '1px solid #ccc',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        position: 'relative',
        outline: 'none',
        backgroundColor: '#fff'
    };

    const headerRowStyle = {
        display: 'flex',
        flexDirection: 'row',
        flexShrink: 0,
        backgroundColor: '#f0f0f0',
        borderBottom: '2px solid #999'
    };

    const scrollContainerStyle = {
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'row'
    };

    const rowHeadersContainerStyle = {
        flexShrink: 0,
        backgroundColor: '#f0f0f0',
        borderRight: '2px solid #999'
    };

    const cellsContainerStyle = {
        flex: 1,
        position: 'relative'
    };

    const cellStyle = (row, col) => {
        const style = getCellStyle(row, col);
        const isSelected = isCellSelected(row, col);
        const isEditing = editingCell?.row === row && editingCell?.col === col;
        const isInFillArea = isCellInFillArea(row, col);

        return {
            width: `${getColWidth(col)}px`,
            height: `${getRowHeight(row)}px`,
            minWidth: `${getColWidth(col)}px`,
            minHeight: `${getRowHeight(row)}px`,
            boxSizing: 'border-box',
            borderRight: '1px solid #ddd',
            borderBottom: '1px solid #ddd',
            padding: '4px 6px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'cell',
            position: 'relative',
            ...style,
            backgroundColor: isSelected ? '#cce5ff' : (isInFillArea ? '#e0e0ff' : style.backgroundColor),
            outline: isEditing ? '2px solid #0066cc' : (isSelected && selection.start?.row === row && selection.start?.col === col ? '2px solid #0066cc' : 'none'),
            outlineOffset: '-2px'
        };
    };

    const headerCellStyle = (header, isRow = false) => ({
        width: isRow ? `${headerColWidth}px` : `${header?.width || defaultColWidth}px`,
        height: isRow ? `${header?.height || defaultRowHeight}px` : `${headerRowHeight}px`,
        minWidth: isRow ? `${headerColWidth}px` : `${header?.width || defaultColWidth}px`,
        minHeight: isRow ? `${header?.height || defaultRowHeight}px` : `${headerRowHeight}px`,
        boxSizing: 'border-box',
        borderRight: '1px solid #999',
        borderBottom: isRow ? '1px solid #999' : 'none',
        padding: '4px 6px',
        fontWeight: header?.fontWeight || 'bold',
        textAlign: header?.align || 'center',
        backgroundColor: header?.backgroundColor || '#e0e0e0',
        color: header?.textColor || '#333',
        fontSize: header?.fontSize || '14px',
        fontFamily: header?.fontFamily || 'inherit',
        fontStyle: header?.fontStyle || 'normal',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: header?.align === 'right' ? 'flex-end' : (header?.align === 'center' ? 'center' : 'flex-start')
    });

    const fillHandleStyle = {
        position: 'absolute',
        right: '-3px',
        bottom: '-3px',
        width: '6px',
        height: '6px',
        backgroundColor: '#0066cc',
        cursor: 'crosshair',
        zIndex: 10
    };

    // Get selected cell position for fill handle
    const getSelectedCellPosition = () => {
        if (!selection.start) return null;
        const endRow = selection.end?.row ?? selection.start.row;
        const endCol = selection.end?.col ?? selection.start.col;
        const maxRow = Math.max(selection.start.row, endRow);
        const maxCol = Math.max(selection.start.col, endCol);

        let left = rowsHeaders ? headerColWidth : 0;
        for (let c = 0; c < maxCol; c++) {
            left += getColWidth(c);
        }
        left += getColWidth(maxCol);

        let top = 0;
        for (let r = 0; r < maxRow; r++) {
            top += getRowHeight(r);
        }
        top += getRowHeight(maxRow);

        return { left, top };
    };

    const fillHandlePosition = getSelectedCellPosition();

    return (
        <div
            ref={tableRef}
            style={containerStyle}
            tabIndex={0}
        >
            {/* Column Headers */}
            {columnsHeaders && (
                <div style={headerRowStyle}>
                    {rowsHeaders && (
                        <div style={{
                            width: `${headerColWidth}px`,
                            height: `${headerRowHeight}px`,
                            backgroundColor: '#d0d0d0',
                            borderRight: '2px solid #999',
                            borderBottom: '2px solid #999',
                            flexShrink: 0
                        }} />
                    )}
                    {columnsHeaders.map((header, i) => (
                        <div key={i} style={headerCellStyle(header)}>
                            {header.name}
                            {canDeleteColumns && (
                                <button
                                    onClick={() => deleteColumn(i)}
                                    style={{
                                        marginLeft: '4px',
                                        padding: '0 4px',
                                        fontSize: '10px',
                                        cursor: 'pointer',
                                        backgroundColor: '#ff6666',
                                        border: 'none',
                                        borderRadius: '2px',
                                        color: '#fff'
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    {canAddColumns && (!maxColumns || numCols < maxColumns) && (
                        <button
                            onClick={addColumn}
                            style={{
                                width: '30px',
                                height: `${headerRowHeight}px`,
                                cursor: 'pointer',
                                backgroundColor: '#4caf50',
                                border: 'none',
                                color: '#fff',
                                fontSize: '18px'
                            }}
                        >
                            +
                        </button>
                    )}
                </div>
            )}

            {/* Scrollable area with row headers and cells */}
            <div ref={scrollContainerRef} style={scrollContainerStyle}>
                {/* Row Headers */}
                {rowsHeaders && (
                    <div style={rowHeadersContainerStyle}>
                        {rowsHeaders.map((header, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={headerCellStyle(header, true)}>
                                    {header.name}
                                </div>
                                {canDeleteRows && (
                                    <button
                                        onClick={() => deleteRow(i)}
                                        style={{
                                            padding: '0 4px',
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            backgroundColor: '#ff6666',
                                            border: 'none',
                                            borderRadius: '2px',
                                            color: '#fff',
                                            marginLeft: '-20px'
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        {canAddRows && (!maxRows || cells.length < maxRows) && (
                            <button
                                onClick={addRow}
                                style={{
                                    width: `${headerColWidth}px`,
                                    height: '30px',
                                    cursor: 'pointer',
                                    backgroundColor: '#4caf50',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '18px'
                                }}
                            >
                                +
                            </button>
                        )}
                    </div>
                )}

                {/* Cells */}
                <div style={cellsContainerStyle}>
                    {cells.map((row, ri) => (
                        <div key={ri} style={{ display: 'flex' }}>
                            {row.map((cell, ci) => (
                                <div
                                    key={ci}
                                    style={cellStyle(ri, ci)}
                                    onClick={(e) => handleCellClick(ri, ci, e)}
                                    onDoubleClick={() => handleCellDoubleClick(ri, ci)}
                                    onMouseDown={(e) => handleMouseDown(ri, ci, e)}
                                    onMouseMove={() => handleMouseMove(ri, ci)}
                                >
                                    {editingCell?.row === ri && editingCell?.col === ci ? (
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={editValue}
                                            onChange={handleEditChange}
                                            onBlur={handleEditBlur}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                                outline: 'none',
                                                padding: 0,
                                                margin: 0,
                                                font: 'inherit',
                                                backgroundColor: 'transparent'
                                            }}
                                        />
                                    ) : (
                                        cell.value ?? ''
                                    )}
                                    {/* Fill handle */}
                                    {selection.start?.row === ri && selection.start?.col === ci &&
                                     (!selection.end || (selection.end.row === ri && selection.end.col === ci)) && (
                                        <div
                                            style={fillHandleStyle}
                                            onMouseDown={handleFillHandleMouseDown}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                    
                    {/* Add row button (when no row headers) */}
                    {canAddRows && !rowsHeaders && (!maxRows || cells.length < maxRows) && (
                        <button
                            onClick={addRow}
                            style={{
                                width: '100%',
                                height: '30px',
                                cursor: 'pointer',
                                backgroundColor: '#4caf50',
                                border: 'none',
                                color: '#fff',
                                fontSize: '14px'
                            }}
                        >
                            + Add Row
                        </button>
                    )}
                </div>
            </div>

            {/* Add column button (when no column headers) */}
            {canAddColumns && !columnsHeaders && (!maxColumns || numCols < maxColumns) && (
                <button
                    onClick={addColumn}
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: '30px',
                        height: '100%',
                        cursor: 'pointer',
                        backgroundColor: '#4caf50',
                        border: 'none',
                        color: '#fff',
                        fontSize: '18px'
                    }}
                >
                    +
                </button>
            )}
        </div>
    );
};

export default Table;
