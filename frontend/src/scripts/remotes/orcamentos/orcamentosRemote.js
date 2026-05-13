import { API_BASE_URL, getAuthHeaders, validateResponse } from '../remoteUtils.js';

const pesquisarOrcamentos = () => {
    const url = `${API_BASE_URL}/orcamentos`;
    return fetch(url, { headers: getAuthHeaders() })
        .then(validateResponse)
        .then(response => response.json());
};

const criarOrcamento = (params = {}) => {
    const url = `${API_BASE_URL}/orcamentos`;
    const options = {
        method: 'POST',
        body: JSON.stringify(params),
        headers: getAuthHeaders(),
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(response => response.json());
};

const excluirOrcamento = (id) => {
    const url = `${API_BASE_URL}/orcamentos/${id}`;
    const options = { 
        method: 'DELETE', 
        headers: getAuthHeaders() 
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(() => {});
};

export { pesquisarOrcamentos, criarOrcamento, excluirOrcamento };
