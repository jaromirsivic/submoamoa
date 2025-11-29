import React from 'react';
import Button from './Button';

const ModalWindow = ({
    isOpen,
    title,
    children,
    onOk,
    onCancel,
    okLabel = 'OK',
    cancelLabel = 'Cancel'
}) => {
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
        maxHeight: '90vh'
    };

    const headerStyle = {
        padding: '1rem',
        borderBottom: '1px solid #e2e8f0',
        fontWeight: 'bold',
        fontSize: '1.25rem'
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
        gap: '1rem'
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    {title}
                </div>
                <div style={bodyStyle}>
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
                            color="#3b82f6"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalWindow;
