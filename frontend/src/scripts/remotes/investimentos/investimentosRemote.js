import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from "../remoteUtils.js";

// --- LISTAR INVESTIMENTOS ---
const pesquisarInvestimentos = () => {
    const url = `${URL_BASE_API}/investimentos`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- CRIAR INVESTIMENTO ---
const criarInvestimento = (params = {}) => {
    const url = `${URL_BASE_API}/investimentos`;
    const opcoes = {
        method: "POST",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- ATUALIZAR INVESTIMENTO ---
const atualizarInvestimento = (id, params = {}) => {
    const url = `${URL_BASE_API}/investimentos/${id}`;
    const opcoes = {
        method: "PUT",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- EXCLUIR INVESTIMENTO ---
const excluirInvestimento = (id) => {
    const url = `${URL_BASE_API}/investimentos/${id}`;
    const opcoes = {
        method: "DELETE",
        headers: obterCabecalhosAuth()
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(() => {});
};

export { pesquisarInvestimentos, criarInvestimento, atualizarInvestimento, excluirInvestimento };

