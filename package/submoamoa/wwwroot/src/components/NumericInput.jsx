import React from 'react';

const NumericInput = ({
    value,
    onChange,
    min,
    max,
    step = 1,
    disabled = false,
    style = {}
}) => {
    const handleIncrement = () => {
        if (disabled) return;
        const newValue = Math.min(value + step, max !== undefined ? max : Infinity);
        onChange(newValue);
    };

    const handleDecrement = () => {
        if (disabled) return;
        const newValue = Math.max(value - step, min !== undefined ? min : -Infinity);
        onChange(newValue);
    };

    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: disabled ? 0.5 : 1,
        ...style
    };

    const buttonStyle = {
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#cbd5e1',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '1rem',
        lineHeight: 1
    };

    const inputStyle = {
        width: '60px',
        textAlign: 'center',
        padding: '0.25rem',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        backgroundColor: disabled ? '#f1f5f9' : '#ffffff'
    };

    return (
        <div className="custom-numeric-input" style={containerStyle}>
            <button onClick={handleDecrement} style={buttonStyle} disabled={disabled}>-</button>
            <input
                type="number"
                value={value}
                readOnly
                disabled={disabled}
                style={inputStyle}
            />
            <button onClick={handleIncrement} style={buttonStyle} disabled={disabled}>+</button>
        </div>
    );
};

export default NumericInput;
