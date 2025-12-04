import React from 'react';

const HorizontalSeparator = ({ label, fullWidth = false }) => {
    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        ...(fullWidth ? {
            width: 'calc(100% + 3rem)',
            marginLeft: '-1.5rem',
            marginRight: '-1.5rem',
            paddingLeft: '0', // Ensure line touches the left edge
            paddingRight: '0'
        } : {
            width: '100%'
        })
    };

    return (
        <div style={containerStyle}>
            <div style={{ width: fullWidth ? '1.5rem' : '1rem', height: '1px', backgroundColor: '#ddddddff' }}></div>
            {label && (
                <span style={{ fontWeight: '500', color: '#666', whiteSpace: 'nowrap' }}>
                    {label}
                </span>
            )}
            <div style={{ flexGrow: 1, height: '1px', backgroundColor: '#ddddddff' }}></div>
        </div>
    );
};

export default HorizontalSeparator;
