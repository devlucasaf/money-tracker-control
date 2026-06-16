import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from "../remoteUtils.js";

const pesquisarCategorias = () => {
    const url = `${URL_BASE_API}/categorias`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

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
