import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import warningIcon from '../assets/icons/warning.svg';

const ModalWindow = ({
    isOpen,
    title,
    children,
    onOk,
    onCancel,
    okLabel = 'OK',
    cancelLabel = 'Cancel',
    validationErrors = [],
    validationWarnings = [],
    okDisabled = false
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
        boxShadow: showTopShadow ? '0 16px 24px -4px rgba(0, 0, 0, 0.2)' : 'none',
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
        boxShadow: showBottomShadow ? '0 -16px 24px -4px rgba(0, 0, 0, 0.2)' : 'none',
        zIndex: 10,
        transition: 'box-shadow 0.2s ease'
    };

    const warningPopupStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#900000',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        zIndex: 20,
        width: '80%',
        maxWidth: '400px',
        border: '1px solid #fee2e2',
        color: '#ffffff'
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
    const hasWarnings = validationWarnings.length > 0;
    const hasIssues = hasErrors || hasWarnings;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <span>{title}</span>
                </div>

                <div
                    style={bodyStyle}
                    ref={bodyRef}
                    onScroll={checkScroll}
                >
                    {children}
                </div>

                <div style={footerStyle}>
                    {hasIssues && (
                        <Button
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <img src={warningIcon} alt="Warning" width="20" height="20" />
                                    <span>{hasErrors ? 'Error' : 'Warning'}</span>
                                </div>
                            }
                            onClick={() => setShowWarningPopup(true)}
                            color={hasErrors ? "#900000" : "#d07000"}
                            style={{ height: '40px', display: 'flex', alignItems: 'center' }}
                        />
                    )}
                    {onCancel && (
                        <Button
                            label={cancelLabel}
                            onClick={onCancel}
                            color="#64748b"
                            style={{ height: '40px', display: 'flex', alignItems: 'center' }}
                        />
                    )}
                    {onOk && (
                        <Button
                            label={okLabel}
                            onClick={onOk}
                            color={hasErrors || okDisabled ? '#94a3b8' : '#3b82f6'}
                            disabled={hasErrors || okDisabled}
                            style={{ height: '40px', display: 'flex', alignItems: 'center' }}
                        />
                    )}
                </div>

                {showWarningPopup && (
                    <>
                        <div style={warningOverlayStyle} onClick={() => setShowWarningPopup(false)} />
                        <div style={{
                            ...warningPopupStyle,
                            backgroundColor: hasErrors ? '#900000' : '#d07000',
                            border: hasErrors ? '1px solid #fee2e2' : '1px solid #fcd34d'
                        }}>
                            <h3 style={{ color: '#ffffff', marginTop: 0, marginBottom: '1rem' }}>
                                {hasErrors ? 'Validation Errors' : 'Warnings'}
                            </h3>
                            <ul style={{ color: '#ffffff', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                {validationErrors.map((error, index) => (
                                    <li key={`err-${index}`}>{error}</li>
                                ))}
                                {validationWarnings.map((warning, index) => (
                                    <li key={`warn-${index}`}>{warning}</li>
                                ))}
                            </ul>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    label="OK"
                                    onClick={() => setShowWarningPopup(false)}
                                    color="#3b82f6"
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
