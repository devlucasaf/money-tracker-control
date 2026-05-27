import { URL_BASE_API, obterCabecalhosAuth, validarResposta } from '../remoteUtils.js';

const obterDashboard = () => {
    const url = `${URL_BASE_API}/dashboard`;
    return fetch(url, { headers: obterCabecalhosAuth() })
        .then(validarResposta)
        .then(resposta => resposta.json());
};

export { obterDashboard };
