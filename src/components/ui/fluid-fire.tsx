/**
 * TaskbarFire - Standalone Version
 * Copy this entire file into your project
 * No npm install needed!
 */

import { useRef, useEffect, useCallback } from 'react';
import { useFluidFire } from '../../hooks/useFluidFire';


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
    const svgRef = useRef(null);

    const { isReady, setObstacle } = useFluidFire({
        svgRef,
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

    const handleMouseDown = useCallback((e) => {
        if (!interactive || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const cScale = height / 1.0;
        const x = mx / cScale;
        const y = (height - my) / cScale;

        setObstacle(x, y, true);
    }, [interactive, height, setObstacle]);

    const handleMouseMove = useCallback((e) => {
        if (!interactive || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const cScale = height / 1.0;
        const x = mx / cScale;
        const y = (height - my) / cScale;

        setObstacle(x, y, false);
        
        if (onMouseMove) {
            onMouseMove({ x, y, screenX: mx, screenY: my });
        }
    }, [interactive, height, setObstacle, onMouseMove]);

    const handleTouchStart = useCallback((e) => {
        if (!interactive || !svgRef.current) return;

        const touch = e.touches[0];
        const rect = svgRef.current.getBoundingClientRect();
        const mx = touch.clientX - rect.left;
        const my = touch.clientY - rect.top;

        const cScale = height / 1.0;
        const x = mx / cScale;
        const y = (height - my) / cScale;

        setObstacle(x, y, true);
    }, [interactive, height, setObstacle]);

    const handleTouchMove = useCallback((e) => {
        if (!interactive || !svgRef.current) return;

        e.preventDefault();

        const touch = e.touches[0];
        const rect = svgRef.current.getBoundingClientRect();
        const mx = touch.clientX - rect.left;
        const my = touch.clientY - rect.top;

        const cScale = height / 1.0;
        const x = mx / cScale;
        const y = (height - my) / cScale;

        setObstacle(x, y, false);
    }, [interactive, height, setObstacle]);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                cursor: interactive ? 'crosshair' : 'default',
                ...style,
            }}
            onMouseDown={interactive ? handleMouseDown : undefined}
            onMouseMove={interactive ? handleMouseMove : undefined}
            onTouchStart={interactive ? handleTouchStart : undefined}
            onTouchMove={interactive ? handleTouchMove : undefined}
        >
            <rect width={width} height={height} fill={backgroundColor} />
            <g id="fluidGrid" />
            <g id="obstacleGroup" />
        </svg>
    );
};

export default FluidFire;