import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * DatePicker component for selecting dates with calendar popup.
 * Displays as a ComboBox-style dropdown with date input trigger.
 * 
 * @param {string} label - Label text for the input
 * @param {string} timeZone - Time zone for date calculation (default: local)
 * @param {Date} value - Selected date value (default: midnight of current day)
 * @param {Date} minValue - Minimum selectable date (default: Jan 1, 1900)
 * @param {Date} maxValue - Maximum selectable date (default: Dec 31, 2199)
 * @param {string} format - Date format (default: 'yyyy-mm-dd')
 * @param {Function} onChange - Callback when date changes
 * @param {boolean} disabled - Whether the picker is disabled
 * @param {string} labelWidth - Width of the label
 */
const DatePicker = ({
    label,
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
    value,
    minValue,
    maxValue,
    format = 'yyyy-mm-dd',
    onChange,
    disabled = false,
    labelWidth
}) => {
    // Helper to get midnight in specified timezone
    const getMidnight = useCallback((date = new Date()) => {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const parts = formatter.formatToParts(date);
        const getPart = (type) => parts.find(p => p.type === type)?.value || '00';
        
        // Create date at midnight in the timezone
        const year = parseInt(getPart('year'));
        const month = parseInt(getPart('month')) - 1;
        const day = parseInt(getPart('day'));
        
        // Create a date object representing midnight
        const midnight = new Date(year, month, day, 0, 0, 0, 0);
        return midnight;
    }, [timeZone]);

    // Default values
    const defaultValue = getMidnight();
    const defaultMinValue = new Date(1900, 0, 1, 0, 0, 0, 0);
    const defaultMaxValue = new Date(2199, 11, 31, 0, 0, 0, 0);

    const currentValue = value ?? defaultValue;
    const currentMinValue = minValue ?? defaultMinValue;
    const currentMaxValue = maxValue ?? defaultMaxValue;

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [viewYear, setViewYear] = useState(currentValue.getFullYear());
    const [viewMonth, setViewMonth] = useState(currentValue.getMonth());
    const [isSelectingYear, setIsSelectingYear] = useState(false);
    const [isSelectingMonth, setIsSelectingMonth] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, openAbove: false });
    
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    // Calculate dropdown position when opening
    const updateDropdownPosition = useCallback(() => {
        if (!triggerRef.current) return;
        
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = 340;
        const dropdownWidth = 280;
        const spaceBelow = window.innerHeight - rect.bottom;
        const openAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
        
        // Calculate left position, ensuring it stays within viewport
        let left = rect.left;
        if (left + dropdownWidth > window.innerWidth) {
            left = window.innerWidth - dropdownWidth - 8;
        }
        if (left < 8) left = 8;
        
        setDropdownPosition({
            top: openAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
            left,
            openAbove
        });
    }, []);

    // Format date according to format string
    const formatDate = useCallback((date) => {
        if (!date || isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return format
            .replace(/yyyy/gi, year)
            .replace(/mm/gi, month)
            .replace(/dd/gi, day);
    }, [format]);

    // Parse date from string based on format
    const parseDate = useCallback((str) => {
        if (!str || typeof str !== 'string') return null;
        
        const formatLower = format.toLowerCase();
        const yearIndex = formatLower.indexOf('yyyy');
        const monthIndex = formatLower.indexOf('mm');
        const dayIndex = formatLower.indexOf('dd');
        
        // Extract separator from format
        const separator = format.replace(/[ymd]/gi, '')[0] || '-';
        const parts = str.split(separator);
        
        if (parts.length !== 3) return null;
        
        // Determine order based on format
        const positions = [
            { type: 'year', index: yearIndex },
            { type: 'month', index: monthIndex },
            { type: 'day', index: dayIndex }
        ].sort((a, b) => a.index - b.index);
        
        let year, month, day;
        positions.forEach((pos, i) => {
            const val = parseInt(parts[i], 10);
            if (pos.type === 'year') year = val;
            else if (pos.type === 'month') month = val;
            else if (pos.type === 'day') day = val;
        });
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
        if (month < 1 || month > 12) return null;
        if (day < 1 || day > 31) return null;
        
        const result = new Date(year, month - 1, day, 0, 0, 0, 0);
        
        // Verify the date is valid (e.g., not Feb 31)
        if (result.getDate() !== day || result.getMonth() !== month - 1) {
            return null;
        }
        
        return result;
    }, [format]);

    // Check if date is within bounds
    const isDateInBounds = useCallback((date) => {
        if (!date) return false;
        const time = date.getTime();
        return time >= currentMinValue.getTime() && time <= currentMaxValue.getTime();
    }, [currentMinValue, currentMaxValue]);

    // Update input value when external value changes
    useEffect(() => {
        setInputValue(formatDate(currentValue));
        setViewYear(currentValue.getFullYear());
        setViewMonth(currentValue.getMonth());
    }, [currentValue, formatDate]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            const isInsideContainer = containerRef.current && containerRef.current.contains(e.target);
            const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
            
            if (!isInsideContainer && !isInsideDropdown) {
                setIsOpen(false);
                setIsSelectingYear(false);
                setIsSelectingMonth(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle input change
    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        
        const parsed = parseDate(val);
        if (parsed && isDateInBounds(parsed)) {
            if (onChange) {
                onChange(parsed);
            }
            setViewYear(parsed.getFullYear());
            setViewMonth(parsed.getMonth());
        }
    };

    // Handle input blur - validate and revert if invalid
    const handleInputBlur = () => {
        const parsed = parseDate(inputValue);
        if (!parsed || !isDateInBounds(parsed)) {
            setInputValue(formatDate(currentValue));
        }
    };

    // Handle date selection from calendar
    const selectDate = (year, month, day) => {
        const newDate = new Date(year, month, day, 0, 0, 0, 0);
        if (isDateInBounds(newDate)) {
            if (onChange) {
                onChange(newDate);
            }
            setInputValue(formatDate(newDate));
            setIsOpen(false);
        }
    };

    // Navigate months
    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
        const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
        const startDay = firstDayOfMonth.getDay(); // 0 = Sunday
        const daysInMonth = lastDayOfMonth.getDate();
        
        // Get previous month's last days
        const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
        
        const days = [];
        
        // Previous month days
        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
            const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
            days.push({ day, month: prevMonth, year: prevYear, isCurrentMonth: false });
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({ day, month: viewMonth, year: viewYear, isCurrentMonth: true });
        }
        
        // Next month days to fill grid
        const remaining = 42 - days.length; // 6 rows x 7 days
        for (let day = 1; day <= remaining; day++) {
            const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
            const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
            days.push({ day, month: nextMonth, year: nextYear, isCurrentMonth: false });
        }
        
        return days;
    };

    // Check if a day is selected
    const isSelected = (year, month, day) => {
        return currentValue.getFullYear() === year &&
               currentValue.getMonth() === month &&
               currentValue.getDate() === day;
    };

    // Check if a day is today
    const isToday = (year, month, day) => {
        const today = new Date();
        return today.getFullYear() === year &&
               today.getMonth() === month &&
               today.getDate() === day;
    };

    // Generate years for year picker
    const generateYears = () => {
        const years = [];
        const startYear = Math.max(currentMinValue.getFullYear(), viewYear - 10);
        const endYear = Math.min(currentMaxValue.getFullYear(), viewYear + 10);
        for (let y = startYear; y <= endYear; y++) {
            years.push(y);
        }
        return years;
    };

    // Month names
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const calendarDays = generateCalendarDays();

    // Today button handler
    const goToToday = () => {
        const today = getMidnight();
        if (isDateInBounds(today)) {
            if (onChange) {
                onChange(today);
            }
            setInputValue(formatDate(today));
            setViewYear(today.getFullYear());
            setViewMonth(today.getMonth());
            setIsOpen(false);
        }
    };

    return (
        <div 
            className="custom-date-picker responsive-input-container" 
            ref={containerRef} 
            style={{ 
                position: 'relative', 
                opacity: disabled ? 0.5 : 1, 
                pointerEvents: disabled ? 'none' : 'auto', 
                gap: '1rem' 
            }}
        >
            {label && (
                <span style={{ 
                    whiteSpace: 'nowrap', 
                    width: labelWidth, 
                    minWidth: labelWidth, 
                    display: labelWidth ? 'inline-block' : 'inline' 
                }}>
                    {label}
                </span>
            )}
            
            {/* Input trigger */}
            <div
                ref={triggerRef}
                onClick={() => {
                    if (disabled) return;
                    if (!isOpen) {
                        updateDropdownPosition();
                    }
                    setIsOpen(!isOpen);
                    setIsSelectingYear(false);
                    setIsSelectingMonth(false);
                }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: '#fff',
                    minWidth: '160px'
                }}
            >
                {/* Calendar icon */}
                <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#666" 
                    strokeWidth="2"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onClick={(e) => e.stopPropagation()}
                    disabled={disabled}
                    placeholder={format}
                    style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace',
                        flex: 1,
                        backgroundColor: 'transparent',
                        minWidth: '100px'
                    }}
                />
                {!disabled && <span style={{ fontSize: '0.7rem', color: '#666' }}>▼</span>}
            </div>

            {/* Calendar dropdown - rendered via portal to escape overflow:hidden */}
            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: '280px',
                        padding: '12px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        zIndex: 10000,
                        userSelect: 'none'
                    }}
                >
                    {/* Year selector view */}
                    {isSelectingYear && (
                        <div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: '12px' 
                            }}>
                                <button
                                    onClick={() => setViewYear(viewYear - 20)}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        fontSize: '1.2rem',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        color: '#374151'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    ‹‹
                                </button>
                                <span style={{ fontWeight: '600', fontSize: '1rem', color: '#1f2937' }}>
                                    Select Year
                                </span>
                                <button
                                    onClick={() => setViewYear(viewYear + 20)}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        fontSize: '1.2rem',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        color: '#374151'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    ››
                                </button>
                            </div>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(4, 1fr)', 
                                gap: '4px',
                                maxHeight: '240px',
                                overflowY: 'auto'
                            }}>
                                {generateYears().map(y => (
                                    <button
                                        key={y}
                                        onClick={() => {
                                            setViewYear(y);
                                            setIsSelectingYear(false);
                                        }}
                                        style={{
                                            padding: '8px 4px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            backgroundColor: y === viewYear ? '#3b82f6' : 'transparent',
                                            color: y === viewYear ? '#fff' : '#374151',
                                            fontWeight: y === currentValue.getFullYear() ? '600' : '400',
                                            fontSize: '0.85rem'
                                        }}
                                        onMouseOver={(e) => { if (y !== viewYear) e.target.style.backgroundColor = '#e5e7eb'; }}
                                        onMouseOut={(e) => { if (y !== viewYear) e.target.style.backgroundColor = 'transparent'; }}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Month selector view */}
                    {isSelectingMonth && !isSelectingYear && (
                        <div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                marginBottom: '12px' 
                            }}>
                                <span style={{ fontWeight: '600', fontSize: '1rem', color: '#1f2937' }}>
                                    Select Month
                                </span>
                            </div>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(3, 1fr)', 
                                gap: '8px'
                            }}>
                                {monthNames.map((name, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setViewMonth(idx);
                                            setIsSelectingMonth(false);
                                        }}
                                        style={{
                                            padding: '10px 4px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            backgroundColor: idx === viewMonth ? '#3b82f6' : 'transparent',
                                            color: idx === viewMonth ? '#fff' : '#374151',
                                            fontWeight: idx === currentValue.getMonth() && viewYear === currentValue.getFullYear() ? '600' : '400',
                                            fontSize: '0.85rem'
                                        }}
                                        onMouseOver={(e) => { if (idx !== viewMonth) e.target.style.backgroundColor = '#e5e7eb'; }}
                                        onMouseOut={(e) => { if (idx !== viewMonth) e.target.style.backgroundColor = 'transparent'; }}
                                    >
                                        {name.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Calendar view */}
                    {!isSelectingYear && !isSelectingMonth && (
                        <>
                            {/* Header with navigation */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: '12px' 
                            }}>
                                <button
                                    onClick={prevMonth}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        fontSize: '1.2rem',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        color: '#374151'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    ‹
                                </button>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setIsSelectingMonth(true)}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            fontWeight: '600', 
                                            fontSize: '1rem',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            color: '#1f2937'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        {monthNames[viewMonth]}
                                    </button>
                                    <button
                                        onClick={() => setIsSelectingYear(true)}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            fontWeight: '600', 
                                            fontSize: '1rem',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            color: '#1f2937'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        {viewYear}
                                    </button>
                                </div>
                                <button
                                    onClick={nextMonth}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        fontSize: '1.2rem',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        color: '#374151'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    ›
                                </button>
                            </div>

                            {/* Day names header */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(7, 1fr)', 
                                gap: '2px',
                                marginBottom: '4px'
                            }}>
                                {dayNames.map(d => (
                                    <div 
                                        key={d} 
                                        style={{ 
                                            textAlign: 'center', 
                                            fontSize: '0.75rem', 
                                            color: '#6b7280', 
                                            fontWeight: '500',
                                            padding: '4px 0'
                                        }}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(7, 1fr)', 
                                gap: '2px' 
                            }}>
                                {calendarDays.map((dayInfo, idx) => {
                                    const date = new Date(dayInfo.year, dayInfo.month, dayInfo.day);
                                    const inBounds = isDateInBounds(date);
                                    const selected = isSelected(dayInfo.year, dayInfo.month, dayInfo.day);
                                    const todayCheck = isToday(dayInfo.year, dayInfo.month, dayInfo.day);
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => inBounds && selectDate(dayInfo.year, dayInfo.month, dayInfo.day)}
                                            disabled={!inBounds}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: todayCheck && !selected ? '2px solid #3b82f6' : 'none',
                                                borderRadius: '50%',
                                                cursor: inBounds ? 'pointer' : 'not-allowed',
                                                backgroundColor: selected ? '#3b82f6' : 'transparent',
                                                color: selected 
                                                    ? '#fff' 
                                                    : !inBounds 
                                                        ? '#d1d5db'
                                                        : dayInfo.isCurrentMonth 
                                                            ? '#1f2937' 
                                                            : '#9ca3af',
                                                fontWeight: todayCheck || selected ? '600' : '400',
                                                fontSize: '0.85rem',
                                                transition: 'background-color 0.15s',
                                                opacity: inBounds ? 1 : 0.5
                                            }}
                                            onMouseOver={(e) => { 
                                                if (inBounds && !selected) {
                                                    e.target.style.backgroundColor = '#e5e7eb'; 
                                                }
                                            }}
                                            onMouseOut={(e) => { 
                                                if (inBounds && !selected) {
                                                    e.target.style.backgroundColor = 'transparent'; 
                                                }
                                            }}
                                        >
                                            {dayInfo.day}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Footer with Today button */}
                            <div style={{ 
                                marginTop: '12px', 
                                paddingTop: '12px', 
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <button
                                    onClick={goToToday}
                                    style={{
                                        padding: '6px 16px',
                                        border: '1px solid #3b82f6',
                                        borderRadius: '4px',
                                        backgroundColor: 'transparent',
                                        color: '#3b82f6',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseOver={(e) => { 
                                        e.target.style.backgroundColor = '#3b82f6'; 
                                        e.target.style.color = '#fff';
                                    }}
                                    onMouseOut={(e) => { 
                                        e.target.style.backgroundColor = 'transparent'; 
                                        e.target.style.color = '#3b82f6';
                                    }}
                                >
                                    Today
                                </button>
                            </div>
                        </>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

export default DatePicker;

