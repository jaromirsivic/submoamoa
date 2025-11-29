import React from 'react';

const Panel = ({
    children,
    backgroundColor = '#ffffff',
    textColor,
    enabled = true,
    style = {}
}) => {
    const panelStyle = {
        backgroundColor: backgroundColor,
        color: textColor || 'inherit',
        borderRadius: '0.5rem',
        boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        opacity: enabled ? 1 : 0.6,
        pointerEvents: enabled ? 'auto' : 'none',
        transition: 'all 0.3s ease',
        ...style
    };

    return (
        <div className="custom-panel" style={panelStyle}>
            {children}
        </div>
    );
};

export default Panel;
