import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from "../remoteUtils.js";

// --- ATUALIZAR OS DADOS PESSOAIS DO USUÁRIO AUTENTICADO ---
const atualizarPerfil = (params = {}) => {
    const url = `${URL_BASE_API}/usuarios/me`;
    const opcoes = {
        method: "PUT",
        body: JSON.stringify(params),
        headers: obterCabecalhosAuth(),
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

export { atualizarPerfil };

