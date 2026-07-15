import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from "../remoteUtils.js";

const obterDashboard = ({ mes, ano } = {}) => {
    const params = new URLSearchParams();
    if (mes) {
        params.set("mes", mes);
    }

    if (ano) {
        params.set("ano", ano);
    }
    const query = params.toString() ? `?${params}` : "";
    const url = `${URL_BASE_API}/dashboard${query}`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

export { obterDashboard };
