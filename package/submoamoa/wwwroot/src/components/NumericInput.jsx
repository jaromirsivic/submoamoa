import React from 'react';

const NumericInput = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    decimalPlaces,
    disabled = false,
    style = {}
}) => {
    const [localValue, setLocalValue] = React.useState('');

    React.useEffect(() => {
        if (value !== undefined && value !== null) {
            setLocalValue(decimalPlaces !== undefined ? value.toFixed(decimalPlaces) : String(value));
        } else {
            setLocalValue('');
        }
    }, [value, decimalPlaces]);

    const handleBlur = () => {
        let val = parseFloat(localValue);
        if (isNaN(val)) {
            // Revert to original value if invalid
            setLocalValue(decimalPlaces !== undefined ? value.toFixed(decimalPlaces) : String(value));
            return;
        }

        // Clamp value
        if (min !== undefined && val < min) val = min;
        if (max !== undefined && val > max) val = max;

        // Notify change
        onChange(val);

        // Format display
        setLocalValue(decimalPlaces !== undefined ? val.toFixed(decimalPlaces) : String(val));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    const handleChange = (e) => {
        setLocalValue(e.target.value);
    };

    const inputStyle = {
        width: '80px',
        padding: '0.25rem',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
        textAlign: 'center'
    };

    return (
        <div className="custom-numeric-input responsive-input-container" style={{ opacity: disabled ? 0.5 : 1, ...style }}>
            {label && <label className="numeric-input-label" style={{ display: 'block', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>{label}</label>}
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                style={inputStyle}
            />
        </div>
    );
};

export default NumericInput;
