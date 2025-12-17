import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Polygon component for drawing and editing polygons over an image.
 * 
 * Interaction:
 * - Click to add points when drawing
 * - Click on first point to close the polygon
 * - After closing: drag points to move them
 * - Double-click on polygon to delete it and start over
 */
const Polygon = ({
    border = 0,
    src,
    stretchMode = 'fit',
    background = 'transparent',
    style = {},
    borderColor = '#009900ff',
    fillColor = '#00ee0055',
    lineWidth = 1,
    maxPoints = 32,
    maxPolygons = 8,
    polygons: externalPolygons = [],
    onChange,
    // Reticle props
    reticleX = 0.5,
    reticleY = 0.5,
    showReticle = false,
    reticleSize = 1,
    reticleColor = '#ff0000cc',
    // Mode: 'viewer' (view only), 'designer' (draw polygons), 'joystick'
    mode = 'designer',
    // Joystick props
    joystickColor = '#999999cc',
    joystickSize = 48, // ~0.5 inches at 96 DPI
    joystickLineWidth = 2,
    joystickLineMaxLength = 0.25, // 25% of smaller dimension
    joystickLineMaxLengthMultiplierMode = 'minWidthHeight', // 'minWidthHeight' | 'width' | 'height'
    joystickSnapAnimationDuration = 0.1, // seconds
    joystickLineColor1 = '#5555ffff', // color when dynamic on static
    joystickLineColor2 = '#ff0000ff', // color when at max distance
    joystickZeroRadius = 0.01, // dead zone radius (fraction of max length)
    joystickMoveInterval = 0, // interval in ms to throttle onJoystickMove calls (0 = no throttle)
    onJoystickMove, // callback with { x, y } normalized offset from center
    onJoystickStart, // callback when joystick becomes active
    onJoystickEnd // callback when joystick is released
}) => {
    const [polygons, setPolygons] = useState(externalPolygons);
    const [currentPolygon, setCurrentPolygon] = useState(null); // Points being drawn (not yet closed)
    const [draggingPoint, setDraggingPoint] = useState(null); // { polyIndex, pointIndex }

    // Joystick state
    const [joystickStatic, setJoystickStatic] = useState(null); // { x, y } normalized
    const [joystickDynamic, setJoystickDynamic] = useState(null); // { x, y } normalized
    const [isJoystickActive, setIsJoystickActive] = useState(false);
    const joystickAnimationRef = useRef(null);

    // Joystick move throttling state
    const lastJoystickMoveTimeRef = useRef(0);
    const pendingJoystickMoveRef = useRef(null); // stores pending {x, y} to send
    const joystickThrottleTimeoutRef = useRef(null);
    const lastSentJoystickCoordsRef = useRef(null); // stores last sent {x, y}
    const joystickReleasedRef = useRef(false); // prevents throttle callbacks after release
    const joystickHadMovementRef = useRef(false); // tracks if there was movement since start

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Sync with external polygons
    useEffect(() => {
        setPolygons(externalPolygons);
    }, [externalPolygons]);

    // Handle image load
    useEffect(() => {
        if (imageRef.current && imageRef.current.complete) {
            handleImageLoad();
        }
    }, [src]);

    const handleImageLoad = () => {
        if (imageRef.current) {
            setImageSize({
                width: imageRef.current.naturalWidth,
                height: imageRef.current.naturalHeight
            });
            setImageLoaded(true);
        }
    };

    // Update container size on resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Get clientX/Y from either mouse or touch event
    const getClientCoords = useCallback((e) => {
        if (e.touches && e.touches.length > 0) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        }
        if (e.changedTouches && e.changedTouches.length > 0) {
            return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
        }
        return { clientX: e.clientX, clientY: e.clientY };
    }, []);

    // Convert screen coordinates to normalized coordinates (0-1 range relative to container)
    const screenToNormalized = useCallback((screenX, screenY) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return {
            x: Math.max(0, Math.min(1, (screenX - rect.left) / rect.width)),
            y: Math.max(0, Math.min(1, (screenY - rect.top) / rect.height))
        };
    }, []);

    // Convert normalized coordinates to canvas coordinates
    const normalizedToCanvas = useCallback((normX, normY) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        return {
            x: normX * canvasRef.current.width,
            y: normY * canvasRef.current.height
        };
    }, []);

    // Convert normalized coordinates to screen coordinates
    const normalizedToScreen = useCallback((normX, normY) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return {
            x: normX * rect.width + rect.left,
            y: normY * rect.height + rect.top
        };
    }, []);

    // Get reference dimension for joystick max length calculation based on mode
    const getJoystickReferenceDimension = useCallback(() => {
        switch (joystickLineMaxLengthMultiplierMode) {
            case 'width':
                return containerSize.width;
            case 'height':
                return containerSize.height;
            case 'minWidthHeight':
            default:
                return Math.min(containerSize.width, containerSize.height);
        }
    }, [joystickLineMaxLengthMultiplierMode, containerSize]);

    // Check if screen point is near a normalized point
    const isNearPoint = (screenX, screenY, normPoint, threshold = 10) => {
        const screenPoint = normalizedToScreen(normPoint.x, normPoint.y);
        const dx = screenX - screenPoint.x;
        const dy = screenY - screenPoint.y;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
    };

    // Check if point is inside polygon (using normalized coordinates)
    const isPointInPolygon = (normPoint, polygon) => {
        if (polygon.length < 3) return false;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            const intersect = ((yi > normPoint.y) !== (yj > normPoint.y)) &&
                (normPoint.x < (xj - xi) * (normPoint.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    // Find point at screen coordinates
    const findPointAt = (screenX, screenY) => {
        // Check current polygon being drawn
        if (currentPolygon) {
            for (let i = 0; i < currentPolygon.length; i++) {
                if (isNearPoint(screenX, screenY, currentPolygon[i])) {
                    return { polyIndex: -1, pointIndex: i }; // -1 indicates current polygon
                }
            }
        }
        // Check closed polygons
        for (let polyIndex = 0; polyIndex < polygons.length; polyIndex++) {
            const polygon = polygons[polyIndex];
            for (let pointIndex = 0; pointIndex < polygon.length; pointIndex++) {
                if (isNearPoint(screenX, screenY, polygon[pointIndex])) {
                    return { polyIndex, pointIndex };
                }
            }
        }
        return null;
    };

    // Find polygon at screen coordinates
    const findPolygonAt = (screenX, screenY) => {
        const normCoords = screenToNormalized(screenX, screenY);
        for (let i = polygons.length - 1; i >= 0; i--) {
            if (isPointInPolygon(normCoords, polygons[i])) {
                return i;
            }
        }
        return null;
    };

    // Draw everything on canvas
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (src && !imageLoaded) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw closed polygons
        polygons.forEach((polygon) => {
            if (polygon.length < 3) return;

            ctx.beginPath();
            const first = normalizedToCanvas(polygon[0].x, polygon[0].y);
            ctx.moveTo(first.x, first.y);

            for (let i = 1; i < polygon.length; i++) {
                const pt = normalizedToCanvas(polygon[i].x, polygon[i].y);
                ctx.lineTo(pt.x, pt.y);
            }
            ctx.closePath();

            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();

            // Draw vertex points
            polygon.forEach((point) => {
                const canvasPt = normalizedToCanvas(point.x, point.y);
                ctx.beginPath();
                ctx.arc(canvasPt.x, canvasPt.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = borderColor;
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        });

        // Draw current polygon being drawn
        if (currentPolygon && currentPolygon.length > 0) {
            ctx.beginPath();
            const first = normalizedToCanvas(currentPolygon[0].x, currentPolygon[0].y);
            ctx.moveTo(first.x, first.y);

            for (let i = 1; i < currentPolygon.length; i++) {
                const pt = normalizedToCanvas(currentPolygon[i].x, currentPolygon[i].y);
                ctx.lineTo(pt.x, pt.y);
            }

            ctx.strokeStyle = borderColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();

            // Draw vertex points
            currentPolygon.forEach((point, index) => {
                const canvasPt = normalizedToCanvas(point.x, point.y);
                ctx.beginPath();
                ctx.arc(canvasPt.x, canvasPt.y, index === 0 ? 8 : 5, 0, Math.PI * 2);
                ctx.fillStyle = index === 0 ? '#ff6600' : borderColor; // First point highlighted
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        }

        // Draw reticle if enabled
        if (showReticle) {
            const centerPos = normalizedToCanvas(reticleX, reticleY);
            const baseSize = 20 * reticleSize;
            const gapSize = 6 * reticleSize;
            const lineLength = 14 * reticleSize;
            const dotRadius = 2 * reticleSize;
            const lineWidth = 2 * reticleSize;

            ctx.save();
            ctx.strokeStyle = reticleColor;
            ctx.fillStyle = reticleColor;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';

            // Draw center dot
            ctx.beginPath();
            ctx.arc(centerPos.x, centerPos.y, dotRadius, 0, Math.PI * 2);
            ctx.fill();

            // Draw four lines with gaps
            // Top line
            ctx.beginPath();
            ctx.moveTo(centerPos.x, centerPos.y - gapSize);
            ctx.lineTo(centerPos.x, centerPos.y - gapSize - lineLength);
            ctx.stroke();

            // Bottom line
            ctx.beginPath();
            ctx.moveTo(centerPos.x, centerPos.y + gapSize);
            ctx.lineTo(centerPos.x, centerPos.y + gapSize + lineLength);
            ctx.stroke();

            // Left line
            ctx.beginPath();
            ctx.moveTo(centerPos.x - gapSize, centerPos.y);
            ctx.lineTo(centerPos.x - gapSize - lineLength, centerPos.y);
            ctx.stroke();

            // Right line
            ctx.beginPath();
            ctx.moveTo(centerPos.x + gapSize, centerPos.y);
            ctx.lineTo(centerPos.x + gapSize + lineLength, centerPos.y);
            ctx.stroke();

            ctx.restore();
        }

        // Draw joystick if active
        if (mode === 'joystick' && joystickStatic && joystickDynamic) {
            const staticPos = normalizedToCanvas(joystickStatic.x, joystickStatic.y);
            const dynamicPos = normalizedToCanvas(joystickDynamic.x, joystickDynamic.y);
            const radius = joystickSize / 2;

            ctx.save();

            // Calculate distance ratio for color interpolation
            const dx = dynamicPos.x - staticPos.x;
            const dy = dynamicPos.y - staticPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const referenceDim = getJoystickReferenceDimension();
            const maxDist = referenceDim * joystickLineMaxLength;
            const distRatio = Math.min(1, dist / maxDist);

            // Interpolate line color
            const parseHexColor = (hex) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                const a = hex.length >= 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
                return { r, g, b, a };
            };
            const color1 = parseHexColor(joystickLineColor1);
            const color2 = parseHexColor(joystickLineColor2);
            const interpColor = {
                r: Math.round(color1.r + (color2.r - color1.r) * distRatio),
                g: Math.round(color1.g + (color2.g - color1.g) * distRatio),
                b: Math.round(color1.b + (color2.b - color1.b) * distRatio),
                a: color1.a + (color2.a - color1.a) * distRatio
            };
            const lineColor = `rgba(${interpColor.r}, ${interpColor.g}, ${interpColor.b}, ${interpColor.a})`;

            // Draw dotted line connecting centers
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = joystickLineWidth;
            ctx.moveTo(staticPos.x, staticPos.y);
            ctx.lineTo(dynamicPos.x, dynamicPos.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw static circle (bottom)
            ctx.beginPath();
            ctx.arc(staticPos.x, staticPos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = joystickColor;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw dynamic circle (top)
            ctx.beginPath();
            ctx.arc(dynamicPos.x, dynamicPos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = joystickColor;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }
    }, [polygons, currentPolygon, imageLoaded, normalizedToCanvas, borderColor, fillColor, lineWidth, src, showReticle, reticleX, reticleY, reticleSize, reticleColor, mode, joystickStatic, joystickDynamic, joystickColor, joystickSize, joystickLineWidth, joystickLineColor1, joystickLineColor2, joystickLineMaxLength, containerSize, getJoystickReferenceDimension]);

    useEffect(() => {
        draw();
    }, [draw]);

    // Cleanup throttle timeout on unmount
    useEffect(() => {
        return () => {
            if (joystickThrottleTimeoutRef.current) {
                clearTimeout(joystickThrottleTimeoutRef.current);
            }
        };
    }, []);

    // Handle click
    const handleClick = (e) => {
        if (mode !== 'designer') return;
        if (src && !imageLoaded) return;

        const screenX = e.clientX;
        const screenY = e.clientY;
        const normCoords = screenToNormalized(screenX, screenY);

        // If currently drawing a polygon
        if (currentPolygon) {
            // Check if clicking on first point to close (need at least 3 points)
            if (currentPolygon.length >= 3 && isNearPoint(screenX, screenY, currentPolygon[0], 12)) {
                // Close polygon
                const newPolygons = [...polygons, currentPolygon];
                setPolygons(newPolygons);
                setCurrentPolygon(null);
                if (onChange) {
                    onChange(newPolygons);
                }
                return;
            }

            // Add new point if under max
            if (currentPolygon.length < maxPoints) {
                const newCurrentPolygon = [...currentPolygon, normCoords];

                // Auto-close if maxPoints reached
                if (newCurrentPolygon.length >= maxPoints) {
                    const newPolygons = [...polygons, newCurrentPolygon];
                    setPolygons(newPolygons);
                    setCurrentPolygon(null);
                    if (onChange) {
                        onChange(newPolygons);
                    }
                } else {
                    setCurrentPolygon(newCurrentPolygon);
                }
            }
            return;
        }

        // Not drawing - check if clicking on existing point (to start dragging - handled in mousedown)
        const pointAt = findPointAt(screenX, screenY);
        if (pointAt) return;

        // Check if clicking inside existing polygon (don't start new polygon)
        const polygonAt = findPolygonAt(screenX, screenY);
        if (polygonAt !== null) return;

        // Start new polygon
        if (polygons.length < maxPolygons) {
            setCurrentPolygon([normCoords]);
        }
    };

    // Handle mouse/touch down (for dragging in designer mode, or joystick start)
    const handlePointerDown = (e, isTouch = false) => {
        const { clientX, clientY } = getClientCoords(e);

        if (mode === 'joystick') {
            // Cancel any ongoing animation
            if (joystickAnimationRef.current) {
                cancelAnimationFrame(joystickAnimationRef.current);
                joystickAnimationRef.current = null;
            }

            // Reset joystick session state
            joystickReleasedRef.current = false;
            joystickHadMovementRef.current = false;

            const normCoords = screenToNormalized(clientX, clientY);
            setJoystickStatic(normCoords);
            setJoystickDynamic(normCoords);
            setIsJoystickActive(true);

            if (onJoystickStart) {
                onJoystickStart();
            }

            e.preventDefault();
            return;
        }

        if (mode !== 'designer') return;
        if (src && !imageLoaded) return;
        if (currentPolygon) return; // Don't drag while drawing

        const pointAt = findPointAt(clientX, clientY);
        if (pointAt && pointAt.polyIndex >= 0) {
            setDraggingPoint(pointAt);
            e.preventDefault();
        }
    };

    const handleMouseDown = (e) => handlePointerDown(e, false);
    const handleTouchStart = (e) => handlePointerDown(e, true);

    // Handle mouse/touch move
    const handlePointerMove = (e, isTouch = false) => {
        const { clientX, clientY } = getClientCoords(e);

        if (mode === 'joystick' && isJoystickActive && joystickStatic) {
            if (isTouch) e.preventDefault(); // Prevent scrolling while using joystick
            const normCoords = screenToNormalized(clientX, clientY);

            // Calculate max length in normalized coordinates based on reference dimension
            const referenceDim = getJoystickReferenceDimension();
            const maxLengthPx = referenceDim * joystickLineMaxLength;

            // Calculate distance from static point
            const dx = normCoords.x - joystickStatic.x;
            const dy = normCoords.y - joystickStatic.y;

            // Convert to pixel space for distance calculation
            const dxPx = dx * containerSize.width;
            const dyPx = dy * containerSize.height;
            const distPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx);

            let clampedCoords = normCoords;
            if (distPx > maxLengthPx) {
                // Clamp to max length
                const scale = maxLengthPx / distPx;
                clampedCoords = {
                    x: joystickStatic.x + dx * scale,
                    y: joystickStatic.y + dy * scale
                };
            }

            setJoystickDynamic(clampedCoords);

            // Notify callback with offset from center (normalized -1 to 1)
            if (onJoystickMove) {
                const offsetX = (clampedCoords.x - joystickStatic.x) / (maxLengthPx / containerSize.width);
                const offsetY = (clampedCoords.y - joystickStatic.y) / (maxLengthPx / containerSize.height);
                const distRatio = distPx / maxLengthPx;

                // Calculate the coords to send
                let coordsToSend;
                if (distRatio <= joystickZeroRadius) {
                    coordsToSend = { x: 0, y: 0 };
                } else {
                    // Invert Y axis: Up (smaller screen Y) should be positive
                    coordsToSend = { x: offsetX, y: -offsetY };
                }

                // Mark that there was movement
                joystickHadMovementRef.current = true;

                // Throttling logic
                if (joystickMoveInterval <= 0) {
                    // No throttling - call immediately
                    onJoystickMove(coordsToSend);
                    lastSentJoystickCoordsRef.current = coordsToSend;
                } else {
                    const now = Date.now();
                    const timeSinceLastCall = now - lastJoystickMoveTimeRef.current;

                    if (timeSinceLastCall >= joystickMoveInterval) {
                        // Interval has passed - call immediately
                        onJoystickMove(coordsToSend);
                        lastJoystickMoveTimeRef.current = now;
                        lastSentJoystickCoordsRef.current = coordsToSend;
                        pendingJoystickMoveRef.current = null;

                        // Clear any pending timeout
                        if (joystickThrottleTimeoutRef.current) {
                            clearTimeout(joystickThrottleTimeoutRef.current);
                            joystickThrottleTimeoutRef.current = null;
                        }
                    } else {
                        // Store pending coords
                        pendingJoystickMoveRef.current = coordsToSend;

                        // Schedule callback if not already scheduled
                        if (!joystickThrottleTimeoutRef.current) {
                            const remainingTime = joystickMoveInterval - timeSinceLastCall;
                            joystickThrottleTimeoutRef.current = setTimeout(() => {
                                joystickThrottleTimeoutRef.current = null;

                                // Don't fire if joystick was released
                                if (joystickReleasedRef.current) {
                                    pendingJoystickMoveRef.current = null;
                                    return;
                                }

                                const pending = pendingJoystickMoveRef.current;
                                const lastSent = lastSentJoystickCoordsRef.current;

                                // Only call if position changed
                                if (pending && (!lastSent || pending.x !== lastSent.x || pending.y !== lastSent.y)) {
                                    onJoystickMove(pending);
                                    lastJoystickMoveTimeRef.current = Date.now();
                                    lastSentJoystickCoordsRef.current = pending;
                                }
                                pendingJoystickMoveRef.current = null;
                            }, remainingTime);
                        }
                    }
                }
            }
            return;
        }

        if (mode !== 'designer') return;
        if (src && !imageLoaded) return;

        if (draggingPoint) {
            if (isTouch) e.preventDefault(); // Prevent scrolling while dragging points
            const normCoords = screenToNormalized(clientX, clientY);
            const newPolygons = [...polygons];
            newPolygons[draggingPoint.polyIndex] = [...newPolygons[draggingPoint.polyIndex]];
            newPolygons[draggingPoint.polyIndex][draggingPoint.pointIndex] = normCoords;
            setPolygons(newPolygons);
            if (onChange) {
                onChange(newPolygons);
            }
        }
    };

    const handleMouseMove = (e) => handlePointerMove(e, false);
    const handleTouchMove = (e) => handlePointerMove(e, true);

    // Handle mouse/touch up
    const handlePointerUp = () => {
        if (mode === 'joystick' && isJoystickActive && joystickStatic && joystickDynamic) {
            // Mark as released immediately to prevent throttle callbacks
            joystickReleasedRef.current = true;

            // Clear throttle timeout
            if (joystickThrottleTimeoutRef.current) {
                clearTimeout(joystickThrottleTimeoutRef.current);
                joystickThrottleTimeoutRef.current = null;
            }

            // Reset throttling refs
            pendingJoystickMoveRef.current = null;
            lastSentJoystickCoordsRef.current = null;
            lastJoystickMoveTimeRef.current = 0;

            // Fire callbacks immediately (before animation)
            // If there was movement, send final (0, 0) position
            if (joystickHadMovementRef.current && onJoystickMove) {
                onJoystickMove({ x: 0, y: 0 });
            }

            // Fire end callback
            if (onJoystickEnd) {
                onJoystickEnd();
            }

            // Animate snap back (visual only, no callbacks at end)
            const startTime = performance.now();
            const startPos = { ...joystickDynamic };
            const endPos = { ...joystickStatic };
            const duration = joystickSnapAnimationDuration * 1000; // ms

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(1, elapsed / duration);

                // Ease out
                const eased = 1 - Math.pow(1 - progress, 2);

                const currentPos = {
                    x: startPos.x + (endPos.x - startPos.x) * eased,
                    y: startPos.y + (endPos.y - startPos.y) * eased
                };

                setJoystickDynamic(currentPos);

                if (progress < 1) {
                    joystickAnimationRef.current = requestAnimationFrame(animate);
                } else {
                    // Animation complete, hide joystick
                    setJoystickStatic(null);
                    setJoystickDynamic(null);
                    setIsJoystickActive(false);
                    joystickAnimationRef.current = null;
                }
            };

            joystickAnimationRef.current = requestAnimationFrame(animate);
            return;
        }

        setDraggingPoint(null);
    };

    const handleMouseUp = () => handlePointerUp();
    const handleTouchEnd = () => handlePointerUp();

    // Handle double click (delete polygon)
    const handleDoubleClick = (e) => {
        if (mode !== 'designer') return;
        if (src && !imageLoaded) return;

        // Cancel current drawing
        if (currentPolygon) {
            setCurrentPolygon(null);
            return;
        }

        // Delete polygon at click position
        const polygonAt = findPolygonAt(e.clientX, e.clientY);
        if (polygonAt !== null) {
            const newPolygons = polygons.filter((_, index) => index !== polygonAt);
            setPolygons(newPolygons);
            if (onChange) {
                onChange(newPolygons);
            }
        }
    };

    // Get image style (same as Image component)
    const getImageStyle = () => {
        // Base styles to prevent long-press context menu on mobile
        const preventLongPressStyles = (mode === 'designer' || mode === 'joystick') ? {
            WebkitTouchCallout: 'none', // Disable iOS callout
            WebkitUserSelect: 'none', // Disable selection
            userSelect: 'none',
            pointerEvents: 'none' // Let events pass through to container
        } : {};

        switch (stretchMode) {
            case 'fit':
                return { display: 'block', width: '100%', height: '100%', objectFit: 'contain', ...preventLongPressStyles };
            case 'stretch':
                return { display: 'block', width: '100%', height: '100%', objectFit: 'fill', ...preventLongPressStyles };
            case 'originalSize':
                return { display: 'block', width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', ...preventLongPressStyles };
            default:
                return { display: 'block', ...preventLongPressStyles };
        }
    };

    const containerStyle = {
        border: border > 0 ? `${border}px dashed gray` : 'none',
        display: stretchMode === 'originalSize' ? 'inline-block' : 'block',
        width: stretchMode === 'originalSize' ? 'auto' : '100%',
        height: stretchMode === 'originalSize' ? 'auto' : '100%',
        backgroundColor: background,
        position: 'relative',
        cursor: mode === 'designer' && currentPolygon ? 'crosshair' : (mode === 'joystick' ? 'pointer' : 'default'),
        touchAction: (mode === 'designer' || mode === 'joystick') ? 'none' : 'auto', // Prevent browser scroll on touch
        ...style
    };

    // Update canvas size
    useEffect(() => {
        if (containerRef.current && canvasRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            canvasRef.current.width = rect.width;
            canvasRef.current.height = rect.height;
            draw();
        }
    }, [containerSize, imageLoaded, draw]);

    return (
        <div
            className="custom-polygon"
            ref={containerRef}
            style={containerStyle}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
        >
            {src && (
                <img
                    ref={imageRef}
                    src={src}
                    alt=""
                    style={getImageStyle()}
                    onLoad={handleImageLoad}
                    draggable={false}
                />
            )}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

export default Polygon;
