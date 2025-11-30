import React from 'react';

const NumericInput = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    disabled = false,
    style = {}
}) => {
    const inputStyle = {
        width: '80px',
        padding: '0.25rem',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
        textAlign: 'center'
    };

    return (
        <div className="custom-numeric-input responsive-input-container" style={{ opacity: disabled ? 0.5 : 1, ...style }}>
            {label && <label className="numeric-input-label" style={{ display: 'block', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>{label}</label>}
            <input
                type="number"
                value={value}
                onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                        onChange(val);
                    }
                }}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                style={inputStyle}
            />
        </div>
    );
};

export default NumericInput;
