import React, { useState, useEffect } from 'react';

const Carousel = ({
    images = [],
    allowMaximize = false,
    disabled = false,
    style = {}
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        if (disabled || images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [images.length, disabled]);

    const handleNext = (e) => {
        e.stopPropagation();
        if (disabled) return;
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        if (disabled) return;
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const toggleMaximize = () => {
        if (disabled || !allowMaximize) return;
        setIsMaximized(!isMaximized);
    };

    const containerStyle = {
        position: 'relative',
        width: '100%',
        height: isMaximized ? '100vh' : '300px',
        backgroundColor: 'transparent', // Transparent background
        borderRadius: isMaximized ? 0 : '0.5rem',
        overflow: 'hidden',
        opacity: disabled ? 0.6 : 1,
        zIndex: isMaximized ? 1000 : 1,
        position: isMaximized ? 'fixed' : 'relative',
        top: isMaximized ? 0 : 'auto',
        left: isMaximized ? 0 : 'auto',
        ...style
    };

    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        position: 'absolute',
        top: 0,
        left: 0,
        transition: 'opacity 0.25s ease-in-out' // Fade transition
    };

    const buttonStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '1.5rem',
        borderRadius: '4px',
        zIndex: 2
    };

    const maximizeButtonStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        border: 'none',
        padding: '0.5rem',
        cursor: 'pointer',
        borderRadius: '4px',
        zIndex: 3
    };

    if (images.length === 0) {
        return (
            <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                No Images
            </div>
        );
    }

    return (
        <div className="custom-carousel" style={containerStyle}>
            {images.map((img, index) => (
                <img
                    key={index}
                    src={img}
                    alt={`Slide ${index}`}
                    style={{
                        ...imageStyle,
                        opacity: index === currentIndex ? 1 : 0,
                        zIndex: index === currentIndex ? 1 : 0
                    }}
                />
            ))}

            {images.length > 1 && (
                <>
                    <button style={{ ...buttonStyle, left: '10px' }} onClick={handlePrev}>&lt;</button>
                    <button style={{ ...buttonStyle, right: '10px' }} onClick={handleNext}>&gt;</button>
                </>
            )}

            {allowMaximize && !disabled && (
                <button style={maximizeButtonStyle} onClick={toggleMaximize}>
                    {isMaximized ? 'Minimize' : 'Maximize'}
                </button>
            )}
        </div>
    );
};

export default Carousel;
