/**
 * API Service for handling REST API calls
 * Centralized module for all API communications
 */

// Base URL for API calls - uses current hostname with port 8000
const getBaseUrl = () => `http://${window.location.hostname}:8000`;

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 5000;

/**
 * Generic fetch wrapper with timeout support
 * @param {string} endpoint - API endpoint (e.g., '/api/settings/camera')
 * @param {object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
const fetchWithTimeout = async (endpoint, options = {}, timeout = DEFAULT_TIMEOUT) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(`${getBaseUrl()}${endpoint}`, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeout}ms`);
        }
        throw error;
    }
};

/**
 * Generic GET request
 * @param {string} endpoint - API endpoint
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<any>}
 */
const get = async (endpoint, timeout = DEFAULT_TIMEOUT) => {
    const response = await fetchWithTimeout(endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }, timeout);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `GET ${endpoint} failed with status ${response.status}`);
    }

    return response.json();
};

/**
 * Generic POST request
 * @param {string} endpoint - API endpoint
 * @param {any} data - Data to send
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<any>}
 */
const post = async (endpoint, data, timeout = DEFAULT_TIMEOUT) => {
    const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }, timeout);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `POST ${endpoint} failed with status ${response.status}`);
    }

    return response.json();
};

// ============================================
// Camera Settings API
// ============================================

/**
 * Get camera settings from the server
 * @returns {Promise<object>} Camera settings object
 */
export const getCameraSettings = async () => {
    return get('/api/settings/camera');
};

/**
 * Save camera settings to the server
 * @param {object} cameraSettings - Camera settings to save
 * @returns {Promise<object>} Response from server
 */
export const saveCameraSettings = async (cameraSettings) => {
    return post('/api/settings/camera', cameraSettings);
};

// ============================================
// Motors Settings API
// ============================================

/**
 * Get motors settings from the server
 * @returns {Promise<array>} Array of motor settings
 */
export const getMotorsSettings = async () => {
    return get('/api/settings/motors');
};

/**
 * Save motors settings to the server
 * @param {array} motorsSettings - Array of motor settings to save
 * @returns {Promise<object>} Response from server
 */
export const saveMotorsSettings = async (motorsSettings) => {
    return post('/api/settings/motors', motorsSettings);
};

// ============================================
// General Settings API (if needed in future)
// ============================================

/**
 * Get all settings from the server
 * @returns {Promise<object>} Full settings object
 */
export const getAllSettings = async () => {
    return get('/api/settings');
};

/**
 * Save all settings to the server
 * @param {object} settings - Full settings object to save
 * @returns {Promise<object>} Response from server
 */
export const saveAllSettings = async (settings) => {
    return post('/api/settings', settings);
};

// Export default object with all API functions
export default {
    getCameraSettings,
    saveCameraSettings,
    getMotorsSettings,
    saveMotorsSettings,
    getAllSettings,
    saveAllSettings
};
