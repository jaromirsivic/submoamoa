import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import warningIcon from '../assets/icons/warning_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';

const ModalWindow = ({
    isOpen,
    title,
    children,
    onOk,
    onCancel,
    okLabel = 'OK',
    cancelLabel = 'Cancel',
    validationErrors = []
}) => {
    const [showTopShadow, setShowTopShadow] = useState(false);
    const [showBottomShadow, setShowBottomShadow] = useState(false);
    const [showWarningPopup, setShowWarningPopup] = useState(false);
    const bodyRef = useRef(null);

    const checkScroll = () => {
        if (bodyRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
            setShowTopShadow(scrollTop > 0);
            setShowBottomShadow(Math.ceil(scrollTop + clientHeight) < scrollHeight);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // Check initially and on resize
            checkScroll();
            window.addEventListener('resize', checkScroll);
            return () => window.removeEventListener('resize', checkScroll);
        }
    }, [isOpen, children]); // Re-check if children change

    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    };

    const modalStyle = {
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '90%',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        position: 'relative' // For absolute positioning of warning popup if needed
    };

    const headerStyle = {
        padding: '1rem',
        borderBottom: '1px solid #e2e8f0',
        fontWeight: 'bold',
        fontSize: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: showTopShadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
        zIndex: 10,
        transition: 'box-shadow 0.2s ease'
    };

    const bodyStyle = {
        padding: '1rem',
        overflowY: 'auto',
        flex: 1
    };

    const footerStyle = {
        padding: '1rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        boxShadow: showBottomShadow ? '0 -4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
        zIndex: 10,
        transition: 'box-shadow 0.2s ease'
    };

    const warningPopupStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        zIndex: 20,
        width: '80%',
        maxWidth: '400px',
        border: '1px solid #fee2e2'
    };

    const warningOverlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 15,
        borderRadius: '0.5rem'
    };

    const hasErrors = validationErrors.length > 0;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <span>{title}</span>
                    {hasErrors && (
                        <button
                            onClick={() => setShowWarningPopup(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#fee2e2'
                            }}
                            title="Show validation errors"
                        >
                            <img src={warningIcon} alt="Warning" width="24" height="24" />
                        </button>
                    )}
                </div>

                <div
                    style={bodyStyle}
                    ref={bodyRef}
                    onScroll={checkScroll}
                >
                    {children}
                </div>

                <div style={footerStyle}>
                    {onCancel && (
                        <Button
                            label={cancelLabel}
                            onClick={onCancel}
                            color="#64748b"
                        />
                    )}
                    {onOk && (
                        <Button
                            label={okLabel}
                            onClick={onOk}
                            color={hasErrors ? '#94a3b8' : '#3b82f6'}
                            disabled={hasErrors}
                        />
                    )}
                </div>

                {showWarningPopup && (
                    <>
                        <div style={warningOverlayStyle} onClick={() => setShowWarningPopup(false)} />
                        <div style={warningPopupStyle}>
                            <h3 style={{ color: '#ef4444', marginTop: 0, marginBottom: '1rem' }}>Validation Errors</h3>
                            <ul style={{ color: '#b91c1c', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                {validationErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    label="OK"
                                    onClick={() => setShowWarningPopup(false)}
                                    color="#ef4444"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ModalWindow;
