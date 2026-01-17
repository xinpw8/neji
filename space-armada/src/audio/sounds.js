// Space Armada - Audio Module
// Placeholder for audio system
// The original game doesn't have audio implemented yet

// ============================================================
// AUDIO CONTEXT AND STATE
// ============================================================

/**
 * Audio context for Web Audio API
 * Initialized on first user interaction
 */
let audioContext = null;

/**
 * Master volume (0-1)
 */
let masterVolume = 0.7;

/**
 * Sound effect volume (0-1)
 */
let sfxVolume = 1.0;

/**
 * Music volume (0-1)
 */
let musicVolume = 0.5;

/**
 * Whether audio is muted
 */
let isMuted = false;

// ============================================================
// SOUND DEFINITIONS
// ============================================================

/**
 * Sound effect definitions for future implementation
 * Each sound has a type and optional parameters
 */
export const SOUND_EFFECTS = {
    // Weapons
    primaryFire: { type: 'laser', frequency: 440, duration: 0.1 },
    turretFire: { type: 'laser', frequency: 880, duration: 0.08 },
    missileLaunch: { type: 'whoosh', duration: 0.3 },
    missileExplode: { type: 'explosion', duration: 0.5 },

    // Impacts
    shieldHit: { type: 'impact', frequency: 220, duration: 0.15 },
    hullHit: { type: 'impact', frequency: 110, duration: 0.2 },
    explosion: { type: 'explosion', duration: 0.6 },

    // UI
    menuSelect: { type: 'beep', frequency: 660, duration: 0.05 },
    menuConfirm: { type: 'beep', frequency: 880, duration: 0.1 },
    menuCancel: { type: 'beep', frequency: 330, duration: 0.1 },

    // Alerts
    warning: { type: 'alarm', frequency: 440, duration: 0.3 },
    shieldsLow: { type: 'alarm', frequency: 220, duration: 0.5 },
    hullCritical: { type: 'alarm', frequency: 110, duration: 0.8 },

    // Actions
    docking: { type: 'hum', duration: 1.0 },
    undocking: { type: 'hum', duration: 0.8 },
    hyperspace: { type: 'warp', duration: 2.0 },

    // Pickups
    creditPickup: { type: 'chime', frequency: 660, duration: 0.2 },
    healthPickup: { type: 'chime', frequency: 440, duration: 0.3 },

    // Comm
    commOpen: { type: 'static', duration: 0.2 },
    commClose: { type: 'static', duration: 0.1 }
};

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize audio context (must be called after user interaction)
 * @returns {boolean} True if initialization succeeded
 */
export function initAudio() {
    if (audioContext) return true;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return true;
    } catch (e) {
        console.warn('Web Audio API not supported:', e);
        return false;
    }
}

/**
 * Resume audio context if suspended
 * Required for browsers that suspend audio until user interaction
 */
export async function resumeAudio() {
    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }
}

/**
 * Get audio context (initializes if needed)
 * @returns {AudioContext|null}
 */
export function getAudioContext() {
    if (!audioContext) initAudio();
    return audioContext;
}

// ============================================================
// VOLUME CONTROL
// ============================================================

/**
 * Set master volume
 * @param {number} volume - Volume level (0-1)
 */
export function setMasterVolume(volume) {
    masterVolume = Math.max(0, Math.min(1, volume));
}

/**
 * Get master volume
 * @returns {number}
 */
export function getMasterVolume() {
    return masterVolume;
}

/**
 * Set sound effects volume
 * @param {number} volume - Volume level (0-1)
 */
export function setSfxVolume(volume) {
    sfxVolume = Math.max(0, Math.min(1, volume));
}

/**
 * Get sound effects volume
 * @returns {number}
 */
export function getSfxVolume() {
    return sfxVolume;
}

/**
 * Set music volume
 * @param {number} volume - Volume level (0-1)
 */
export function setMusicVolume(volume) {
    musicVolume = Math.max(0, Math.min(1, volume));
}

/**
 * Get music volume
 * @returns {number}
 */
export function getMusicVolume() {
    return musicVolume;
}

/**
 * Toggle mute state
 * @returns {boolean} New mute state
 */
export function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
}

/**
 * Set mute state
 * @param {boolean} muted
 */
export function setMuted(muted) {
    isMuted = muted;
}

/**
 * Check if audio is muted
 * @returns {boolean}
 */
export function isSoundMuted() {
    return isMuted;
}

/**
 * Calculate effective volume for a sound
 * @param {string} category - 'sfx' or 'music'
 * @returns {number} Effective volume (0-1)
 */
export function getEffectiveVolume(category = 'sfx') {
    if (isMuted) return 0;
    const categoryVolume = category === 'music' ? musicVolume : sfxVolume;
    return masterVolume * categoryVolume;
}

// ============================================================
// SOUND PLAYBACK (Placeholder implementations)
// ============================================================

/**
 * Play a sound effect
 * @param {string} soundId - Sound effect ID from SOUND_EFFECTS
 * @param {object} options - Optional playback options
 * @returns {boolean} True if sound was played
 */
export function playSound(soundId, options = {}) {
    if (isMuted) return false;

    const sound = SOUND_EFFECTS[soundId];
    if (!sound) {
        console.warn(`Unknown sound: ${soundId}`);
        return false;
    }

    // Placeholder - actual implementation would use Web Audio API
    // console.log(`Playing sound: ${soundId}`);
    return true;
}

/**
 * Play a positional sound (with 3D positioning)
 * @param {string} soundId - Sound effect ID
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} listenerX - Listener X position
 * @param {number} listenerY - Listener Y position
 * @param {number} maxDistance - Maximum audible distance
 * @returns {boolean} True if sound was played
 */
export function playPositionalSound(soundId, x, y, listenerX, listenerY, maxDistance = 2000) {
    if (isMuted) return false;

    const dx = x - listenerX;
    const dy = y - listenerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxDistance) return false;

    // Calculate volume falloff
    const volumeMultiplier = 1 - (distance / maxDistance);

    return playSound(soundId, { volume: volumeMultiplier });
}

/**
 * Stop all currently playing sounds
 */
export function stopAllSounds() {
    // Placeholder - would stop all active sound nodes
}

/**
 * Stop a specific sound
 * @param {string} soundId - Sound to stop
 */
export function stopSound(soundId) {
    // Placeholder - would stop specific sound if playing
}

// ============================================================
// PROCEDURAL SOUND GENERATION (For future implementation)
// ============================================================

/**
 * Generate a simple tone
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {string} waveform - 'sine', 'square', 'sawtooth', 'triangle'
 */
export function playTone(frequency, duration, waveform = 'sine') {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;

    try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = waveform;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(getEffectiveVolume() * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        console.warn('Error playing tone:', e);
    }
}

/**
 * Generate a laser sound effect
 * @param {number} baseFrequency - Starting frequency
 */
export function playLaserSound(baseFrequency = 440) {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;

    try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(baseFrequency * 2, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * 0.5, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(getEffectiveVolume() * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.warn('Error playing laser sound:', e);
    }
}

/**
 * Generate an explosion sound effect
 */
export function playExplosionSound() {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;

    try {
        // White noise burst for explosion
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }

        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

        gainNode.gain.setValueAtTime(getEffectiveVolume() * 0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start(ctx.currentTime);
    } catch (e) {
        console.warn('Error playing explosion sound:', e);
    }
}
