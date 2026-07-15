import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from "../remoteUtils.js";

const pesquisarTransacoes = (params = {}) => {
    const urlParams = new URLSearchParams();
    if (params.page !== null && params.page !== undefined) {
        urlParams.set("page", params.page);
    }

    if (params.size !== null && params.size !== undefined) {
        urlParams.set("size", params.size);
    }

    // --- FILTROS OPCIONAIS ---
    if (params.busca) {
        urlParams.set("busca", params.busca);
    }

    if (params.categoriaId) {
        urlParams.set("categoriaId", params.categoriaId);
    }

    if (params.contaId) {
        urlParams.set("contaId", params.contaId);
    }

    if (params.tipo) {
        urlParams.set("tipo", params.tipo);
    }

    if (params.dataInicio) {
        urlParams.set("dataInicio", params.dataInicio);
    }

    if (params.dataFim) {
        urlParams.set("dataFim", params.dataFim);
    }

    if (params.tag) {
        urlParams.set("tag", params.tag);
    }

    const url = `${URL_BASE_API}/transacoes?${urlParams}`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

const criarTransacao = (params = {}) => {
    const url = `${URL_BASE_API}/transacoes`;
    const opcoes = {
        method:  "POST",
        body:    JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

const excluirTransacao = (id) => {
    const url = `${URL_BASE_API}/transacoes/${id}`;
    const opcoes = {
        method: "DELETE",
        headers: obterCabecalhosAuth()
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(() => {});
};

export { pesquisarTransacoes, criarTransacao, excluirTransacao };
