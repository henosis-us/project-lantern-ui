import axios from 'axios';

// Create Axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  });

// Add a response error interceptor for logging API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `[API-ERR] ${error.config.method?.toUpperCase()} ${error.config.url} →`,
        `status ${error.response.status}`,
        error.response.data
      );
    } else {
      console.error('[API-ERR] Network / CORS problem', error.message);
    }
    return Promise.reject(error);
  });


// --- Subtitle API helpers ---
export const getLocalSubtitles = (mediaId, itemType) =>
  api.get(`/subtitles/${mediaId}?item_type=${itemType}`);

export const searchRemoteSubtitles = (mediaId, itemType, lang = 'en') =>
  api.get(`/subtitles/${mediaId}/search?item_type=${itemType}&lang=${lang}`);

export const downloadSubtitle = (mediaId, itemType, payload) =>
  api.post(`/subtitles/${mediaId}/download`, { ...payload, item_type: itemType });

export const getCurrentSubtitleSelection = (mediaId, itemType) =>
  api.get(`/subtitles/${mediaId}/current?item_type=${itemType}`);

export const setSubtitleSelection = (mediaId, itemType, subtitleId) =>
  api.put(`/subtitles/${mediaId}/select?item_type=${itemType}`, { subtitle_id: subtitleId });


// --- Unified History API helpers ---
export const saveProgress = (mediaId, itemType, positionSeconds, durationSeconds) =>
  api.put(
    `/history/${mediaId}?item_type=${itemType}`,
    { position_seconds: positionSeconds, duration_seconds: durationSeconds }
  );

export const getProgress = (mediaId, itemType) =>
  api.get(`/history/${mediaId}?item_type=${itemType}`);

export const clearProgress = (mediaId, itemType) =>
  api.delete(`/history/${mediaId}?item_type=${itemType}`);

// Continue watching list (no change needed, endpoint handles both)
export const getContinue = () => api.get('/history/continue/');


// Export the main api instance for general use
export default api;