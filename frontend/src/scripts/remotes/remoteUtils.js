const API_BASE_URL = '/api';

const getToken = () => localStorage.getItem('token');

const getAuthHeaders = () => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token !== null && token !== undefined) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const validateResponse = (response) => {
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        window.location.hash = '#/login';
        throw Error('Sessão expirada. Faça login novamente.');
    }

    if (response.status === 403) {
        throw Error('Acesso não autorizado');
    }

    if (response.status === 404) {
        throw Error('Recurso não encontrado');
    }

    if (response.status === 400 || response.status === 422) {
        return response.json()
            .catch(() => { throw Error('Erro ao processar requisição'); })
            .then(err => { throw Error(err.message ?? 'Erro de validação'); });
    }
    
    if (response.status >= 500) {
        throw Error('Erro interno do servidor');
    }
    return response;
};

export { API_BASE_URL, getAuthHeaders, validateResponse };
