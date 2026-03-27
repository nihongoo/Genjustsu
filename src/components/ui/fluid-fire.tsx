'use client';

import { useRef, useEffect } from 'react';
import { useFluidFire } from '../../hooks/useFluidFire';

interface FluidFireProps {
    width?: number;
    height?: number;
    fps?: number;
    gridResolution?: number;
    gravity?: number;
    numIters?: number;
    burningFloor?: boolean;
    burningObstacle?: boolean;
    floorShape?: string;
    floorThickness?: number;
    floorCurve?: number;
    showSwirls?: boolean;
    swirlProbability?: number;
    swirlMaxRadius?: number;
    colorScheme?: string;
    className?: string;
    style?: React.CSSProperties;
    backgroundColor?: string;
    interactive?: boolean;
    onSimulationReady?: ((data: any) => void) | null;
    onMouseMove?: ((e: React.MouseEvent, coords: { x: number; y: number }) => void) | null;
}

export const FluidFire = ({
    width = 800,
    height = 600,
    fps = 30,
    gridResolution = 10000,
    gravity = 0.0,
    numIters = 10,
    burningFloor = true,
    burningObstacle = false,
    floorShape = 'bottom',
    floorThickness = 4,
    floorCurve = 0,
    showSwirls = false,
    swirlProbability = 50.0,
    swirlMaxRadius = 0.05,
    colorScheme = 'fire',
    className = '',
    style = {},
    backgroundColor = 'transparent',
    interactive = true,
    onSimulationReady = null,
    onMouseMove = null,
}: FluidFireProps) => {
    const containerRef = useRef<HTMLDivElement>(null); // ✅ Container cho div wrapper

    const { setObstacle } = useFluidFire({
        canvasRef: containerRef,
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

    // ✅ Force clear canvas khi mount để fix production build
    useEffect(() => {
        const canvas = containerRef.current?.querySelector('canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        // Clear nhiều lần để đảm bảo transparent trên production
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cleanup khi unmount
        return () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!interactive || !containerRef.current) return; // ✅ Dùng containerRef
        
        const rect = containerRef.current.getBoundingClientRect(); // ✅ 
        const x = ((e.clientX - rect.left) / rect.width) * width;
        const y = height - ((e.clientY - rect.top) / rect.height) * height;
        
        setObstacle(x / height, y / height, false);
        
        if (onMouseMove) {
            onMouseMove(e, { x, y });
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!interactive) return;
        handleMouseMove(e);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!interactive || !containerRef.current) return; // ✅ 
        
        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect(); // ✅ 
        const x = ((touch.clientX - rect.left) / rect.width) * width;
        const y = height - ((touch.clientY - rect.top) / rect.height) * height;
        
        setObstacle(x / height, y / height, false);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!interactive) return;
        handleTouchMove(e);
    };

    return (
        <div
            ref={containerRef} // ✅ Dùng containerRef
            className={className}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                backgroundColor: 'transparent', // ✅ Force transparent
                cursor: interactive ? 'crosshair' : 'default',
                ...style,
            }}
            onMouseDown={interactive ? handleMouseDown : undefined}
            onMouseMove={interactive ? handleMouseMove : undefined}
            onTouchStart={interactive ? handleTouchStart : undefined}
            onTouchMove={interactive ? handleTouchMove : undefined}
        >
            <canvas
                width={width}
                height={height}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    backgroundColor: 'transparent', 
                }}
            />
        </div>
    );
};

export default FluidFire;