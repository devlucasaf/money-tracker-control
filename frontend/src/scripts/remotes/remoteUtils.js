const URL_BASE_API = '/api';

const obterToken = () => localStorage.getItem('token');

const obterCabecalhosAuth = () => {
    const token = obterToken();
    const cabecalhos = { 'Content-Type': 'application/json' };
    if (token !== null && token !== undefined) {
        cabecalhos['Authorization'] = `Bearer ${token}`;
    }
    return cabecalhos;
};

const validarResposta = (resposta) => {
    if (resposta.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        window.location.hash = '#/login';
        throw Error('Sessão expirada. Faça login novamente.');
    }

    if (resposta.status === 403) {
        throw Error('Acesso não autorizado');
    }

    if (resposta.status === 404) {
        throw Error('Recurso não encontrado');
    }

    if (resposta.status === 400 || resposta.status === 422) {
        return resposta.json()
            .catch(() => { throw Error('Erro ao processar requisição'); })
            .then(err => { throw Error(err.message ?? 'Erro de validação'); });
    }
    
    if (resposta.status >= 500) {
        throw Error('Erro interno do servidor');
    }
    return resposta;
};

export { URL_BASE_API, obterCabecalhosAuth, validarResposta };
