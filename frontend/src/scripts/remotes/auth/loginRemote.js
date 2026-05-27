import { URL_BASE_API, validarResposta } from '../remoteUtils.js';

const logar = (params = {}) => {
    const url = `${URL_BASE_API}/auth/login`;
    const opcoes = {
        method: 'POST',
        body: JSON.stringify(params),
        headers: { 'Content-Type': 'application/json' },
    };
    return fetch(url, opcoes)
        .then(validarResposta)
        .then(resposta => resposta.json());
};

export { logar };
