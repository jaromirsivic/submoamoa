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
    reticleAlpha = 0.5,
    reticleColor = '#ff0000'
}) => {
    const [polygons, setPolygons] = useState(externalPolygons);
    const [currentPolygon, setCurrentPolygon] = useState(null); // Points being drawn (not yet closed)
    const [draggingPoint, setDraggingPoint] = useState(null); // { polyIndex, pointIndex }

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
            ctx.globalAlpha = reticleAlpha;
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
    }, [polygons, currentPolygon, imageLoaded, normalizedToCanvas, borderColor, fillColor, lineWidth, src, showReticle, reticleX, reticleY, reticleSize, reticleAlpha, reticleColor]);

    useEffect(() => {
        draw();
    }, [draw]);

    // Handle click
    const handleClick = (e) => {
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

    // Handle mouse down (for dragging)
    const handleMouseDown = (e) => {
        if (src && !imageLoaded) return;
        if (currentPolygon) return; // Don't drag while drawing

        const pointAt = findPointAt(e.clientX, e.clientY);
        if (pointAt && pointAt.polyIndex >= 0) {
            setDraggingPoint(pointAt);
            e.preventDefault();
        }
    };

    // Handle mouse move
    const handleMouseMove = (e) => {
        if (src && !imageLoaded) return;

        if (draggingPoint) {
            const normCoords = screenToNormalized(e.clientX, e.clientY);
            const newPolygons = [...polygons];
            newPolygons[draggingPoint.polyIndex] = [...newPolygons[draggingPoint.polyIndex]];
            newPolygons[draggingPoint.polyIndex][draggingPoint.pointIndex] = normCoords;
            setPolygons(newPolygons);
            if (onChange) {
                onChange(newPolygons);
            }
        }
    };

    // Handle mouse up
    const handleMouseUp = () => {
        setDraggingPoint(null);
    };

    // Handle double click (delete polygon)
    const handleDoubleClick = (e) => {
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
        switch (stretchMode) {
            case 'fit':
                return { display: 'block', width: '100%', height: '100%', objectFit: 'contain' };
            case 'stretch':
                return { display: 'block', width: '100%', height: '100%', objectFit: 'fill' };
            case 'originalSize':
                return { display: 'block', width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' };
            default:
                return { display: 'block' };
        }
    };

    const containerStyle = {
        border: border > 0 ? `${border}px dashed gray` : 'none',
        display: stretchMode === 'originalSize' ? 'inline-block' : 'block',
        width: stretchMode === 'originalSize' ? 'auto' : '100%',
        height: stretchMode === 'originalSize' ? 'auto' : '100%',
        backgroundColor: background,
        position: 'relative',
        cursor: currentPolygon ? 'crosshair' : 'default',
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
