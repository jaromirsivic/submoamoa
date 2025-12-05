import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * ColorPicker component for selecting colors with optional hex input and alpha support.
 */
const ColorPicker = ({
    color = '#ff0000',
    onChange,
    showHex = true,
    showAlpha = false
}) => {
    // Parse color into HSV + Alpha
    const parseColor = useCallback((colorStr) => {
        let hex = colorStr;
        let alpha = 1;

        // Handle 8-digit hex (with alpha)
        if (colorStr.length === 9 && colorStr.startsWith('#')) {
            hex = colorStr.slice(0, 7);
            alpha = parseInt(colorStr.slice(7, 9), 16) / 255;
        } else if (colorStr.length === 7 && colorStr.startsWith('#')) {
            hex = colorStr;
            alpha = 1;
        }

        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        // Convert RGB to HSV
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        if (delta !== 0) {
            if (max === r) {
                h = ((g - b) / delta) % 6;
            } else if (max === g) {
                h = (b - r) / delta + 2;
            } else {
                h = (r - g) / delta + 4;
            }
            h = Math.round(h * 60);
            if (h < 0) h += 360;
        }

        const s = max === 0 ? 0 : delta / max;
        const v = max;

        return { h, s, v, a: alpha };
    }, []);

    // Convert HSV + Alpha to hex string
    const hsvToHex = useCallback((h, s, v, a = 1) => {
        const c = v * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = v - c;

        let r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        const toHex = (val) => Math.round((val + m) * 255).toString(16).padStart(2, '0');
        let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

        if (showAlpha && a < 1) {
            hex += Math.round(a * 255).toString(16).padStart(2, '0');
        }

        return hex;
    }, [showAlpha]);

    const [hsv, setHsv] = useState(() => parseColor(color));
    const [hexInput, setHexInput] = useState(color.slice(0, 7));

    const satBrightRef = useRef(null);
    const hueRef = useRef(null);
    const alphaRef = useRef(null);
    const [isDraggingSB, setIsDraggingSB] = useState(false);
    const [isDraggingHue, setIsDraggingHue] = useState(false);
    const [isDraggingAlpha, setIsDraggingAlpha] = useState(false);

    // Sync with external color prop
    useEffect(() => {
        const parsed = parseColor(color);
        setHsv(parsed);
        setHexInput(color.slice(0, 7));
    }, [color, parseColor]);

    // Notify onChange
    const notifyChange = useCallback((newHsv) => {
        if (onChange) {
            onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v, newHsv.a));
        }
    }, [onChange, hsvToHex]);

    // Saturation/Brightness picker
    const handleSBMouseDown = (e) => {
        setIsDraggingSB(true);
        updateSB(e);
    };

    const updateSB = (e) => {
        if (!satBrightRef.current) return;
        const rect = satBrightRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        const newHsv = { ...hsv, s: x, v: 1 - y };
        setHsv(newHsv);
        setHexInput(hsvToHex(newHsv.h, newHsv.s, newHsv.v, newHsv.a).slice(0, 7));
        notifyChange(newHsv);
    };

    // Hue slider
    const handleHueMouseDown = (e) => {
        setIsDraggingHue(true);
        updateHue(e);
    };

    const updateHue = (e) => {
        if (!hueRef.current) return;
        const rect = hueRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

        const newHsv = { ...hsv, h: Math.round(x * 360) };
        setHsv(newHsv);
        setHexInput(hsvToHex(newHsv.h, newHsv.s, newHsv.v, newHsv.a).slice(0, 7));
        notifyChange(newHsv);
    };

    // Alpha slider
    const handleAlphaMouseDown = (e) => {
        setIsDraggingAlpha(true);
        updateAlpha(e);
    };

    const updateAlpha = (e) => {
        if (!alphaRef.current) return;
        const rect = alphaRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

        const newHsv = { ...hsv, a: x };
        setHsv(newHsv);
        notifyChange(newHsv);
    };

    // Mouse move/up handlers
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingSB) updateSB(e);
            if (isDraggingHue) updateHue(e);
            if (isDraggingAlpha) updateAlpha(e);
        };

        const handleMouseUp = () => {
            setIsDraggingSB(false);
            setIsDraggingHue(false);
            setIsDraggingAlpha(false);
        };

        if (isDraggingSB || isDraggingHue || isDraggingAlpha) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingSB, isDraggingHue, isDraggingAlpha, hsv]);

    // Hex input change
    const handleHexChange = (e) => {
        const value = e.target.value;
        setHexInput(value);

        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            const parsed = parseColor(value);
            const newHsv = { ...parsed, a: hsv.a };
            setHsv(newHsv);
            notifyChange(newHsv);
        }
    };

    // Get current color as hex for display
    const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v, hsv.a);
    const pureHueHex = hsvToHex(hsv.h, 1, 1, 1);

    return (
        <div className="custom-color-picker" style={{ width: '220px', padding: '12px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            {/* Saturation/Brightness picker */}
            <div
                ref={satBrightRef}
                onMouseDown={handleSBMouseDown}
                style={{
                    width: '100%',
                    height: '150px',
                    borderRadius: '4px',
                    cursor: 'crosshair',
                    position: 'relative',
                    background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pureHueHex})`
                }}
            >
                <div style={{
                    position: 'absolute',
                    left: `${hsv.s * 100}%`,
                    top: `${(1 - hsv.v) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    pointerEvents: 'none'
                }} />
            </div>

            {/* Hue slider */}
            <div
                ref={hueRef}
                onMouseDown={handleHueMouseDown}
                style={{
                    width: '100%',
                    height: '12px',
                    marginTop: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    position: 'relative',
                    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                }}
            >
                <div style={{
                    position: 'absolute',
                    left: `${(hsv.h / 360) * 100}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    backgroundColor: pureHueHex,
                    pointerEvents: 'none'
                }} />
            </div>

            {/* Alpha slider */}
            {showAlpha && (
                <div
                    ref={alphaRef}
                    onMouseDown={handleAlphaMouseDown}
                    style={{
                        width: '100%',
                        height: '12px',
                        marginTop: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        position: 'relative',
                        background: `linear-gradient(to right, transparent, ${hsvToHex(hsv.h, hsv.s, hsv.v, 1).slice(0, 7)})`,
                        backgroundImage: `linear-gradient(to right, transparent, ${hsvToHex(hsv.h, hsv.s, hsv.v, 1).slice(0, 7)}), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Crect x='0' y='0' width='4' height='4' fill='%23ccc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23ccc'/%3E%3C/svg%3E")`
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        left: `${hsv.a * 100}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        backgroundColor: currentHex.slice(0, 7),
                        pointerEvents: 'none'
                    }} />
                </div>
            )}

            {/* Hex input and preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: currentHex.slice(0, 7),
                    opacity: hsv.a
                }} />
                {showHex && (
                    <input
                        type="text"
                        value={hexInput}
                        onChange={handleHexChange}
                        style={{
                            flex: 1,
                            padding: '6px 8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace'
                        }}
                        placeholder="#000000"
                    />
                )}
                {showAlpha && (
                    <span style={{ fontSize: '0.8rem', color: '#666', minWidth: '40px' }}>
                        {Math.round(hsv.a * 100)}%
                    </span>
                )}
            </div>
        </div>
    );
};

export default ColorPicker;
