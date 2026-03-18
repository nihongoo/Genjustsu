/**
 * Fluid Dynamics Simulator
 * Based on Navier-Stokes equations with Semi-Lagrangian method
 */

export const FIELD_TYPES = {
    U_FIELD: 0,
    V_FIELD: 1,
    T_FIELD: 2,
};

export class Fluid {
    constructor(numX, numY, h) {
        this.numX = numX + 2;
        this.numY = numY + 2;
        this.numCells = this.numX * this.numY;
        this.h = h;
        this.u = new Float32Array(this.numCells);
        this.v = new Float32Array(this.numCells);
        this.newU = new Float32Array(this.numCells);
        this.newV = new Float32Array(this.numCells);
        this.s = new Float32Array(this.numCells);
        this.t = new Float32Array(this.numCells);
        this.newT = new Float32Array(this.numCells);

        this.t.fill(0.0);
        this.s.fill(1.0);

        this.numSwirls = 0;
        const maxSwirls = 100;
        this.swirlX = new Float32Array(maxSwirls);
        this.swirlY = new Float32Array(maxSwirls);
        this.swirlOmega = new Float32Array(maxSwirls);
        this.swirlRadius = new Float32Array(maxSwirls);
        this.swirlTime = new Float32Array(maxSwirls);
        this.swirlTime.fill(0.0);
    }

    integrate(dt, gravity) {
        const n = this.numY;
        for (let i = 1; i < this.numX; i++) {
            for (let j = 1; j < this.numY - 1; j++) {
                if (this.s[i * n + j] !== 0.0 && this.s[i * n + j - 1] !== 0.0) {
                    this.v[i * n + j] += gravity * dt;
                }
            }
        }
    }

    solveIncompressibility(numIters, dt) {
        const n = this.numY;
        const overRelaxation = 1.9;

        for (let iter = 0; iter < numIters; iter++) {
            for (let i = 1; i < this.numX - 1; i++) {
                for (let j = 1; j < this.numY - 1; j++) {
                    if (this.s[i * n + j] === 0.0) continue;

                    const sx0 = this.s[(i - 1) * n + j];
                    const sx1 = this.s[(i + 1) * n + j];
                    const sy0 = this.s[i * n + j - 1];
                    const sy1 = this.s[i * n + j + 1];
                    const s = sx0 + sx1 + sy0 + sy1;
                    if (s === 0.0) continue;

                    const div =
                        this.u[(i + 1) * n + j] -
                        this.u[i * n + j] +
                        this.v[i * n + j + 1] -
                        this.v[i * n + j];

                    let p = -div / s;
                    p *= overRelaxation;
                    this.u[i * n + j] -= sx0 * p;
                    this.u[(i + 1) * n + j] += sx1 * p;
                    this.v[i * n + j] -= sy0 * p;
                    this.v[i * n + j + 1] += sy1 * p;
                }
            }
        }
    }

    extrapolate() {
        const n = this.numY;
        for (let i = 0; i < this.numX; i++) {
            this.u[i * n + 0] = this.u[i * n + 1];
            this.u[i * n + this.numY - 1] = this.u[i * n + this.numY - 2];
        }
        for (let j = 0; j < this.numY; j++) {
            this.v[0 * n + j] = this.v[1 * n + j];
            this.v[(this.numX - 1) * n + j] = this.v[(this.numX - 2) * n + j];
        }
    }

    sampleField(x, y, field) {
        const n = this.numY;
        const h = this.h;
        const h1 = 1.0 / h;
        const h2 = 0.5 * h;

        x = Math.max(Math.min(x, this.numX * h), h);
        y = Math.max(Math.min(y, this.numY * h), h);

        let dx = 0.0;
        let dy = 0.0;
        let f;

        switch (field) {
            case FIELD_TYPES.U_FIELD:
                f = this.u;
                dy = h2;
                break;
            case FIELD_TYPES.V_FIELD:
                f = this.v;
                dx = h2;
                break;
            case FIELD_TYPES.T_FIELD:
                f = this.t;
                dx = h2;
                dy = h2;
                break;
            default:
                f = this.t;
        }

        let x0 = Math.min(Math.floor((x - dx) * h1), this.numX - 1);
        const tx = ((x - dx) - x0 * h) * h1;
        const x1 = Math.min(x0 + 1, this.numX - 1);

        let y0 = Math.min(Math.floor((y - dy) * h1), this.numY - 1);
        const ty = ((y - dy) - y0 * h) * h1;
        const y1 = Math.min(y0 + 1, this.numY - 1);

        const sx = 1.0 - tx;
        const sy = 1.0 - ty;

        const val =
            sx * sy * f[x0 * n + y0] +
            tx * sy * f[x1 * n + y0] +
            tx * ty * f[x1 * n + y1] +
            sx * ty * f[x0 * n + y1];

        return val;
    }

