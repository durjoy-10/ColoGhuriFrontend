import { useState, useCallback } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const request = useCallback(async (config, showToast = true) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios(config);

            let responseData = response.data;
            if (responseData && typeof responseData === 'object' && responseData.results !== undefined) {
                responseData = {
                    ...responseData,
                    results: responseData.results,
                };
            }

            setData(responseData);

            if (showToast && config.method?.toLowerCase() !== 'get') {
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
        (url, params = {}, showToast = false) => request({ method: 'GET', url, params }, showToast),
        [request]
    );

    const post = useCallback(
        (url, data, showToast = true) => request({ method: 'POST', url, data }, showToast),
        [request]
    );

    const put = useCallback(
        (url, data, showToast = true) => request({ method: 'PUT', url, data }, showToast),
        [request]
    );

    const patch = useCallback(
        (url, data, showToast = true) => request({ method: 'PATCH', url, data }, showToast),
        [request]
    );

    const del = useCallback(
        (url, showToast = true) => request({ method: 'DELETE', url }, showToast),
        [request]
    );

    // Keep both names so old code using `delete` and current code using `del` both work.
    return { loading, error, data, get, post, put, patch, del, delete: del };
};