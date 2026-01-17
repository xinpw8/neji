// Space Armada - Math Utilities Module
// Extracted and generalized from index.html
// Contains vector math, random helpers, and common math utilities

// ============================================================
// CLAMPING AND INTERPOLATION
// ============================================================

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Inverse linear interpolation - find t given value in range
 * @param {number} a - Start of range
 * @param {number} b - End of range
 * @param {number} value - Value to find t for
 * @returns {number} t value (0-1) representing position in range
 */
export function inverseLerp(a, b, value) {
    if (a === b) return 0;
    return (value - a) / (b - a);
}

/**
 * Map a value from one range to another
 * @param {number} value - Value to map
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return lerp(outMin, outMax, inverseLerp(inMin, inMax, value));
}

/**
 * Smoothstep interpolation (smooth Hermite interpolation)
 * @param {number} edge0 - Left edge
 * @param {number} edge1 - Right edge
 * @param {number} x - Value to interpolate
 * @returns {number} Smoothed value (0-1)
 */
export function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

// ============================================================
// VECTOR OPERATIONS (2D)
// ============================================================

/**
 * Calculate distance between two points
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Distance
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared distance (faster than distance when comparing)
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Squared distance
 */
export function distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

/**
 * Calculate distance from origin
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {number} Distance from (0,0)
 */
export function magnitude(x, y) {
    return Math.sqrt(x * x + y * y);
}

/**
 * Normalize a 2D vector to unit length
 * @param {number} x - X component
 * @param {number} y - Y component
 * @returns {{x: number, y: number}} Normalized vector
 */
export function normalize(x, y) {
    const len = magnitude(x, y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
}

/**
 * Dot product of two 2D vectors
 * @param {number} x1 - First vector X
 * @param {number} y1 - First vector Y
 * @param {number} x2 - Second vector X
 * @param {number} y2 - Second vector Y
 * @returns {number} Dot product
 */
export function dot(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
}

/**
 * Cross product of two 2D vectors (returns scalar z-component)
 * @param {number} x1 - First vector X
 * @param {number} y1 - First vector Y
 * @param {number} x2 - Second vector X
 * @param {number} y2 - Second vector Y
 * @returns {number} Cross product (z-component)
 */
export function cross(x1, y1, x2, y2) {
    return x1 * y2 - y1 * x2;
}

/**
 * Rotate a 2D vector by an angle
 * @param {number} x - X component
 * @param {number} y - Y component
 * @param {number} angle - Rotation angle in radians
 * @returns {{x: number, y: number}} Rotated vector
 */
export function rotateVector(x, y, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
}

// ============================================================
// ANGLE OPERATIONS
// ============================================================

/**
 * Calculate angle between two points (in radians)
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Angle in radians
 */
export function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Normalize angle to range [-PI, PI]
 * @param {number} angle - Angle in radians
 * @returns {number} Normalized angle
 */
export function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}

/**
 * Normalize angle to range [0, 2*PI]
 * @param {number} angle - Angle in radians
 * @returns {number} Normalized angle
 */
export function normalizeAnglePositive(angle) {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
}

/**
 * Calculate the shortest angular difference between two angles
 * @param {number} from - Starting angle in radians
 * @param {number} to - Target angle in radians
 * @returns {number} Shortest angular difference (can be negative)
 */
export function angleDifference(from, to) {
    let diff = to - from;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians
 * @returns {number} Degrees
 */
export function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

// ============================================================
// RANDOM UTILITIES
// ============================================================

/**
 * Random float in range [min, max)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random float
 */
export function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Random integer in range [min, max]
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

/**
 * Random element from an array
 * @param {Array} array - Array to pick from
 * @returns {*} Random element
 */
export function randomElement(array) {
    if (!array || array.length === 0) return undefined;
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Random boolean with optional probability
 * @param {number} probability - Probability of true (0-1), default 0.5
 * @returns {boolean}
 */
export function randomBool(probability = 0.5) {
    return Math.random() < probability;
}

/**
 * Random sign (-1 or 1)
 * @returns {number} -1 or 1
 */
export function randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
}

/**
 * Random point within a circle
 * @param {number} radius - Circle radius
 * @returns {{x: number, y: number}} Random point
 */
export function randomInCircle(radius) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;  // sqrt for uniform distribution
    return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r
    };
}

/**
 * Random point on circle edge
 * @param {number} radius - Circle radius
 * @returns {{x: number, y: number}} Random point on circumference
 */
export function randomOnCircle(radius) {
    const angle = Math.random() * Math.PI * 2;
    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
    };
}

/**
 * Random point in ring (between inner and outer radius)
 * @param {number} innerRadius - Inner radius (minimum distance)
 * @param {number} outerRadius - Outer radius (maximum distance)
 * @returns {{x: number, y: number}} Random point in ring
 */
export function randomInRing(innerRadius, outerRadius) {
    const angle = Math.random() * Math.PI * 2;
    const r = innerRadius + Math.random() * (outerRadius - innerRadius);
    return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r
    };
}

// ============================================================
// EASING FUNCTIONS
// ============================================================

/**
 * Ease in quadratic
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased value
 */
export function easeInQuad(t) {
    return t * t;
}

/**
 * Ease out quadratic
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased value
 */
export function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
}

/**
 * Ease in-out quadratic
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased value
 */
export function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Ease out cubic
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased value
 */
export function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ============================================================
// COLLISION HELPERS
// ============================================================

/**
 * Check if point is within circle
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} cx - Circle center X
 * @param {number} cy - Circle center Y
 * @param {number} radius - Circle radius
 * @returns {boolean}
 */
export function pointInCircle(px, py, cx, cy, radius) {
    return distanceSquared(px, py, cx, cy) <= radius * radius;
}

/**
 * Check if two circles overlap
 * @param {number} x1 - First circle center X
 * @param {number} y1 - First circle center Y
 * @param {number} r1 - First circle radius
 * @param {number} x2 - Second circle center X
 * @param {number} y2 - Second circle center Y
 * @param {number} r2 - Second circle radius
 * @returns {boolean}
 */
export function circlesOverlap(x1, y1, r1, x2, y2, r2) {
    const sumRadii = r1 + r2;
    return distanceSquared(x1, y1, x2, y2) <= sumRadii * sumRadii;
}

/**
 * Check if point is within rectangle
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} rx - Rectangle X (top-left)
 * @param {number} ry - Rectangle Y (top-left)
 * @param {number} rw - Rectangle width
 * @param {number} rh - Rectangle height
 * @returns {boolean}
 */
export function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}
