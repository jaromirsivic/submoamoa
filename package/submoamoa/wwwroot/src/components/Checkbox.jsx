import React from 'react';

const Checkbox = ({
    label,
    labelPosition = 'left',
    value,
    onChange,
    disabled = false,
    style = {}
}) => {
    const containerStyle = {
        display: 'flex',
        flexDirection: labelPosition === 'top' ? 'column' : 'row',
        alignItems: labelPosition === 'top' ? 'flex-start' : 'center',
        gap: '0.5rem',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...style
    };

    const checkboxStyle = {
        width: '20px',
        height: '20px',
        border: `2px solid ${value ? '#3b82f6' : '#cbd5e1'}`,
        backgroundColor: value ? '#3b82f6' : 'transparent',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0
    };

    return (
        <div className="custom-checkbox-container" style={containerStyle}>
            {label && <span className="checkbox-label">{label}</span>}
            <div
                className="custom-checkbox"
                style={checkboxStyle}
                onClick={() => !disabled && onChange(!value)}
            >
                {value && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default Checkbox;
