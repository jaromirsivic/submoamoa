import React from 'react';

const StaticText = ({
    text,
    disabled = false,
    style = {}
}) => {
    const textStyle = {
        opacity: disabled ? 0.5 : 1,
        color: 'inherit',
        ...style
    };

    return (
        <span style={textStyle} className="custom-static-text">
            {text}
        </span>
    );
};

export default StaticText;
