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
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    
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

    // Get selection bounds
    const getSelectionBounds = () => {
        if (!selection.start) return null;
        const minRow = Math.min(selection.start.row, selection.end?.row ?? selection.start.row);
        const maxRow = Math.max(selection.start.row, selection.end?.row ?? selection.start.row);
        const minCol = Math.min(selection.start.col, selection.end?.col ?? selection.start.col);
        const maxCol = Math.max(selection.start.col, selection.end?.col ?? selection.start.col);
        return { minRow, maxRow, minCol, maxCol };
    };

    // Check if any selected cell is editable
    const isAnySelectedCellEditable = () => {
        const bounds = getSelectionBounds();
        if (!bounds) return false;
        for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
            for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
                if (isCellEditable(r, c)) return true;
            }
        }
        return false;
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
        setContextMenu({ visible: false, x: 0, y: 0 });
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

    // Handle context menu
    const handleContextMenu = (e) => {
        e.preventDefault();
        const rect = tableRef.current.getBoundingClientRect();
        setContextMenu({
            visible: true,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    // Close context menu
    const closeContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0 });
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

        // Escape to cancel edit or close context menu
        if (e.key === 'Escape') {
            setEditingCell(null);
            closeContextMenu();
            return;
        }

        // Arrow keys for navigation
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !editingCell) {
            e.preventDefault();
            
            if (e.shiftKey) {
                // Extend selection from the current end point (or start if no end)
                const currentEnd = selection.end || selection.start;
                let newRow = currentEnd.row;
                let newCol = currentEnd.col;

                switch (e.key) {
                    case 'ArrowUp': newRow = Math.max(0, currentEnd.row - 1); break;
                    case 'ArrowDown': newRow = Math.min(numRows - 1, currentEnd.row + 1); break;
                    case 'ArrowLeft': newCol = Math.max(0, currentEnd.col - 1); break;
                    case 'ArrowRight': newCol = Math.min(numCols - 1, currentEnd.col + 1); break;
                }

                setSelection({ start: selection.start, end: { row: newRow, col: newCol } });
            } else {
                // Move selection
                const { row, col } = selection.start;
                let newRow = row;
                let newCol = col;

                switch (e.key) {
                    case 'ArrowUp': newRow = Math.max(0, row - 1); break;
                    case 'ArrowDown': newRow = Math.min(numRows - 1, row + 1); break;
                    case 'ArrowLeft': newCol = Math.max(0, col - 1); break;
                    case 'ArrowRight': newCol = Math.min(numCols - 1, col + 1); break;
                }

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

    // Add rows after the last selected row
    const addRows = useCallback(() => {
        if (!canAddRows) return;
        const bounds = getSelectionBounds();
        if (!bounds) return;
        
        const numRowsToAdd = bounds.maxRow - bounds.minRow + 1;
        const insertAfterRow = bounds.maxRow;
        
        if (maxRows && cells.length + numRowsToAdd > maxRows) return;
        
        const newRows = Array(numRowsToAdd).fill(null).map(() => 
            Array(numCols).fill(null).map(() => ({ value: '' }))
        );
        
        const newCells = [
            ...cells.slice(0, insertAfterRow + 1),
            ...newRows,
            ...cells.slice(insertAfterRow + 1)
        ];
        
        updateCells(newCells);
        closeContextMenu();
    }, [canAddRows, selection, cells, numCols, maxRows, updateCells]);

    // Add columns after the last selected column
    const addColumns = useCallback(() => {
        if (!canAddColumns) return;
        const bounds = getSelectionBounds();
        if (!bounds) return;
        
        const numColsToAdd = bounds.maxCol - bounds.minCol + 1;
        const insertAfterCol = bounds.maxCol;
        
        if (maxColumns && numCols + numColsToAdd > maxColumns) return;
        
        const newCells = cells.map(row => {
            const newCellsForRow = Array(numColsToAdd).fill(null).map(() => ({ value: '' }));
            return [
                ...row.slice(0, insertAfterCol + 1),
                ...newCellsForRow,
                ...row.slice(insertAfterCol + 1)
            ];
        });
        
        updateCells(newCells);
        closeContextMenu();
    }, [canAddColumns, selection, cells, numCols, maxColumns, updateCells]);

    // Delete selected rows
    const deleteSelectedRows = useCallback(() => {
        if (!canDeleteRows) return;
        const bounds = getSelectionBounds();
        if (!bounds) return;
        
        const numRowsToDelete = bounds.maxRow - bounds.minRow + 1;
        if (cells.length - numRowsToDelete < 1) return;
        
        const newCells = cells.filter((_, i) => i < bounds.minRow || i > bounds.maxRow);
        updateCells(newCells);
        setSelection({ start: null, end: null });
        closeContextMenu();
    }, [canDeleteRows, selection, cells, updateCells]);

    // Delete selected columns
    const deleteSelectedColumns = useCallback(() => {
        if (!canDeleteColumns) return;
        const bounds = getSelectionBounds();
        if (!bounds) return;
        
        const numColsToDelete = bounds.maxCol - bounds.minCol + 1;
        if (numCols - numColsToDelete < 1) return;
        
        const newCells = cells.map(row => 
            row.filter((_, i) => i < bounds.minCol || i > bounds.maxCol)
        );
        updateCells(newCells);
        setSelection({ start: null, end: null });
        closeContextMenu();
    }, [canDeleteColumns, selection, cells, numCols, updateCells]);

    // Context menu action handlers
    const handleContextMenuCopy = () => {
        copySelection();
        closeContextMenu();
    };

    const handleContextMenuCut = () => {
        cutSelection();
        closeContextMenu();
    };

    const handleContextMenuPaste = () => {
        pasteClipboard();
        closeContextMenu();
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

    // Effect to close context menu on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (contextMenu.visible && tableRef.current && !tableRef.current.contains(e.target)) {
                closeContextMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [contextMenu.visible]);

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
        backgroundColor: '#fff',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
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

    const contextMenuStyle = {
        position: 'absolute',
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
        minWidth: '150px',
        padding: '4px 0'
    };

    const contextMenuItemStyle = (disabled = false) => ({
        padding: '8px 16px',
        cursor: disabled ? 'default' : 'pointer',
        backgroundColor: 'transparent',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        fontSize: '14px',
        color: disabled ? '#999' : '#333',
        display: 'block'
    });

    const contextMenuSeparatorStyle = {
        height: '1px',
        backgroundColor: '#e0e0e0',
        margin: '4px 0'
    };

    // Get bounds info for context menu labels
    const bounds = getSelectionBounds();
    const selectedColCount = bounds ? bounds.maxCol - bounds.minCol + 1 : 0;
    const selectedRowCount = bounds ? bounds.maxRow - bounds.minRow + 1 : 0;

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
            onContextMenu={handleContextMenu}
            onClick={() => contextMenu.visible && closeContextMenu()}
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
                        </div>
                    ))}
                </div>
            )}

            {/* Scrollable area with row headers and cells */}
            <div ref={scrollContainerRef} style={scrollContainerStyle}>
                {/* Row Headers */}
                {rowsHeaders && (
                    <div style={rowHeadersContainerStyle}>
                        {rowsHeaders.map((header, i) => (
                            <div key={i} style={headerCellStyle(header, true)}>
                                {header.name}
                            </div>
                        ))}
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
                                                backgroundColor: 'transparent',
                                                userSelect: 'text',
                                                WebkitUserSelect: 'text',
                                                MozUserSelect: 'text',
                                                msUserSelect: 'text'
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
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu.visible && (
                <div style={contextMenuStyle} onClick={(e) => e.stopPropagation()}>
                    <button
                        style={contextMenuItemStyle(false)}
                        onClick={handleContextMenuCopy}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Copy
                    </button>
                    <button
                        style={contextMenuItemStyle(!isAnySelectedCellEditable())}
                        onClick={isAnySelectedCellEditable() ? handleContextMenuCut : undefined}
                        disabled={!isAnySelectedCellEditable()}
                        onMouseEnter={(e) => isAnySelectedCellEditable() && (e.target.style.backgroundColor = '#f0f0f0')}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Cut
                    </button>
                    <button
                        style={contextMenuItemStyle(false)}
                        onClick={handleContextMenuPaste}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Paste
                    </button>
                    
                    <div style={contextMenuSeparatorStyle} />
                    
                    <button
                        style={contextMenuItemStyle(!canAddColumns || (maxColumns && numCols + selectedColCount > maxColumns))}
                        onClick={canAddColumns && (!maxColumns || numCols + selectedColCount <= maxColumns) ? addColumns : undefined}
                        disabled={!canAddColumns || (maxColumns && numCols + selectedColCount > maxColumns)}
                        onMouseEnter={(e) => canAddColumns && (!maxColumns || numCols + selectedColCount <= maxColumns) && (e.target.style.backgroundColor = '#f0f0f0')}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Add Column{selectedColCount > 1 ? `s (${selectedColCount})` : ''}
                    </button>
                    <button
                        style={contextMenuItemStyle(!canAddRows || (maxRows && cells.length + selectedRowCount > maxRows))}
                        onClick={canAddRows && (!maxRows || cells.length + selectedRowCount <= maxRows) ? addRows : undefined}
                        disabled={!canAddRows || (maxRows && cells.length + selectedRowCount > maxRows)}
                        onMouseEnter={(e) => canAddRows && (!maxRows || cells.length + selectedRowCount <= maxRows) && (e.target.style.backgroundColor = '#f0f0f0')}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Add Row{selectedRowCount > 1 ? `s (${selectedRowCount})` : ''}
                    </button>
                    <button
                        style={contextMenuItemStyle(!canDeleteColumns || numCols - selectedColCount < 1)}
                        onClick={canDeleteColumns && numCols - selectedColCount >= 1 ? deleteSelectedColumns : undefined}
                        disabled={!canDeleteColumns || numCols - selectedColCount < 1}
                        onMouseEnter={(e) => canDeleteColumns && numCols - selectedColCount >= 1 && (e.target.style.backgroundColor = '#f0f0f0')}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Delete Column{selectedColCount > 1 ? `s (${selectedColCount})` : ''}
                    </button>
                    <button
                        style={contextMenuItemStyle(!canDeleteRows || cells.length - selectedRowCount < 1)}
                        onClick={canDeleteRows && cells.length - selectedRowCount >= 1 ? deleteSelectedRows : undefined}
                        disabled={!canDeleteRows || cells.length - selectedRowCount < 1}
                        onMouseEnter={(e) => canDeleteRows && cells.length - selectedRowCount >= 1 && (e.target.style.backgroundColor = '#f0f0f0')}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Delete Row{selectedRowCount > 1 ? `s (${selectedRowCount})` : ''}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Table;
