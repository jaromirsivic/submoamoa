import React from 'react';

const Switch = ({
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

    const switchStyle = {
        position: 'relative',
        width: '40px',
        height: '24px',
        backgroundColor: value ? '#3b82f6' : '#cbd5e1',
        borderRadius: '24px',
        transition: 'background-color 0.2s',
        cursor: 'pointer',
        flexShrink: 0
    };

    const knobStyle = {
        position: 'absolute',
        top: '2px',
        left: value ? '18px' : '2px',
        width: '20px',
        height: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '50%',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    };

    return (
        <div className="custom-switch-container" style={containerStyle}>
            {label && <span className="switch-label">{label}</span>}
            <div
                className="custom-switch"
                style={switchStyle}
                onClick={() => !disabled && onChange(!value)}
            >
                <div style={knobStyle} />
            </div>
        </div>
    );
};

export default Switch;
