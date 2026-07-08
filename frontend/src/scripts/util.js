const MAPA_MOEDAS = {
    BRL: { locale: 'pt-BR', moeda: 'BRL' },
    USD: { locale: 'en-US', moeda: 'USD' },
    EUR: { locale: 'de-DE', moeda: 'EUR' },
    GBP: { locale: 'en-GB', moeda: 'GBP' },
    ARS: { locale: 'es-AR', moeda: 'ARS' },
    JPY: { locale: 'ja-JP', moeda: 'JPY' },
    CAD: { locale: 'en-CA', moeda: 'CAD' },
};

const obterMoedaUsuario = () => localStorage.getItem('userCurrency') || 'BRL';

const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined) {
        return 'R$ 0,00';
    }
    const cfg = MAPA_MOEDAS[obterMoedaUsuario()] || MAPA_MOEDAS.BRL;
    return new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: cfg.moeda }).format(valor);
};

const formatarData = (dataString) => {
    if (dataString === null || dataString === undefined) {
        return '';
    }
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dataString));
};

const exibirNotificacao = (mensagem, tipo = 'info') => {
    const container = document.getElementById('toast-container');
    const notificacao = document.createElement('div');

    notificacao.className = `toast toast-${tipo}`;
    notificacao.textContent = mensagem;
    container.appendChild(notificacao);

    setTimeout(() => notificacao.remove(), 4000);
};

const exibirSucesso = (msg) => exibirNotificacao(msg, 'success');
const exibirErro = (err) => exibirNotificacao(err instanceof Error ? err.message : String(err), 'error');

// Gerenciamento de tema
const inicializarTema = () => {
    const salvo = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', salvo);
};

const alternarTema = () => {
    const atual = document.documentElement.getAttribute('data-theme');
    const proximo = atual === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', proximo);
    localStorage.setItem('theme', proximo);
    atualizarBotaoTema();
};

const atualizarBotaoTema = () => {
    const btn = document.getElementById('btn-theme-toggle');
    if (!btn) return;
    const escuro = document.documentElement.getAttribute('data-theme') === 'dark';

    btn.innerHTML = '';
    const icone = document.createElement('i');
    icone.className = escuro ? 'pi pi-sun' : 'pi pi-moon';
    const texto = document.createElement('span');
    texto.textContent = escuro ? 'Modo Claro' : 'Modo Escuro';
    btn.appendChild(icone);
    btn.appendChild(document.createTextNode(' '));
    btn.appendChild(texto);
};

// Inicializar tema ao carregar
inicializarTema();

export { formatarMoeda, formatarData, exibirNotificacao, exibirSucesso, exibirErro, obterMoedaUsuario, MAPA_MOEDAS, inicializarTema, alternarTema, atualizarBotaoTema };
