// Space Armada - Helper Utilities Module
// Extracted from index.html for modularization
// Contains formatting, display, and general utility functions

// ============================================================
// NUMBER FORMATTING
// ============================================================

/**
 * Format a number with locale-specific thousands separators
 * Used for credit displays and large numbers
 * @param {number} value - Number to format
 * @returns {string} Formatted string (e.g., "1,234,567")
 */
export function formatNumber(value) {
    return value.toLocaleString();
}

/**
 * Format credits with CR suffix
 * @param {number} credits - Credit amount
 * @returns {string} Formatted string (e.g., "1,234 CR")
 */
export function formatCredits(credits) {
    return `${formatNumber(credits)} CR`;
}

/**
 * Format a number with specified decimal places
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export function formatDecimal(value, decimals = 1) {
    return value.toFixed(decimals);
}

/**
 * Format a percentage
 * @param {number} value - Value (0-1) or (0-100)
 * @param {boolean} isDecimal - True if value is 0-1, false if 0-100
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, isDecimal = true, decimals = 0) {
    const percent = isDecimal ? value * 100 : value;
    return `${percent.toFixed(decimals)}%`;
}

/**
 * Format a large number with suffix (K, M, B)
 * @param {number} value - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted string (e.g., "1.5M")
 */
export function formatCompact(value, decimals = 1) {
    if (value >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
    return value.toString();
}

// ============================================================
// TIME FORMATTING
// ============================================================

/**
 * Format seconds as MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds as HH:MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTimeLong(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return formatTime(seconds);
}

/**
 * Format milliseconds to readable duration
 * @param {number} ms - Time in milliseconds
 * @returns {string} Human readable duration
 */
export function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
    return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

// ============================================================
// STRING UTILITIES
// ============================================================

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert camelCase to Title Case
 * @param {string} str - camelCase string
 * @returns {string} Title Case string
 */
export function camelToTitle(str) {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, s => s.toUpperCase())
        .trim();
}

/**
 * Truncate string to max length with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength) {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

/**
 * Pad string to specified length
 * @param {string|number} value - Value to pad
 * @param {number} length - Target length
 * @param {string} char - Padding character
 * @param {boolean} padLeft - Pad on left side (true) or right (false)
 * @returns {string} Padded string
 */
export function padString(value, length, char = '0', padLeft = true) {
    const str = String(value);
    if (str.length >= length) return str;
    const padding = char.repeat(length - str.length);
    return padLeft ? padding + str : str + padding;
}

// ============================================================
// ARRAY UTILITIES
// ============================================================

/**
 * Shuffle array in place (Fisher-Yates)
 * @param {Array} array - Array to shuffle
 * @returns {Array} Same array, shuffled
 */
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Create a copy of array and shuffle it
 * @param {Array} array - Array to copy and shuffle
 * @returns {Array} New shuffled array
 */
export function shuffledCopy(array) {
    return shuffle([...array]);
}

/**
 * Remove element from array by value
 * @param {Array} array - Array to modify
 * @param {*} element - Element to remove
 * @returns {boolean} True if element was found and removed
 */
export function removeElement(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Get last element of array
 * @param {Array} array - Array
 * @returns {*} Last element or undefined
 */
export function last(array) {
    return array[array.length - 1];
}

/**
 * Find closest element to target value
 * @param {number[]} array - Array of numbers
 * @param {number} target - Target value
 * @returns {number} Closest value in array
 */
export function findClosest(array, target) {
    return array.reduce((prev, curr) =>
        Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
}

// ============================================================
// OBJECT UTILITIES
// ============================================================

/**
 * Deep clone an object (handles nested objects and arrays)
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Set) return new Set([...obj].map(deepClone));
    if (obj instanceof Map) return new Map([...obj].map(([k, v]) => [k, deepClone(v)]));
    if (Array.isArray(obj)) return obj.map(deepClone);
    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

/**
 * Merge objects deeply (source overwrites target)
 * @param {object} target - Target object
 * @param {object} source - Source object
 * @returns {object} Merged object
 */
export function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }
    return result;
}

// ============================================================
// TIMING UTILITIES
// ============================================================

/**
 * Create a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Create a throttled function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================================
// GAME-SPECIFIC HELPERS
// ============================================================

/**
 * Generate a random frequency for comm system display
 * @returns {string} Frequency string (e.g., "125.7")
 */
export function generateCommFrequency() {
    return (100 + Math.random() * 50).toFixed(1);
}

/**
 * Generate sector coordinate string
 * @param {number} x - Sector X coordinate
 * @param {number} y - Sector Y coordinate
 * @returns {string} Sector string (e.g., "2,-3")
 */
export function formatSectorCoords(x, y) {
    return `${x},${y}`;
}

/**
 * Parse sector coordinate string
 * @param {string} str - Sector string (e.g., "2,-3")
 * @returns {{x: number, y: number}} Sector coordinates
 */
export function parseSectorCoords(str) {
    const [x, y] = str.split(',').map(Number);
    return { x, y };
}

/**
 * Format reputation as a display string with indicator
 * @param {number} rep - Reputation value (-100 to 100)
 * @returns {string} Formatted reputation string
 */
export function formatReputation(rep) {
    if (rep >= 50) return `+${rep} (Allied)`;
    if (rep >= 20) return `+${rep} (Friendly)`;
    if (rep >= -20) return `${rep} (Neutral)`;
    if (rep >= -50) return `${rep} (Unfriendly)`;
    return `${rep} (Hostile)`;
}

/**
 * Get reputation bar color
 * @param {number} rep - Reputation value (-100 to 100)
 * @returns {string} CSS color string
 */
export function getReputationColor(rep) {
    if (rep >= 50) return '#22c55e';  // Green - Allied
    if (rep >= 20) return '#3b82f6';  // Blue - Friendly
    if (rep >= -20) return '#eab308'; // Yellow - Neutral
    if (rep >= -50) return '#f97316'; // Orange - Unfriendly
    return '#ef4444';                  // Red - Hostile
}

/**
 * Calculate health bar fill percentage
 * @param {number} current - Current value
 * @param {number} max - Maximum value
 * @returns {number} Percentage (0-100)
 */
export function healthPercent(current, max) {
    if (max === 0) return 0;
    return Math.max(0, Math.min(100, (current / max) * 100));
}

/**
 * Get color for health bar based on percentage
 * @param {number} percent - Health percentage (0-100)
 * @returns {string} CSS color string
 */
export function getHealthColor(percent) {
    if (percent > 60) return '#22c55e';  // Green
    if (percent > 30) return '#eab308';  // Yellow
    return '#ef4444';                     // Red
}
