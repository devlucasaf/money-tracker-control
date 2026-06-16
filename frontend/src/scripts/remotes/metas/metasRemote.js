import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from "../remoteUtils.js";

const pesquisarMetas = () => {
    const url = `${URL_BASE_API}/metas`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

const criarMeta = (params = {}) => {
    const url = `${URL_BASE_API}/metas`;
    const opcoes = {
        method: "POST",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

const atualizarMeta = (id, params = {}) => {
    const url = `${URL_BASE_API}/metas/${id}`;
    const opcoes = {
        method: "PUT",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

const excluirMeta = (id) => {
    const url = `${URL_BASE_API}/metas/${id}`;
    const opcoes = {
        method: "DELETE",
        headers: obterCabecalhosAuth()
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(() => {});
};

export { pesquisarMetas, criarMeta, atualizarMeta, excluirMeta };