    avgU(i, j) {
        const n = this.numY;
        const u =
            (this.u[i * n + j - 1] +
                this.u[i * n + j] +
                this.u[(i + 1) * n + j - 1] +
                this.u[(i + 1) * n + j]) *
            0.25;
        return u;
    }

    avgV(i, j) {
        const n = this.numY;
        const v =
            (this.v[(i - 1) * n + j] +
                this.v[i * n + j] +
                this.v[(i - 1) * n + j + 1] +
                this.v[i * n + j + 1]) *
            0.25;
        return v;
    }

    advectVel(dt) {
        this.newU.set(this.u);
        this.newV.set(this.v);

        const n = this.numY;
        const h = this.h;
        const h2 = 0.5 * h;

        for (let i = 1; i < this.numX; i++) {
            for (let j = 1; j < this.numY; j++) {
                if (
                    this.s[i * n + j] !== 0.0 &&
                    this.s[(i - 1) * n + j] !== 0.0 &&
                    j < this.numY - 1
                ) {
                    let x = i * h;
                    let y = j * h + h2;
                    const u = this.u[i * n + j];
                    const v = this.avgV(i, j);
                    x = x - dt * u;
                    y = y - dt * v;
                    const sampledU = this.sampleField(x, y, FIELD_TYPES.U_FIELD);
                    this.newU[i * n + j] = sampledU;
                }
                if (
                    this.s[i * n + j] !== 0.0 &&
                    this.s[i * n + j - 1] !== 0.0 &&
                    i < this.numX - 1
                ) {
                    let x = i * h + h2;
                    let y = j * h;
                    const u = this.avgU(i, j);
                    const v = this.v[i * n + j];
                    x = x - dt * u;
                    y = y - dt * v;
                    const sampledV = this.sampleField(x, y, FIELD_TYPES.V_FIELD);
                    this.newV[i * n + j] = sampledV;
                }
            }
        }

        this.u.set(this.newU);
        this.v.set(this.newV);
    }

    advectTemperature(dt) {
        this.newT.set(this.t);

        const n = this.numY;
        const h = this.h;
        const h2 = 0.5 * h;

        for (let i = 1; i < this.numX - 1; i++) {
            for (let j = 1; j < this.numY - 1; j++) {
                if (this.s[i * n + j] !== 0.0) {
                    const u = (this.u[i * n + j] + this.u[(i + 1) * n + j]) * 0.5;
                    const v = (this.v[i * n + j] + this.v[i * n + j + 1]) * 0.5;
                    const x = i * h + h2 - dt * u;
                    const y = j * h + h2 - dt * v;

                    this.newT[i * n + j] = this.sampleField(x, y, FIELD_TYPES.T_FIELD);
                }
            }
        }
        this.t.set(this.newT);
    }

