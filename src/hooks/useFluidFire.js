import { useRef, useEffect, useState, useCallback } from 'react';
import { Fluid } from '../lib/fluid-simulator';
import { getFireColor } from '../lib/color-schemes';

/**
 * React Hook for Fluid Fire Simulation
 * @param {Object} config - Configuration object
 * @returns {Object} - Simulation controls and state
 */
export const useFluidFire = ({
    svgRef,
    width = 800,
    height = 600,
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
    
    // Callbacks
    onSimulationReady = null,
} = {}) => {
    const fluidRef = useRef(null);
    const sceneRef = useRef(null);
    const gridCellsRef = useRef([]);
    const obstacleGroupRef = useRef(null);
    const animationFrameRef = useRef(null);
    const lastFrameTimeRef = useRef(0);
    
    const [isReady, setIsReady] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [stats, setStats] = useState({
        fps: fps,
        frame: 0,
        swirls: 0,
        gridSize: '-'
    });

    // Setup simulation
    const setupSimulation = useCallback(() => {
        if (!svgRef.current) return;

        const simHeight = 1.0;
        const cScale = height / simHeight;
        const simWidth = width / cScale;
        const h = Math.sqrt((simWidth * simHeight) / gridResolution);
        const numX = Math.floor(simWidth / h);
        const numY = Math.floor(simHeight / h);

        // Create scene config
        sceneRef.current = {
            gravity,
            dt: 1.0 / fps,
            numIters,
            frameNr: 0,
            obstacleX: 0.5 * numX * h,
            obstacleY: 0.3 * numY * h,
            obstacleRadius: 0.2,
            burningObstacle,
            burningFloor,
            paused: false,
            showSwirls,
            swirlProbability,
            swirlMaxRadius,
            floorShape,
            floorThickness,
            floorCurve,
            width,
            height,
            cScale,
            simWidth,
            simHeight,
            h,
            numX,
            numY,
        };

        // Create fluid simulator
        fluidRef.current = new Fluid(numX, numY, h);
        
        // Bind floor shape checker
        fluidRef.current.isInFloorShape = (i, j) => isInFloorShape(i, j, sceneRef.current);

        // Create SVG grid cells
        createGrid(svgRef.current, sceneRef.current, gridCellsRef);

        setStats(prev => ({ ...prev, gridSize: `${numX}×${numY}` }));
        setIsReady(true);

        if (onSimulationReady) {
            onSimulationReady({
                fluid: fluidRef.current,
                scene: sceneRef.current,
            });
        }
    }, [
        svgRef, width, height, fps, gridResolution, gravity, numIters,
        burningObstacle, burningFloor, showSwirls, swirlProbability,
        swirlMaxRadius, floorShape, floorThickness, floorCurve, onSimulationReady
    ]);

    // Create SVG grid
    const createGrid = (svg, scene, gridCellsRef) => {
        const gridGroup = svg.querySelector('#fluidGrid');
        if (!gridGroup) return;

        gridGroup.innerHTML = '';
        gridCellsRef.current = [];

        const cellScale = 1.1;
        const cellWidth = scene.cScale * scene.h * cellScale;
        const cellHeight = scene.cScale * scene.h * cellScale;

        for (let i = 0; i < scene.numX; i++) {
            for (let j = 0; j < scene.numY; j++) {
                const x = i * scene.cScale * scene.h;
                const y = scene.height - (j + 1) * scene.cScale * scene.h;

                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x);
                rect.setAttribute('y', y);
                rect.setAttribute('width', cellWidth);
                rect.setAttribute('height', cellHeight);
                rect.setAttribute('fill', 'transparent');

                gridGroup.appendChild(rect);
                gridCellsRef.current.push(rect);
            }
        }
    };

    // Check if cell is in floor shape
    const isInFloorShape = (i, j, scene) => {
        const x = (i + 0.5) * scene.h;
        const y = (j + 0.5) * scene.h;
        const thickness = scene.floorThickness;
        const curve = scene.floorCurve / 100.0;

        switch (scene.floorShape) {
            case 'bottom':
                if (curve === 0) return j < thickness;
                const bottomCurveHeight = curve * 0.3;
                const bottomParabola = bottomCurveHeight * (1 - Math.pow(2 * (x / scene.simWidth) - 1, 2));
                return y < (thickness * scene.h + bottomParabola);

            case 'top':
                if (curve === 0) return j >= scene.numY - thickness;
                const topCurveHeight = curve * 0.3;
                const topParabola = topCurveHeight * (1 - Math.pow(2 * (x / scene.simWidth) - 1, 2));
                return y > (scene.simHeight - thickness * scene.h - topParabola);

            case 'left':
                if (curve === 0) return i < thickness;
                const leftCurveWidth = curve * 0.3;
                const leftParabola = leftCurveWidth * (1 - Math.pow(2 * (y / scene.simHeight) - 1, 2));
                return x < (thickness * scene.h + leftParabola);

            case 'right':
                if (curve === 0) return i >= scene.numX - thickness;
                const rightCurveWidth = curve * 0.3;
                const rightParabola = rightCurveWidth * (1 - Math.pow(2 * (y / scene.simHeight) - 1, 2));
                return x > (scene.simWidth - thickness * scene.h - rightParabola);

            case 'circle':
                const centerX = scene.simWidth / 2;
                const centerY = scene.simHeight / 2;
                const radius = 0.15 + curve * 0.2;
                const dx = x - centerX;
                const dy = y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                return dist < radius && dist > (radius - thickness * scene.h);

            case 'box':
                return j < thickness || j >= scene.numY - thickness ||
                       i < thickness || i >= scene.numX - thickness;

            case 'diagonal':
                const diagThick = thickness * scene.h;
                const diagY = (x / scene.simWidth) * scene.simHeight;
                return Math.abs(y - diagY) < diagThick;

            case 'wave':
                const waveAmplitude = 0.1 + curve * 0.15;
                const waveFreq = 3 + curve * 2;
                const waveY = (thickness * scene.h) + waveAmplitude * Math.sin(waveFreq * Math.PI * x / scene.simWidth);
                return y < waveY;

            default:
                return j < thickness;
        }
    };

    // Draw function
    const draw = useCallback(() => {
        if (!fluidRef.current || !sceneRef.current) return;

        const f = fluidRef.current;
        const scene = sceneRef.current;
        const n = f.numY;

        let cellIndex = 0;
        for (let i = 0; i < scene.numX; i++) {
            for (let j = 0; j < scene.numY; j++) {
                const temp = f.t[i * n + j];
                const color = getFireColor(temp, colorScheme);
                if (gridCellsRef.current[cellIndex]) {
                    gridCellsRef.current[cellIndex].setAttribute('fill', color);
                }
                cellIndex++;
            }
        }

        // Update obstacle
        if (obstacleGroupRef.current) {
            if (scene.burningObstacle) {
                if (obstacleGroupRef.current.children.length === 0) {
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('stroke', '#404040');
                    circle.setAttribute('stroke-width', '3');
                    circle.setAttribute('fill', 'none');
                    obstacleGroupRef.current.appendChild(circle);
                }

                const circle = obstacleGroupRef.current.children[0];
                const r = (scene.obstacleRadius + scene.h) * scene.cScale;
                const cx = scene.obstacleX * scene.cScale;
                const cy = scene.height - scene.obstacleY * scene.cScale;

                circle.setAttribute('cx', cx);
                circle.setAttribute('cy', cy);
                circle.setAttribute('r', r);
            } else {
                obstacleGroupRef.current.innerHTML = '';
            }
        }
    }, [colorScheme]);

    // Simulate function
    const simulate = useCallback(() => {
        if (!fluidRef.current || !sceneRef.current) return;
        if (sceneRef.current.paused) return;

        fluidRef.current.simulate(
            sceneRef.current.dt,
            sceneRef.current.gravity,
            sceneRef.current.numIters,
            sceneRef.current
        );
        sceneRef.current.frameNr++;
    }, []);

    // Animation loop
    const animate = useCallback((currentTime) => {
        if (!isReady) return;

        const deltaTime = currentTime - lastFrameTimeRef.current;
        const targetFrameTime = 1000 / fps;

        if (deltaTime >= targetFrameTime) {
            simulate();
            draw();

            // Update stats
            setStats(prev => ({
                ...prev,
                frame: sceneRef.current?.frameNr || 0,
                swirls: fluidRef.current?.numSwirls || 0,
            }));

            lastFrameTimeRef.current = currentTime;
        }

        animationFrameRef.current = requestAnimationFrame(animate);
    }, [isReady, fps, simulate, draw]);

    // Setup
    useEffect(() => {
        setupSimulation();
    }, [setupSimulation]);

    // Start animation
    useEffect(() => {
        if (!isReady) return;

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isReady, animate]);

    // Update scene config when props change
    useEffect(() => {
        if (!sceneRef.current) return;
        
        sceneRef.current.burningFloor = burningFloor;
        sceneRef.current.burningObstacle = burningObstacle;
        sceneRef.current.showSwirls = showSwirls;
        sceneRef.current.swirlProbability = swirlProbability;
        sceneRef.current.swirlMaxRadius = swirlMaxRadius;
        sceneRef.current.gravity = gravity;
        sceneRef.current.floorShape = floorShape;
        sceneRef.current.floorThickness = floorThickness;
        sceneRef.current.floorCurve = floorCurve;
    }, [burningFloor, burningObstacle, showSwirls, swirlProbability, 
        swirlMaxRadius, gravity, floorShape, floorThickness, floorCurve]);

    // Store obstacle group ref
    useEffect(() => {
        if (svgRef.current) {
            obstacleGroupRef.current = svgRef.current.querySelector('#obstacleGroup');
        }
    }, [svgRef]);

    // Set obstacle position
    const setObstacle = useCallback((x, y, reset = false) => {
        if (!fluidRef.current || !sceneRef.current) return;

        let vx = 0.0;
        let vy = 0.0;

        if (!reset) {
            vx = (x - sceneRef.current.obstacleX) / sceneRef.current.dt;
            vy = (y - sceneRef.current.obstacleY) / sceneRef.current.dt;
        }

        sceneRef.current.obstacleX = x;
        sceneRef.current.obstacleY = y;

        const r = sceneRef.current.obstacleRadius;
        const f = fluidRef.current;
        const n = f.numY;

        for (let i = 1; i < f.numX - 2; i++) {
            for (let j = 1; j < f.numY - 2; j++) {
                f.s[i * n + j] = 1.0;

                const dx = (i + 0.5) * f.h - x;
                const dy = (j + 0.5) * f.h - y;

                const d2 = dx * dx + dy * dy;
                if (d2 < r * r) {
                    f.u[i * n + j] += 0.2 * vx;
                    f.u[(i + 1) * n + j] += 0.2 * vx;
                    f.v[i * n + j] += 0.2 * vy;
                    f.v[i * n + j + 1] += 0.2 * vy;
                }
            }
        }
    }, []);

    // Toggle pause
    const togglePause = useCallback(() => {
        if (sceneRef.current) {
            sceneRef.current.paused = !sceneRef.current.paused;
            setIsPaused(sceneRef.current.paused);
        }
    }, []);

    // Reset simulation
    const reset = useCallback(() => {
        setupSimulation();
        setIsPaused(false);
    }, [setupSimulation]);

    return {
        isReady,
        isPaused,
        stats,
        setObstacle,
        togglePause,
        reset,
        getFluid: () => fluidRef.current,
        getScene: () => sceneRef.current,
    };
};
