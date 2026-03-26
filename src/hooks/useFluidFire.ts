import { useRef, useEffect, useCallback } from 'react';

const TAU = Math.PI * 2;

interface FluidFireConfig {
  canvasRef: React.RefObject<HTMLDivElement>;
  width: number;
  height: number;
  fps: number;
  gridResolution: number;
  gravity: number;
  numIters: number;
  burningFloor: boolean;
  burningObstacle: boolean;
  floorShape: string;
  floorThickness: number;
  floorCurve: number;
  showSwirls: boolean;
  swirlProbability: number;
  swirlMaxRadius: number;
  colorScheme: string;
  onSimulationReady?: () => void;
}

export const useFluidFire = ({
  canvasRef,
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
}: FluidFireConfig) => {
  const simulationRef = useRef<any>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas and simulation
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    canvasElementRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    contextRef.current = ctx;

    // Initialize fluid simulation
    const gridSize = Math.ceil(Math.sqrt(gridResolution));
    const simulation = {
      gridSize,
      velocity: new Float32Array(gridSize * gridSize * 2),
      density: new Float32Array(gridSize * gridSize),
      pressure: new Float32Array(gridSize * gridSize),
      divergence: new Float32Array(gridSize * gridSize),
      timestamp: Date.now(),
    };

    simulationRef.current = simulation;

    if (onSimulationReady) {
      onSimulationReady();
    }

    // Animation loop
    let frameId: number;
    let lastTime = Date.now();
    const frameInterval = 1000 / fps;

    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastTime;

      if (deltaTime >= frameInterval) {
        lastTime = now;

        // Simulate fluid
        simulateFluid(simulation, gridSize, deltaTime / 1000);

        // Render
        renderFluid(canvas, ctx, simulation, gridSize, width, height, colorScheme, burningFloor, burningObstacle, floorShape, floorThickness);
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [width, height, fps, gridResolution, colorScheme, burningFloor, burningObstacle, floorShape, floorThickness, onSimulationReady]);

  const setObstacle = useCallback((x: number, y: number, active: boolean) => {
    if (!simulationRef.current) return;

    const { gridSize, density } = simulationRef.current;
    const gridX = Math.floor(x * gridSize);
    const gridY = Math.floor(y * gridSize);

    if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) return;

    const idx = gridY * gridSize + gridX;
    density[idx] = active ? 1.0 : 0.0;
  }, []);

  return { setObstacle };
};

// Helper functions
function simulateFluid(simulation: any, gridSize: number, dt: number) {
  const { velocity, density, pressure, divergence } = simulation;

  // Add buoyancy from burning floor
  for (let i = 0; i < gridSize * gridSize; i++) {
    if (density[i] > 0.1) {
      const row = Math.floor(i / gridSize);
      velocity[i * 2 + 1] += 0.15; // Upward velocity
    }
  }

  // Dissipation
  const dissipation = 0.98;
  for (let i = 0; i < velocity.length; i++) {
    velocity[i] *= dissipation;
  }

  // Density dissipation
  for (let i = 0; i < gridSize * gridSize; i++) {
    density[i] *= 0.99;
  }

  // Add density at floor if burning
  for (let x = 0; x < gridSize; x++) {
    const idx = (gridSize - 1) * gridSize + x;
    density[idx] = Math.max(density[idx], 0.5 + Math.random() * 0.5);
  }
}

function renderFluid(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  simulation: any,
  gridSize: number,
  width: number,
  height: number,
  colorScheme: string,
  burningFloor: boolean,
  burningObstacle: boolean,
  floorShape: string,
  floorThickness: number
) {
  const { density } = simulation;

  // Clear canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render density
  const pixelSize = Math.max(1, Math.floor(canvas.width / gridSize));

  for (let i = 0; i < gridSize * gridSize; i++) {
    const d = density[i];

    if (d > 0.01) {
      const x = (i % gridSize) * pixelSize;
      const y = Math.floor(i / gridSize) * pixelSize;

      const hue = 10 + d * 40; // Orange/red
      const saturation = 100;
      const lightness = Math.max(20, Math.min(80, 50 * d));

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }
}
