import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from "../remoteUtils.js";

// --- OBTER O PLANO DE GASTOS DO USUÁRIO ---
const obterPlano = () => {
    const url = `${URL_BASE_API}/plano-gastos`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

// --- SALVAR O PLANO DE GASTOS ---
const salvarPlano = (params = {}) => {
    const url = `${URL_BASE_API}/plano-gastos`;
    const opcoes = {
        method: "PUT",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

export { obterPlano, salvarPlano };

