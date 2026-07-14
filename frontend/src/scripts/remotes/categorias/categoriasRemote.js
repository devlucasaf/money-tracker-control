import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from "../remoteUtils.js";

// --- PESQUISA TODAS AS CATEGORIAS DO USUÁRIO AUTENTICADO ---
const pesquisarCategorias = () => {
    const url = `${URL_BASE_API}/categorias`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- CRIAR UMA NOVA CATEGORIA E ENVIA PARA O BACKEND ---
const criarCategoria = (params = {}) => {
    const url = `${URL_BASE_API}/categorias`;

    const opcoes = {
        method: "POST",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- ATUALIZAR UMA CATEGORIA EXISTENTE PELO ID ---
const atualizarCategoria = (id, params = {}) => {
    const url = `${URL_BASE_API}/categorias/${id}`;
    const opcoes = {
        method: "PUT",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- EXCLUI UMA CATEGORIA EXISTENTE PELO ID ---
const excluirCategoria = (id) => {
    const url = `${URL_BASE_API}/categorias/${id}`;
    const opcoes = {
        method: "DELETE",
        headers: obterCabecalhosAuth()
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(() => {});
};

export { pesquisarCategorias, criarCategoria, atualizarCategoria, excluirCategoria };
