import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from "../remoteUtils.js";

// --- PESQUISAR ORCAMENTOS DO USUÁRIO AUTENTICADO ---
const pesquisarOrcamentos = () => {
    const url = `${URL_BASE_API}/orcamentos`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- CRIA UM NOVO ORCAMENTO E ENVIA PARA O BACKEND ---
const criarOrcamento = (params = {}) => {
    const url = `${URL_BASE_API}/orcamentos`;
    const opcoes = {
        method: "POST",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- EXCLUIR ORCAMENTO PELO ID ---
const excluirOrcamento = (id) => {
    const url = `${URL_BASE_API}/orcamentos/${id}`;
    const opcoes = {
        method: "DELETE",
        headers: obterCabecalhosAuth()
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(() => {});
};

export { pesquisarOrcamentos, criarOrcamento, excluirOrcamento };
