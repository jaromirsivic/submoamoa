import React, { useState, useRef, useEffect, useCallback } from 'react';

const Chart2D = ({
    title = '',
    xLabel = 'X',
    yLabel = 'Y',
    xMin = 0,
    xMax = 100,
    yMin = 0,
    yMax = 100,
    width = 600,
    height = 400,
    backgroundColor = '#ffffff',
    gridColor = '#e0e0e0',
    gridSize = 10,
    pannable = false,
    zoomable = false,
    scrollable = false,
    datasets = [],
    style = {}
}) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    
    // View state for pan/zoom
    const [viewXMin, setViewXMin] = useState(xMin);
    const [viewXMax, setViewXMax] = useState(xMax);
    const [viewYMin, setViewYMin] = useState(yMin);
    const [viewYMax, setViewYMax] = useState(yMax);
    
    // Pan state
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [panViewStart, setPanViewStart] = useState({ xMin: 0, xMax: 0, yMin: 0, yMax: 0 });

    const padding = { top: 50, right: 30, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Reset view when bounds change
    useEffect(() => {
        setViewXMin(xMin);
        setViewXMax(xMax);
        setViewYMin(yMin);
        setViewYMax(yMax);
    }, [xMin, xMax, yMin, yMax]);

    // Convert data coordinates to SVG coordinates
    const toSVGX = useCallback((x) => {
        return padding.left + ((x - viewXMin) / (viewXMax - viewXMin)) * chartWidth;
    }, [viewXMin, viewXMax, chartWidth, padding.left]);

    const toSVGY = useCallback((y) => {
        return height - padding.bottom - ((y - viewYMin) / (viewYMax - viewYMin)) * chartHeight;
    }, [viewYMin, viewYMax, chartHeight, height, padding.bottom]);

    // Convert SVG coordinates to data coordinates
    const toDataX = useCallback((svgX) => {
        return viewXMin + ((svgX - padding.left) / chartWidth) * (viewXMax - viewXMin);
    }, [viewXMin, viewXMax, chartWidth, padding.left]);

    const toDataY = useCallback((svgY) => {
        return viewYMin + ((height - padding.bottom - svgY) / chartHeight) * (viewYMax - viewYMin);
    }, [viewYMin, viewYMax, chartHeight, height, padding.bottom]);

    // Generate grid lines
    const generateGridLines = () => {
        const lines = [];
        const xRange = viewXMax - viewXMin;
        const yRange = viewYMax - viewYMin;
        
        // Calculate step size based on gridSize (number of divisions)
        const xStep = xRange / gridSize;
        const yStep = yRange / gridSize;

        // Vertical grid lines
        for (let i = 0; i <= gridSize; i++) {
            const x = viewXMin + i * xStep;
            const svgX = toSVGX(x);
            lines.push(
                <line
                    key={`v-${i}`}
                    x1={svgX}
                    y1={padding.top}
                    x2={svgX}
                    y2={height - padding.bottom}
                    stroke={gridColor}
                    strokeWidth={1}
                />
            );
        }

        // Horizontal grid lines
        for (let i = 0; i <= gridSize; i++) {
            const y = viewYMin + i * yStep;
            const svgY = toSVGY(y);
            lines.push(
                <line
                    key={`h-${i}`}
                    x1={padding.left}
                    y1={svgY}
                    x2={width - padding.right}
                    y2={svgY}
                    stroke={gridColor}
                    strokeWidth={1}
                />
            );
        }

        return lines;
    };

    // Generate axis ticks and labels
    const generateAxisLabels = () => {
        const labels = [];
        const xRange = viewXMax - viewXMin;
        const yRange = viewYMax - viewYMin;
        const xStep = xRange / gridSize;
        const yStep = yRange / gridSize;

        // X axis labels
        for (let i = 0; i <= gridSize; i++) {
            const x = viewXMin + i * xStep;
            const svgX = toSVGX(x);
            labels.push(
                <text
                    key={`x-label-${i}`}
                    x={svgX}
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#666"
                >
                    {x.toFixed(1)}
                </text>
            );
        }

        // Y axis labels
        for (let i = 0; i <= gridSize; i++) {
            const y = viewYMin + i * yStep;
            const svgY = toSVGY(y);
            labels.push(
                <text
                    key={`y-label-${i}`}
                    x={padding.left - 10}
                    y={svgY + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#666"
                >
                    {y.toFixed(1)}
                </text>
            );
        }

        return labels;
    };

    // Get stroke dash array for line style
    const getStrokeDashArray = (lineStyle) => {
        switch (lineStyle) {
            case 'dashed':
                return '8,4';
            case 'dotted':
                return '2,4';
            case 'dashdot':
                return '8,4,2,4';
            default:
                return 'none';
        }
    };

    // Render datasets
    const renderDatasets = () => {
        return datasets.map((dataset, datasetIndex) => {
            const {
                data = [],
                color = '#3b82f6',
                label = `Dataset ${datasetIndex + 1}`,
                lineWidth = 2,
                lineStyle = 'solid'
            } = dataset;

            if (data.length === 0) return null;

            // Create path for the line
            const pathData = data
                .map((point, i) => {
                    const svgX = toSVGX(point.x);
                    const svgY = toSVGY(point.y);
                    return `${i === 0 ? 'M' : 'L'} ${svgX} ${svgY}`;
                })
                .join(' ');

            const strokeDashArray = getStrokeDashArray(lineStyle);

            return (
                <g key={`dataset-${datasetIndex}`}>
                    <path
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth={lineWidth}
                        strokeDasharray={strokeDashArray}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Render points */}
                    {data.map((point, pointIndex) => {
                        const svgX = toSVGX(point.x);
                        const svgY = toSVGY(point.y);
                        // Only render points that are within the visible area
                        if (svgX >= padding.left && svgX <= width - padding.right &&
                            svgY >= padding.top && svgY <= height - padding.bottom) {
                            return (
                                <circle
                                    key={`point-${datasetIndex}-${pointIndex}`}
                                    cx={svgX}
                                    cy={svgY}
                                    r={lineWidth + 2}
                                    fill={color}
                                />
                            );
                        }
                        return null;
                    })}
                </g>
            );
        });
    };

    // Render legend
    const renderLegend = () => {
        if (datasets.length === 0) return null;

        return (
            <g transform={`translate(${width - padding.right - 120}, ${padding.top})`}>
                <rect
                    x={0}
                    y={0}
                    width={110}
                    height={datasets.length * 25 + 10}
                    fill="rgba(255,255,255,0.9)"
                    stroke="#ccc"
                    strokeWidth={1}
                    rx={4}
                />
                {datasets.map((dataset, index) => {
                    const { color = '#3b82f6', label = `Dataset ${index + 1}`, lineStyle = 'solid' } = dataset;
                    const strokeDashArray = getStrokeDashArray(lineStyle);
                    return (
                        <g key={`legend-${index}`} transform={`translate(10, ${index * 25 + 18})`}>
                            <line
                                x1={0}
                                y1={0}
                                x2={25}
                                y2={0}
                                stroke={color}
                                strokeWidth={2}
                                strokeDasharray={strokeDashArray}
                            />
                            <text x={32} y={4} fontSize="12" fill="#333">
                                {label}
                            </text>
                        </g>
                    );
                })}
            </g>
        );
    };

    // Handle mouse wheel for zoom/scroll
    const handleWheel = useCallback((e) => {
        if (!zoomable && !scrollable) return;
        
        e.preventDefault();
        
        const svg = svgRef.current;
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Get mouse position in data coordinates
        const dataX = toDataX(mouseX);
        const dataY = toDataY(mouseY);

        if (zoomable && (e.ctrlKey || e.metaKey)) {
            // Zoom
            const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
            
            const newXRange = (viewXMax - viewXMin) * zoomFactor;
            const newYRange = (viewYMax - viewYMin) * zoomFactor;
            
            // Zoom centered on mouse position
            const xRatio = (dataX - viewXMin) / (viewXMax - viewXMin);
            const yRatio = (dataY - viewYMin) / (viewYMax - viewYMin);
            
            const newXMin = dataX - xRatio * newXRange;
            const newXMax = dataX + (1 - xRatio) * newXRange;
            const newYMin = dataY - yRatio * newYRange;
            const newYMax = dataY + (1 - yRatio) * newYRange;
            
            setViewXMin(newXMin);
            setViewXMax(newXMax);
            setViewYMin(newYMin);
            setViewYMax(newYMax);
        } else if (scrollable) {
            // Scroll
            const xRange = viewXMax - viewXMin;
            const yRange = viewYMax - viewYMin;
            const scrollAmount = e.shiftKey ? 0.1 : 0.05;
            
            if (e.shiftKey) {
                // Horizontal scroll
                const delta = e.deltaY > 0 ? xRange * scrollAmount : -xRange * scrollAmount;
                setViewXMin(viewXMin + delta);
                setViewXMax(viewXMax + delta);
            } else {
                // Vertical scroll
                const delta = e.deltaY > 0 ? -yRange * scrollAmount : yRange * scrollAmount;
                setViewYMin(viewYMin + delta);
                setViewYMax(viewYMax + delta);
            }
        }
    }, [zoomable, scrollable, viewXMin, viewXMax, viewYMin, viewYMax, toDataX, toDataY]);

    // Handle pan start
    const handleMouseDown = useCallback((e) => {
        if (!pannable) return;
        
        const svg = svgRef.current;
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Check if click is within chart area
        if (mouseX >= padding.left && mouseX <= width - padding.right &&
            mouseY >= padding.top && mouseY <= height - padding.bottom) {
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
            setPanViewStart({ xMin: viewXMin, xMax: viewXMax, yMin: viewYMin, yMax: viewYMax });
        }
    }, [pannable, viewXMin, viewXMax, viewYMin, viewYMax, width, height, padding]);

    // Handle pan move
    const handleMouseMove = useCallback((e) => {
        if (!isPanning) return;
        
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        
        // Convert pixel delta to data delta
        const xRange = panViewStart.xMax - panViewStart.xMin;
        const yRange = panViewStart.yMax - panViewStart.yMin;
        
        const dataDelataX = -(deltaX / chartWidth) * xRange;
        const dataDelataY = (deltaY / chartHeight) * yRange;
        
        setViewXMin(panViewStart.xMin + dataDelataX);
        setViewXMax(panViewStart.xMax + dataDelataX);
        setViewYMin(panViewStart.yMin + dataDelataY);
        setViewYMax(panViewStart.yMax + dataDelataY);
    }, [isPanning, panStart, panViewStart, chartWidth, chartHeight]);

    // Handle pan end
    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    // Handle double click to reset view
    const handleDoubleClick = useCallback(() => {
        setViewXMin(xMin);
        setViewXMax(xMax);
        setViewYMin(yMin);
        setViewYMax(yMax);
    }, [xMin, xMax, yMin, yMax]);

    // Add event listeners
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('wheel', handleWheel, { passive: false });
        
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel]);

    useEffect(() => {
        if (isPanning) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isPanning, handleMouseMove, handleMouseUp]);

    const containerStyle = {
        display: 'inline-block',
        userSelect: 'none',
        ...style
    };

    const cursorStyle = pannable ? (isPanning ? 'grabbing' : 'grab') : 'default';

    return (
        <div ref={containerRef} style={containerStyle}>
            <svg
                ref={svgRef}
                width={width}
                height={height}
                style={{ cursor: cursorStyle }}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
            >
                {/* Background */}
                <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill={backgroundColor}
                />
                
                {/* Chart area background */}
                <rect
                    x={padding.left}
                    y={padding.top}
                    width={chartWidth}
                    height={chartHeight}
                    fill={backgroundColor}
                />
                
                {/* Clip path for chart area */}
                <defs>
                    <clipPath id="chart-area">
                        <rect
                            x={padding.left}
                            y={padding.top}
                            width={chartWidth}
                            height={chartHeight}
                        />
                    </clipPath>
                </defs>
                
                {/* Grid */}
                <g clipPath="url(#chart-area)">
                    {generateGridLines()}
                </g>
                
                {/* Axis lines */}
                <line
                    x1={padding.left}
                    y1={height - padding.bottom}
                    x2={width - padding.right}
                    y2={height - padding.bottom}
                    stroke="#333"
                    strokeWidth={2}
                />
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={height - padding.bottom}
                    stroke="#333"
                    strokeWidth={2}
                />
                
                {/* Axis labels */}
                {generateAxisLabels()}
                
                {/* X axis label */}
                <text
                    x={width / 2}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#333"
                >
                    {xLabel}
                </text>
                
                {/* Y axis label */}
                <text
                    x={15}
                    y={height / 2}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#333"
                    transform={`rotate(-90, 15, ${height / 2})`}
                >
                    {yLabel}
                </text>
                
                {/* Title */}
                {title && (
                    <text
                        x={width / 2}
                        y={25}
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="bold"
                        fill="#333"
                    >
                        {title}
                    </text>
                )}
                
                {/* Datasets */}
                <g clipPath="url(#chart-area)">
                    {renderDatasets()}
                </g>
                
                {/* Legend */}
                {renderLegend()}
                
                {/* Border around chart area */}
                <rect
                    x={padding.left}
                    y={padding.top}
                    width={chartWidth}
                    height={chartHeight}
                    fill="none"
                    stroke="#333"
                    strokeWidth={1}
                />
            </svg>
            
            {/* Instructions */}
            {(pannable || zoomable || scrollable) && (
                <div style={{ fontSize: '11px', color: '#666', marginTop: '5px', textAlign: 'center' }}>
                    {pannable && <span>Drag to pan • </span>}
                    {zoomable && <span>Ctrl+Scroll to zoom • </span>}
                    {scrollable && <span>Scroll to move • </span>}
                    <span>Double-click to reset</span>
                </div>
            )}
        </div>
    );
};

export default Chart2D;
