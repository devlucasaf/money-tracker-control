import { API_BASE_URL, getAuthHeaders, validateResponse } from "../remoteUtils.js";

const pesquisarTransacoes = (params = {}) => {
    const urlParams = new URLSearchParams();
    if (params.page !== null && params.page !== undefined) {
        urlParams.set("page", params.page);
    }

    if (params.size !== null && params.size !== undefined) {
        urlParams.set("size", params.size);
    }

    const url = `${API_BASE_URL}/transacoes?${urlParams}`;
    return fetch(url, { headers: getAuthHeaders() })
        .then(validateResponse)
        .then(response => response.json());
};

const criarTransacao = (params = {}) => {
    const url = `${API_BASE_URL}/transacoes`;
    const options = {
        method:  "POST",
        body:    JSON.stringify(params),
        headers: getAuthHeaders(),
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(response => response.json());
};

const excluirTransacao = (id) => {
    const url = `${API_BASE_URL}/transacoes/${id}`;
    const options = { 
        method: "DELETE", 
        headers: getAuthHeaders()
    };
    return fetch(url, options)
        .then(validateResponse)
        .then(() => {});
};

export { pesquisarTransacoes, criarTransacao, excluirTransacao };
