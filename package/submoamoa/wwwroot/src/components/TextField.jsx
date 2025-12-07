import React from 'react';

const TextField = ({
    text,
    fontSize = 14,
    fontColor = '#000000',
    fontFamily = 'Arial, sans-serif',
    fontStyle = 'normal',
    fontWeight = 'normal',
    style = {}
}) => {
    const computedStyle = {
        fontSize: `${fontSize}px`,
        color: fontColor,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        fontWeight: fontWeight,
        pointerEvents: 'none', // Ensure it doesn't interfere with scene interaction
        userSelect: 'none',
        ...style
    };

    return (
        <div style={computedStyle}>
            {text}
        </div>
    );
};

export default TextField;
