import { API_BASE_URL, validateResponse } from '../remoteUtils.js';

const login = (params = {}) => {
    const url = `${API_BASE_URL}/auth/login`;
    const options = {
        method: 'POST',
        body: JSON.stringify(params),
        headers: { 'Content-Type': 'application/json' },
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(response => response.json());
};

export { login };
