import { API_BASE_URL, getAuthHeaders, validateResponse } from '../remoteUtils.js';

const getDashboard = () => {
    const url = `${API_BASE_URL}/dashboard`;
    return fetch(url, { headers: getAuthHeaders() })
        .then(validateResponse)
        .then(response => response.json());
};

export { getDashboard };
