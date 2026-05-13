import { API_BASE_URL, validateResponse } from '../remoteUtils.js';

const register = (params = {}) => {
    const url = `${API_BASE_URL}/auth/register`;
    const options = {
        method: 'POST',
        body: JSON.stringify(params),
        headers: { 'Content-Type': 'application/json' },
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(response => response.json());
};

export { register };
