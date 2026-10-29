// --- PREFIXO DAS URLS DA APLICAÇÃO ---
const BASE_URL = "/money-tracker-control/app";

// --- CONVERTE UMA ROTA NO CAMINHO COMPLETO ---
const caminhoDaRota = (rota) => `${BASE_URL}/${String(rota).replace(/^#?\/?/, "")}`;

// --- ROTA ATUAL OU QUANDO NÃO HÁ ROTA NA URL ---
const rotaAtual = () => {
    const caminho = window.location.pathname;

    if (caminho === BASE_URL || caminho.startsWith(`${BASE_URL}/`)) {
        const pagina = caminho.slice(BASE_URL.length).replace(/^\/+|\/+$/g, "");
        return pagina === "" ? "" : `/${pagina}`;
    }

    // --- COMPATIBILIDADE COM LINKS ANTIGOS NO FORMATO #/contas ---
    if (window.location.hash.startsWith("#/")) {
        return window.location.hash.slice(1);
    }

    return "";
};

// --- NAVEGA PARA UMA ROTA SEM RECARREGAR A PÁGINA ---
const irPara = (rota, { substituir = false } = {}) => {
    const destino = caminhoDaRota(rota);

    if (!substituir && destino === window.location.pathname && window.location.hash === "") {
        return;
    }

    if (substituir) {
        window.history.replaceState(null, "", destino);
    } else {
        window.history.pushState(null, "", destino);
    }
    window.dispatchEvent(new Event("rotaalterada"));
};

// --- REGISTRA O OUVINTE DE MUDANÇA DE ROTA ---
const aoMudarRota = (funcao) => {
    window.addEventListener("rotaalterada", funcao);
    window.addEventListener("popstate", funcao);
};

export { BASE_URL, caminhoDaRota, rotaAtual, irPara, aoMudarRota };
