import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from '../remoteUtils.js';

const pesquisarContas = () => {
    const url = `${URL_BASE_API}/contas`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

const criarConta = (params = {}) => {
    const url = `${URL_BASE_API}/contas`;
    const opcoes = {
        method: 'POST',
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

const atualizarConta = (id, params = {}) => {
    const url = `${URL_BASE_API}/contas/${id}`;
    const opcoes = {
        method: 'PUT',
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

const excluirConta = (id) => {
    const url = `${URL_BASE_API}/contas/${id}`;
    const opcoes = {
        method: 'DELETE',
        headers: obterCabecalhosAuth()
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(() => {});
};

export { pesquisarContas, criarConta, atualizarConta, excluirConta };
