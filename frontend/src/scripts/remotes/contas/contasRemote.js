import { API_BASE_URL, getAuthHeaders, validateResponse } from '../remoteUtils.js';

const pesquisarContas = () => {
    const url = `${API_BASE_URL}/contas`;
    return fetch(url, { headers: getAuthHeaders() })
        .then(validateResponse)
        .then(response => response.json());
};

const criarConta = (params = {}) => {
    const url = `${API_BASE_URL}/contas`;
    const options = {
        method: 'POST',
        body: JSON.stringify(params),
        headers: getAuthHeaders(),
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(response => response.json());
};

const atualizarConta = (id, params = {}) => {
    const url = `${API_BASE_URL}/contas/${id}`;
    const options = {
        method: 'PUT',
        body: JSON.stringify(params),
        headers: getAuthHeaders(),
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(response => response.json());
};

const excluirConta = (id) => {
    const url = `${API_BASE_URL}/contas/${id}`;
    const options = { method: 'DELETE', headers: getAuthHeaders() };
    return fetch(url, options)
        .then(validateResponse)
        .then(() => {});
};

export { pesquisarContas, criarConta, atualizarConta, excluirConta };
