import React from 'react';

const Button = ({
    label,
    onClick,
    color = '#3b82f6',
    disabled = false,
    style = {}
}) => {
    const buttonStyle = {
        backgroundColor: color,
        color: '#ffffff',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontWeight: 500,
        transition: 'opacity 0.2s, transform 0.1s',
        ...style
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={buttonStyle}
            className="custom-button"
        >
            {label}
        </button>
    );
};

export default Button;
