import { API_BASE_URL, getAuthHeaders, validateResponse } from '../remoteUtils.js';

const pesquisarMetas = () => {
    const url = `${API_BASE_URL}/metas`;
    return fetch(url, { headers: getAuthHeaders() })
        .then(validateResponse)
        .then(response => response.json());
};

const criarMeta = (params = {}) => {
    const url = `${API_BASE_URL}/metas`;
    const options = {
        method: 'POST',
        body: JSON.stringify(params),
        headers: getAuthHeaders(),
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(response => response.json());
};

const atualizarMeta = (id, params = {}) => {
    const url = `${API_BASE_URL}/metas/${id}`;
    const options = {
        method: 'PUT',
        body: JSON.stringify(params),
        headers: getAuthHeaders(),
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(response => response.json());
};

const excluirMeta = (id) => {
    const url = `${API_BASE_URL}/metas/${id}`;
    const options = { 
        method: 'DELETE', 
        headers: getAuthHeaders() 
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(() => {});
};

export { pesquisarMetas, criarMeta, atualizarMeta, excluirMeta };
