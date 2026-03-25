/**
 * TaskbarFire - Standalone Version
 * Copy this entire file into your project
 * No npm install needed!
 */

import { useRef, useEffect, useCallback } from 'react';
import { useFluidFire } from '../../hooks/useFluidFire';


// fluid-fire.tsx - CANVAS VERSION

export const FluidFire = ({
    width = 80,
    height = 60,
    fps = 30,
    gridResolution = 10000,

    // Physics
    gravity = 0.0,
    numIters = 10,

    // Fire sources
    burningFloor = true,
    burningObstacle = false,

    // Floor shape
    floorShape = 'bottom',
    floorThickness = 4,
    floorCurve = 0,

    // Swirls
    showSwirls = false,
    swirlProbability = 50.0,
    swirlMaxRadius = 0.05,

    // Colors
    colorScheme = 'fire',

    // Styling
    className = '',
    style = {},
    backgroundColor = '#transparent',

    // Interaction
    interactive = true,

    // Callbacks
    onSimulationReady = null,
    onMouseMove = null,
}) => {
    const canvasRef = useRef(null); // ← ĐỔI TÊN: svgRef → canvasRef

    const { setObstacle } = useFluidFire({
        canvasRef, // ← ĐỔI TÊN
        width,
        height,
        fps,
        gridResolution,
        gravity,
        numIters,
        burningFloor,
        burningObstacle,
        floorShape,
        floorThickness,
        floorCurve,
        showSwirls,
        swirlProbability,
        swirlMaxRadius,
        colorScheme,
        onSimulationReady,
    });

    const handleMouseMove = (e) => {
        if (!interactive || !canvasRef.current) return; // ← ĐỔI TÊN
        
        const rect = canvasRef.current.getBoundingClientRect(); // ← ĐỔI TÊN
        const x = ((e.clientX - rect.left) / rect.width) * width;
        const y = height - ((e.clientY - rect.top) / rect.height) * height;
        
        setObstacle(x / height, y / height, false);
        
        if (onMouseMove) {
            onMouseMove(e, { x, y });
        }
    };

    const handleMouseDown = (e) => {
        if (!interactive) return;
        handleMouseMove(e);
    };

    const handleTouchMove = (e) => {
        if (!interactive || !canvasRef.current) return; // ← ĐỔI TÊN
        
        const touch = e.touches[0];
        const rect = canvasRef.current.getBoundingClientRect(); // ← ĐỔI TÊN
        const x = ((touch.clientX - rect.left) / rect.width) * width;
        const y = height - ((touch.clientY - rect.top) / rect.height) * height;
        
        setObstacle(x / height, y / height, false);
    };

    const handleTouchStart = (e) => {
        if (!interactive) return;
        handleTouchMove(e);
    };

    return (
        <div
            ref={canvasRef} // ← ĐỔI TÊN
            className={className}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                backgroundColor,
                cursor: interactive ? 'crosshair' : 'default',
                ...style,
            }}
            onMouseDown={interactive ? handleMouseDown : undefined}
            onMouseMove={interactive ? handleMouseMove : undefined}
            onTouchStart={interactive ? handleTouchStart : undefined}
            onTouchMove={interactive ? handleTouchMove : undefined}
        >
            {/* ← THAY THẾ SVG BẰNG CANVAS */}
            <canvas
                width={width}
                height={height}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                }}
            />
        </div>
    );
};

export default FluidFire;