    updateFire(dt, sceneConfig) {
        const h = this.h;

        const swirlTimeSpan = 1.0;
        const swirlOmega = 20.0;
        const swirlDamping = 10.0 * dt;
        const swirlProbability = sceneConfig.swirlProbability * h * h;

        const fireCooling = 1.2 * dt;
        const smokeCooling = 0.3 * dt;
        const lift = 3.0;
        const acceleration = 6.0 * dt;
        const kernelRadius = sceneConfig.swirlMaxRadius;

        const n = this.numY;
        const maxX = (this.numX - 1) * this.h;
        const maxY = (this.numY - 1) * this.h;

        // Kill old swirls
        let num = 0;
        for (let nr = 0; nr < this.numSwirls; nr++) {
            this.swirlTime[nr] -= dt;
            if (this.swirlTime[nr] > 0.0) {
                this.swirlTime[num] = this.swirlTime[nr];
                this.swirlX[num] = this.swirlX[nr];
                this.swirlY[num] = this.swirlY[nr];
                this.swirlOmega[num] = this.swirlOmega[nr];
                num++;
            }
        }
        this.numSwirls = num;

        // Advect swirls
        for (let nr = 0; nr < this.numSwirls; nr++) {
            let x = this.swirlX[nr];
            let y = this.swirlY[nr];
            const swirlU =
                (1.0 - swirlDamping) * this.sampleField(x, y, FIELD_TYPES.U_FIELD);
            const swirlV =
                (1.0 - swirlDamping) * this.sampleField(x, y, FIELD_TYPES.V_FIELD);
            x += swirlU * dt;
            y += swirlV * dt;
            x = Math.min(Math.max(x, h), maxX);
            y = Math.min(Math.max(y, h), maxY);

            this.swirlX[nr] = x;
            this.swirlY[nr] = y;
            const omega = this.swirlOmega[nr];

            // Update velocity field
            const x0 = Math.max(Math.floor((x - kernelRadius) / h), 0);
            const y0 = Math.max(Math.floor((y - kernelRadius) / h), 0);
            const x1 = Math.min(Math.floor((x + kernelRadius) / h) + 1, this.numX - 1);
            const y1 = Math.min(Math.floor((y + kernelRadius) / h) + 1, this.numY - 1);

            for (let i = x0; i <= x1; i++) {
                for (let j = y0; j <= y1; j++) {
                    for (let dim = 0; dim < 2; dim++) {
                        const vx = dim === 0 ? i * h : (i + 0.5) * h;
                        const vy = dim === 0 ? (j + 0.5) * h : j * h;

                        const rx = vx - x;
                        const ry = vy - y;
                        const r = Math.sqrt(rx * rx + ry * ry);

                        if (r < kernelRadius) {
                            let s = 1.0;
                            if (r > 0.8 * kernelRadius) {
                                s = 5.0 - (5.0 / kernelRadius) * r;
                            }

                            if (dim === 0) {
                                const target = ry * omega + swirlU;
                                this.u[n * i + j] += (target - this.u[n * i + j]) * s;
                            } else {
                                const target = -rx * omega + swirlV;
                                this.v[n * i + j] += (target - this.v[n * i + j]) * s;
                            }
                        }
                    }
                }
            }
        }

        // Update temperatures
        const minR = 0.85 * sceneConfig.obstacleRadius;
        const maxR = sceneConfig.obstacleRadius + h;

        for (let i = 0; i < this.numX; i++) {
            for (let j = 0; j < this.numY; j++) {
                let t = this.t[i * n + j];

                const cooling = t < 0.3 ? smokeCooling : fireCooling;
                this.t[i * n + j] = Math.max(t - cooling, 0.0);

                const u = this.u[i * n + j];
                const v = this.v[i * n + j];
                const targetV = t * lift;
                this.v[i * n + j] += (targetV - v) * acceleration;

                let numNewSwirls = 0;

                // Obstacle burning
                if (sceneConfig.burningObstacle) {
                    const dx = (i + 0.5) * this.h - sceneConfig.obstacleX;
                    const dy = (j + 0.5) * this.h - sceneConfig.obstacleY - 3.0 * this.h;
                    const d = dx * dx + dy * dy;
                    if (minR * minR <= d && d < maxR * maxR) {
                        this.t[i * n + j] = 1.0;
                        if (Math.random() < 0.5 * swirlProbability) numNewSwirls++;
                    }
                }

                // Floor burning
                if (sceneConfig.burningFloor && this.isInFloorShape(i, j)) {
                    this.t[i * n + j] = 1.0;
                    this.u[i * n + j] = 0.0;
                    this.v[i * n + j] = 0.0;
                    if (Math.random() < swirlProbability) numNewSwirls++;
                }

                for (let k = 0; k < numNewSwirls; k++) {
                    if (this.numSwirls >= 100) break;
                    const nr = this.numSwirls;
                    this.swirlX[nr] = i * h;
                    this.swirlY[nr] = j * h;
                    this.swirlOmega[nr] = (-1.0 + 2.0 * Math.random()) * swirlOmega;
                    this.swirlTime[nr] = swirlTimeSpan;
                    this.numSwirls++;
                }
            }
        }

        // Smooth temperatures
        for (let i = 1; i < this.numX - 1; i++) {
            for (let j = 1; j < this.numY - 1; j++) {
                const t = this.t[i * n + j];
                if (t === 1.0) {
                    const avg =
                        (this.t[(i - 1) * n + (j - 1)] +
                            this.t[(i + 1) * n + (j - 1)] +
                            this.t[(i + 1) * n + (j + 1)] +
                            this.t[(i - 1) * n + (j + 1)]) *
                        0.25;
                    this.t[i * n + j] = avg;
                }
            }
        }
    }

    simulate(dt, gravity, numIters, sceneConfig) {
        this.integrate(dt, gravity);
        this.solveIncompressibility(numIters, dt);
        this.extrapolate();
        this.advectVel(dt);
        this.advectTemperature(dt);
        this.updateFire(dt, sceneConfig);
    }

    // Method to check floor shape - will be set by FireSimulation
    isInFloorShape(i, j) {
        // Default implementation
        return j < 4;
    }
}
