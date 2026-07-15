import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from "../remoteUtils.js";

// --- LISTAR COMPROMISSOS ---
const pesquisarContasPagar = () => {
    const url = `${URL_BASE_API}/contas-pagar`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- CRIAR ---
const criarContaPagar = (params = {}) => {
    const url = `${URL_BASE_API}/contas-pagar`;
    const opcoes = {
        method: "POST",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- ATUALIZAR ---
const atualizarContaPagar = (id, params = {}) => {
    const url = `${URL_BASE_API}/contas-pagar/${id}`;
    const opcoes = {
        method: "PUT",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- MARCAR COMO PAGO/RECEBIDO ---
const marcarPago = (id) => {
    const url = `${URL_BASE_API}/contas-pagar/${id}/pagar`;
    return fetch(url, { method: "POST", headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- DESMARCAR ---
const desmarcarPago = (id) => {
    const url = `${URL_BASE_API}/contas-pagar/${id}/desmarcar`;
    return fetch(url, { method: "POST", headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- EXCLUIR ---
const excluirContaPagar = (id) => {
    const url = `${URL_BASE_API}/contas-pagar/${id}`;
    return fetch(url, { method: "DELETE", headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(() => {});
};

export {
    pesquisarContasPagar,
    criarContaPagar,
    atualizarContaPagar,
    marcarPago,
    desmarcarPago,
    excluirContaPagar
};

