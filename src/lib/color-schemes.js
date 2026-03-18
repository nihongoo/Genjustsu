/**
 * Color schemes for fire simulation
 * Each scheme defines how temperature maps to RGB colors
 */

export const COLOR_SCHEMES = {
    // Classic fire (orange/yellow)
    fire: {
        name: 'Fire',
        getColor: (temp) => {
            temp = Math.min(Math.max(temp, 0.0), 1.0);
            let r, g, b;

            if (temp < 0.3) {
                const s = temp / 0.3;
                r = 0.2 * s;
                g = 0.2 * s;
                b = 0.2 * s;
            } else if (temp < 0.5) {
                const s = (temp - 0.3) / 0.2;
                r = 0.2 + 0.8 * s;
                g = 0.1;
                b = 0.1;
            } else {
                const s = (temp - 0.5) / 0.48;
                r = 1.0;
                g = s;
                b = 0.0;
            }

            return [Math.floor(255 * r), Math.floor(255 * g), Math.floor(255 * b)];
        }
    },

    // Blue fire (hotter)
    blue: {
        name: 'Blue Fire',
        getColor: (temp) => {
            temp = Math.min(Math.max(temp, 0.0), 1.0);
            let r, g, b;

            if (temp < 0.3) {
                const s = temp / 0.3;
                r = 0.1 * s;
                g = 0.1 * s;
                b = 0.3 * s;
            } else if (temp < 0.5) {
                const s = (temp - 0.3) / 0.2;
                r = 0.1;
                g = 0.3 + 0.4 * s;
                b = 0.3 + 0.7 * s;
            } else {
                const s = (temp - 0.5) / 0.5;
                r = 0.6 * s;
                g = 0.7 + 0.3 * s;
                b = 1.0;
            }

            return [Math.floor(255 * r), Math.floor(255 * g), Math.floor(255 * b)];
        }
    },

    // Green/toxic fire
    toxic: {
        name: 'Toxic',
        getColor: (temp) => {
            temp = Math.min(Math.max(temp, 0.0), 1.0);
            let r, g, b;

            if (temp < 0.3) {
                const s = temp / 0.3;
                r = 0.1 * s;
                g = 0.3 * s;
                b = 0.1 * s;
            } else if (temp < 0.5) {
                const s = (temp - 0.3) / 0.2;
                r = 0.1;
                g = 0.3 + 0.6 * s;
                b = 0.1;
            } else {
                const s = (temp - 0.5) / 0.5;
                r = 0.4 * s;
                g = 0.9 + 0.1 * s;
                b = 0.2 * s;
            }

            return [Math.floor(255 * r), Math.floor(255 * g), Math.floor(255 * b)];
        }
    },

    // Purple/magic fire
    purple: {
        name: 'Purple Magic',
        getColor: (temp) => {
            temp = Math.min(Math.max(temp, 0.0), 1.0);
            let r, g, b;

            if (temp < 0.3) {
                const s = temp / 0.3;
                r = 0.2 * s;
                g = 0.1 * s;
                b = 0.3 * s;
            } else if (temp < 0.5) {
                const s = (temp - 0.3) / 0.2;
                r = 0.2 + 0.6 * s;
                g = 0.1;
                b = 0.3 + 0.5 * s;
            } else {
                const s = (temp - 0.5) / 0.5;
                r = 0.8 + 0.2 * s;
                g = 0.3 * s;
                b = 0.8 + 0.2 * s;
            }

            return [Math.floor(255 * r), Math.floor(255 * g), Math.floor(255 * b)];
        }
    },

    // Cyan/ice fire
    ice: {
        name: 'Ice',
        getColor: (temp) => {
            temp = Math.min(Math.max(temp, 0.0), 1.0);
            let r, g, b;

            if (temp < 0.3) {
                const s = temp / 0.3;
                r = 0.1 * s;
                g = 0.2 * s;
                b = 0.3 * s;
            } else if (temp < 0.5) {
                const s = (temp - 0.3) / 0.2;
                r = 0.1;
                g = 0.2 + 0.6 * s;
                b = 0.3 + 0.6 * s;
            } else {
                const s = (temp - 0.5) / 0.5;
                r = 0.5 * s;
                g = 0.8 + 0.2 * s;
                b = 0.9 + 0.1 * s;
            }

            return [Math.floor(255 * r), Math.floor(255 * g), Math.floor(255 * b)];
        }
    },

    // Hot metal/lava
    lava: {
        name: 'Lava',
        getColor: (temp) => {
            temp = Math.min(Math.max(temp, 0.0), 1.0);
            let r, g, b;

            if (temp < 0.3) {
                const s = temp / 0.3;
                r = 0.3 * s;
                g = 0.0;
                b = 0.0;
            } else if (temp < 0.6) {
                const s = (temp - 0.3) / 0.3;
                r = 0.3 + 0.7 * s;
                g = 0.2 * s;
                b = 0.0;
            } else {
                const s = (temp - 0.6) / 0.4;
                r = 1.0;
                g = 0.2 + 0.6 * s;
                b = 0.1 * s;
            }

            return [Math.floor(255 * r), Math.floor(255 * g), Math.floor(255 * b)];
        }
    },
    black: {
        name: 'Amaterasu',
        getColor: (temp) => {
            temp = Math.min(Math.max(temp, 0.0), 1.0);
            let r, g, b;
 
            if (temp < 0.3) {
                // Vùng tối: Đen gần như hoàn toàn với chút đỏ
                const s = temp / 0.3;
                r = 0.15 * s;
                g = 0.0;
                b = 0.05 * s;
            } else if (temp < 0.6) {
                // Vùng giữa: Đỏ đen huyền bí
                const s = (temp - 0.3) / 0.3;
                r = 0.15 + 0.35 * s;
                g = 0.0;
                b = 0.05 + 0.15 * s;
            } else {
                // Vùng nóng nhất: Đỏ cam tối với chút tím
                const s = (temp - 0.6) / 0.4;
                r = 0.5 + 0.3 * s;
                g = 0.1 * s;
                b = 0.2 + 0.2 * s;
            }
 
            return [Math.floor(255 * r), Math.floor(255 * g), Math.floor(255 * b)];
        }
    },

    // Rainbow/spectrum
    rainbow: {
        name: 'Rainbow',
        getColor: (temp) => {
            temp = Math.min(Math.max(temp, 0.0), 1.0);
            
            // HSV to RGB conversion for rainbow
            const h = (1.0 - temp) * 0.8; // 0.8 = purple to red
            const s = 1.0;
            const v = temp;

            const i = Math.floor(h * 6);
            const f = h * 6 - i;
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);

            let r, g, b;
            switch (i % 6) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
                default: r = g = b = 0;
            }

            return [Math.floor(255 * r), Math.floor(255 * g), Math.floor(255 * b)];
        }
    },

    // Grayscale/smoke
    smoke: {
        name: 'Smoke',
        getColor: (temp) => {
            temp = Math.min(Math.max(temp, 0.0), 1.0);
            const gray = temp * 0.8;
            const val = Math.floor(255 * gray);
            return [val, val, val];
        }
    },

    // Custom - can be overridden by user
    custom: {
        name: 'Custom',
        getColor: (temp) => {
            // Default to fire scheme
            return COLOR_SCHEMES.fire.getColor(temp);
        }
    }
};

/**
 * Get RGB color for a given temperature and color scheme
 */
export function getFireColor(temp, scheme = 'fire') {
    // ✅ Nếu nhiệt độ quá thấp → transparent (áp dụng cho TẤT CẢ màu)
    if (temp < 0.1) {
        return 'transparent';
    }
    
    const colorScheme = COLOR_SCHEMES[scheme] || COLOR_SCHEMES.fire;
    const [r, g, b] = colorScheme.getColor(temp);
    
    // ✅ Luôn dùng RGBA với alpha dựa trên nhiệt độ
    const alpha = Math.pow(temp, 0.8); // Fade mượt từ 0 → 1
    
    return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Get all available color scheme names
 */
export function getColorSchemeNames() {
    return Object.keys(COLOR_SCHEMES).map(key => ({
        id: key,
        name: COLOR_SCHEMES[key].name
    }));
}

/**
 * Set custom color scheme function
 */
export function setCustomColorScheme(colorFunction) {
    COLOR_SCHEMES.custom.getColor = colorFunction;
}
