import React, { useState, useRef, useEffect } from 'react';
import NumericInput from './NumericInput';

const Slider = ({
    label,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    decimalPlaces,
    disabled = false,
    allowManualInput = false,
    style = {}
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef(null);

    const percentage = ((value - min) / (max - min)) * 100;

    // Get clientX from either mouse or touch event
    const getClientX = (e) => {
        if (e.touches && e.touches.length > 0) {
            return e.touches[0].clientX;
        }
        if (e.changedTouches && e.changedTouches.length > 0) {
            return e.changedTouches[0].clientX;
        }
        return e.clientX;
    };

    const handleMouseDown = (e) => {
        if (disabled) return;
        setIsDragging(true);
        updateValue(e);
    };

    const handleTouchStart = (e) => {
        if (disabled) return;
        e.preventDefault(); // Prevent scrolling
        setIsDragging(true);
        updateValue(e);
    };

    const updateValue = (e) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const clientX = getClientX(e);
        const x = clientX - rect.left;
        const width = rect.width;
        let newPercentage = x / width;
        newPercentage = Math.max(0, Math.min(1, newPercentage));

        let newValue = min + newPercentage * (max - min);
        // Snap to step
        newValue = Math.round(newValue / step) * step;
        // Clamp
        newValue = Math.max(min, Math.min(max, newValue));

        onChange(newValue);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                updateValue(e);
            }
        };

        const handleTouchMove = (e) => {
            if (isDragging) {
                e.preventDefault(); // Prevent scrolling while dragging
                updateValue(e);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const handleTouchEnd = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, min, max, step, onChange]);

    const trackStyle = {
        position: 'relative',
        width: '100%',
        height: '4px',
        backgroundColor: '#cbd5e1',
        borderRadius: '2px',
        cursor: 'pointer',
        flex: 1,
        touchAction: 'none' // Prevent browser from interpreting touch as scroll
    };

    const fillStyle = {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: `${percentage}%`,
        backgroundColor: '#3b82f6',
        borderRadius: '2px'
    };

    const thumbStyle = {
        position: 'absolute',
        left: `${percentage}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '16px',
        height: '16px',
        backgroundColor: '#ffffff',
        border: '2px solid #3b82f6',
        borderRadius: '50%',
        cursor: 'grab',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    };

    const valueLabelStyle = {
        position: 'absolute',
        left: `${percentage}%`,
        top: '-25px',
        transform: 'translateX(-50%)',
        backgroundColor: '#1e293b',
        color: '#ffffff',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        whiteSpace: 'nowrap'
    };

    return (
        <div className="custom-slider responsive-input-container" style={{ width: '100%', opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto', gap: '1rem', ...style }}>
            {label && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            <div style={{ position: 'relative', width: '100%', height: '40px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isDragging && !allowManualInput && <div style={valueLabelStyle}>{value}</div>}
                <div
                    ref={trackRef}
                    style={trackStyle}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    <div style={fillStyle} />
                    <div style={thumbStyle} />
                </div>

                {allowManualInput && (
                    <div style={{ width: '80px' }}>
                        <NumericInput
                            value={value}
                            onChange={onChange}
                            min={min}
                            max={max}
                            step={step}
                            decimalPlaces={decimalPlaces}
                            disabled={disabled}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Slider;
