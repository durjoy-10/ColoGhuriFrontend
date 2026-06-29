import { useState, useCallback } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const GET_CACHE = new Map();
const GET_IN_FLIGHT = new Map();
const DEFAULT_TTL_MS = 60 * 1000;

const buildCacheKey = (config) => {
    const method = (config.method || 'GET').toUpperCase();
    const params = config.params || {};
    const paramsKey = Object.keys(params)
        .sort()
        .map((key) => `${key}:${String(params[key])}`)
        .join('|');
    const authKey = localStorage.getItem('accessToken') ? 'auth' : 'public';
    return `${authKey}:${method}:${config.url}?${paramsKey}`;
};

const normalizeResponseData = (responseData) => {
    if (responseData && typeof responseData === 'object' && responseData.results !== undefined) {
        return {
            ...responseData,
            results: responseData.results,
        };
    }
    return responseData;
};

export const clearApiGetCache = () => {
    GET_CACHE.clear();
    GET_IN_FLIGHT.clear();
};

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const request = useCallback(async (config, showToast = true) => {
        const method = (config.method || 'GET').toUpperCase();
        const useCache = method === 'GET' && config.cache !== false;
        const cacheKey = useCache ? buildCacheKey(config) : null;
        const ttl = config.cacheTtl ?? DEFAULT_TTL_MS;

        if (useCache && cacheKey) {
            const cached = GET_CACHE.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < ttl) {
                setData(cached.data);
                setError(null);
                return cached.data;
            }

            if (GET_IN_FLIGHT.has(cacheKey)) {
                setLoading(true);
                try {
                    const pendingData = await GET_IN_FLIGHT.get(cacheKey);
                    setData(pendingData);
                    setError(null);
                    return pendingData;
                } finally {
                    setLoading(false);
                }
            }
        }

        setLoading(true);
        setError(null);

        const requestPromise = axios(config)
            .then((response) => normalizeResponseData(response.data))
            .then((responseData) => {
                if (useCache && cacheKey) {
                    GET_CACHE.set(cacheKey, {
                        data: responseData,
                        timestamp: Date.now(),
                    });
                }
                return responseData;
            })
            .finally(() => {
                if (useCache && cacheKey) {
                    GET_IN_FLIGHT.delete(cacheKey);
                }
            });

        if (useCache && cacheKey) {
            GET_IN_FLIGHT.set(cacheKey, requestPromise);
        }

        try {
            const responseData = await requestPromise;
            setData(responseData);

            if (showToast && method !== 'GET') {
                clearApiGetCache();
                toast.success('Operation completed successfully!');
            }

            return responseData;
        } catch (err) {
            const responseData = err.response?.data;
            const message =
                responseData?.error ||
                responseData?.message ||
                (typeof responseData === 'string' ? responseData : null) ||
                'Something went wrong';

            setError(message);

            if (showToast) {
                toast.error(message);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const get = useCallback(
        (url, params = {}, showToast = false, options = {}) => request({ method: 'GET', url, params, ...options }, showToast),
        [request]
    );

    const post = useCallback(
        (url, data, showToast = true) => request({ method: 'POST', url, data, cache: false }, showToast),
        [request]
    );

    const put = useCallback(
        (url, data, showToast = true) => request({ method: 'PUT', url, data, cache: false }, showToast),
        [request]
    );

    const patch = useCallback(
        (url, data, showToast = true) => request({ method: 'PATCH', url, data, cache: false }, showToast),
        [request]
    );

    const del = useCallback(
        (url, showToast = true) => request({ method: 'DELETE', url, cache: false }, showToast),
        [request]
    );

    return { loading, error, data, get, post, put, patch, del, delete: del, clearCache: clearApiGetCache };
};