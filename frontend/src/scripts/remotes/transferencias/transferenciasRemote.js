import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from "../remoteUtils.js";

// --- PESQUISAR TRANSFERÊNCIAS DO USUÁRIO ---
const pesquisarTransferencias = () => {
    const url = `${URL_BASE_API}/transferencias`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- CRIAR TRANSFERÊNCIA ---
const criarTransferencia = (params = {}) => {
    const url = `${URL_BASE_API}/transferencias`;
    const opcoes = {
        method: "POST",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- EXCLUIR TRANSFERÊNCIA ---
const excluirTransferencia = (id) => {
    const url = `${URL_BASE_API}/transferencias/${id}`;
    const opcoes = {
        method: "DELETE",
        headers: obterCabecalhosAuth()
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(() => {});
};

export { pesquisarTransferencias, criarTransferencia, excluirTransferencia };

