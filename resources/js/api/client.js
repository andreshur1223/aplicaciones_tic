import axios from 'axios';

/**
 * Detecta la base de la app: /repositorio en producción o '' en artisan serve.
 */
export function resolveBasePath() {
    const fromEnv = import.meta.env.VITE_APP_BASE;
    if (fromEnv !== undefined && fromEnv !== '') {
        return String(fromEnv).replace(/\/$/, '');
    }
    const match = window.location.pathname.match(/^(\/repositorio)(?=\/|$)/);
    return match ? match[1] : '';
}

export const basePath = resolveBasePath();

export const api = axios.create({
    baseURL: `${basePath}/api`,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
    },
});

/** Laravel valida X-CSRF-TOKEN antes que X-XSRF-TOKEN; no usar el meta de la SPA. */
function stripStaleCsrfHeader(config) {
    if (config.headers) {
        delete config.headers['X-CSRF-TOKEN'];
        delete config.headers['x-csrf-token'];
    }
}

let csrfCookiePromise = null;

/** Obtiene la cookie XSRF-TOKEN de Laravel (requerida para sesión admin). */
export function ensureCsrfCookie() {
    if (!csrfCookiePromise) {
        csrfCookiePromise = axios
            .get(`${basePath}/sanctum/csrf-cookie`, {
                withCredentials: true,
            })
            .catch((err) => {
                csrfCookiePromise = null;
                throw err;
            });
    }
    return csrfCookiePromise;
}

export function resetCsrfCookie() {
    csrfCookiePromise = null;
}

api.interceptors.request.use(async (config) => {
    const method = (config.method || 'get').toLowerCase();
    const url = config.url || '';
    const isAdmin = url.includes('/admin');
    const needsCsrf = isAdmin || !['get', 'head', 'options'].includes(method);
    if (needsCsrf) {
        await ensureCsrfCookie();
    }
    stripStaleCsrfHeader(config);
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        if (error.response?.status === 419 && config && !config._csrfRetried) {
            config._csrfRetried = true;
            resetCsrfCookie();
            await ensureCsrfCookie();
            return api(config);
        }
        return Promise.reject(error);
    },
);

export const publicApi = {
    categories: () => api.get('/public/categories'),
    applications: (params) => api.get('/public/applications', { params }),
    application: (slug) => api.get(`/public/applications/${slug}`),
    unlockDownload: async (slug, password) => {
        await ensureCsrfCookie();
        return api.post(`/public/applications/${slug}/unlock-download`, { password });
    },
    share: (token) => api.get(`/public/share/${token}`),
    unlockShareDownload: async (token, password) => {
        await ensureCsrfCookie();
        return api.post(`/public/share/${token}/unlock-download`, { password });
    },
};

export const adminApi = {
    login: async (data) => {
        await ensureCsrfCookie();
        const response = await api.post('/admin/login', data);
        resetCsrfCookie();
        await ensureCsrfCookie();
        return response;
    },
    logout: () => api.post('/admin/logout'),
    me: () => api.get('/admin/me'),
    dashboard: () => api.get('/admin/dashboard'),
    uploadLimits: () => api.get('/admin/upload-limits'),
    categories: {
        list: () => api.get('/admin/categories'),
        get: (id) => api.get(`/admin/categories/${id}`),
        create: async (data) => {
            await ensureCsrfCookie();
            return api.post('/admin/categories', data);
        },
        update: async (id, data) => {
            await ensureCsrfCookie();
            return api.put(`/admin/categories/${id}`, data);
        },
        remove: async (id) => {
            await ensureCsrfCookie();
            return api.delete(`/admin/categories/${id}`);
        },
        toggle: async (id) => {
            await ensureCsrfCookie();
            return api.patch(`/admin/categories/${id}/toggle-active`);
        },
    },
    applications: {
        list: (params) => api.get('/admin/applications', { params }),
        get: (id) => api.get(`/admin/applications/${id}`),
        create: async (formData, options = {}) => {
            await ensureCsrfCookie();
            return api.post('/admin/applications', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: options.onUploadProgress,
            });
        },
        update: async (id, formData, options = {}) => {
            await ensureCsrfCookie();
            return api.post(`/admin/applications/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: options.onUploadProgress,
            });
        },
        remove: async (id) => {
            await ensureCsrfCookie();
            return api.delete(`/admin/applications/${id}`);
        },
        toggle: async (id) => {
            await ensureCsrfCookie();
            return api.patch(`/admin/applications/${id}/toggle-active`);
        },
        updateVersion: async (id, version) => {
            await ensureCsrfCookie();
            return api.patch(`/admin/applications/${id}/version`, { version });
        },
        versions: (id) => api.get(`/admin/applications/${id}/versions`),
        versionDownloadUrl: (appId, versionId) =>
            `${basePath}/api/admin/applications/${appId}/versions/${versionId}/download`,
        removeVersion: async (appId, versionId) => {
            await ensureCsrfCookie();
            return api.delete(`/admin/applications/${appId}/versions/${versionId}`);
        },
    },
    downloadLogs: (params) => api.get('/admin/download-logs', { params }),
    sharedLinks: {
        list: () => api.get('/admin/shared-links'),
        create: async (data) => {
            await ensureCsrfCookie();
            return api.post('/admin/shared-links', data);
        },
        toggle: async (id) => {
            await ensureCsrfCookie();
            return api.patch(`/admin/shared-links/${id}/toggle-active`);
        },
        remove: async (id) => {
            await ensureCsrfCookie();
            return api.delete(`/admin/shared-links/${id}`);
        },
    },
};

export function downloadUrl(slug) {
    return `${basePath}/download/${slug}`;
}

/** Página pública con detalles (no descarga automática). */
export function sharePageUrl(token) {
    return `${basePath}/share/${token}`;
}

/** Descarga del archivo vía enlace compartido (solo al pulsar el botón). */
export function shareDownloadUrl(token) {
    return `${basePath}/share/${token}/download`;
}

export const shareUrl = sharePageUrl;
