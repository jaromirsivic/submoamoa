import React from 'react';

const Button = ({
    label,
    onClick,
    color = '#3b82f6',
    disabled = false,
    style = {}
}) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const buttonStyle = {
        backgroundColor: color,
        color: '#ffffff',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontWeight: 500,
        transition: 'opacity 0.2s, transform 0.1s, box-shadow 0.2s',
        boxShadow: isHovered && !disabled ? 'inset 0 0 10px 2px rgba(255, 255, 255, 0.5)' : 'none',
        ...style
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={buttonStyle}
            className="custom-button"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label}
        </button>
    );
};

export default Button;
