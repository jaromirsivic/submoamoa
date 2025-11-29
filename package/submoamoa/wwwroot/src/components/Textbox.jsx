import React, { useState } from 'react';

const Textbox = ({
    label,
    labelPosition = 'left',
    value,
    onChange,
    hint,
    disabled = false,
    style = {}
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const containerStyle = {
        display: 'flex',
        flexDirection: labelPosition === 'top' ? 'column' : 'row',
        alignItems: labelPosition === 'top' ? 'flex-start' : 'center',
        gap: '0.5rem',
        opacity: disabled ? 0.5 : 1,
        ...style
    };

    const inputStyle = {
        padding: '0.5rem',
        borderRadius: '0.375rem',
        border: '1px solid #cbd5e1',
        outline: 'none',
        width: '100%',
        transition: 'border-color 0.2s',
        backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
        borderColor: isFocused ? '#3b82f6' : '#cbd5e1'
    };

    return (
        <div className="custom-textbox-container" style={containerStyle}>
            {label && <label className="textbox-label">{label}</label>}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={isFocused ? '' : hint}
                disabled={disabled}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={inputStyle}
                className="custom-textbox"
            />
        </div>
    );
};

export default Textbox;
