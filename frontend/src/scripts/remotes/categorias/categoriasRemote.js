import { API_BASE_URL, getAuthHeaders, validateResponse } from '../remoteUtils.js';

const pesquisarCategorias = () => {
    const url = `${API_BASE_URL}/categorias`;
    return fetch(url, { headers: getAuthHeaders() })
        .then(validateResponse)
        .then(response => response.json());
};

const criarCategoria = (params = {}) => {
    const url = `${API_BASE_URL}/categorias`;
    const options = {
        method: 'POST',
        body: JSON.stringify(params),
        headers: getAuthHeaders(),
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(response => response.json());
};

const atualizarCategoria = (id, params = {}) => {
    const url = `${API_BASE_URL}/categorias/${id}`;
    const options = {
        method: 'PUT',
        body: JSON.stringify(params),
        headers: getAuthHeaders(),
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(response => response.json());
};

const excluirCategoria = (id) => {
    const url = `${API_BASE_URL}/categorias/${id}`;
    const options = { 
        method: 'DELETE', 
        headers: getAuthHeaders() 
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(() => {});
};

export { pesquisarCategorias, criarCategoria, atualizarCategoria, excluirCategoria };
