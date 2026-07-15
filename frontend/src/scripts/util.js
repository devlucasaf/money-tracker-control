const MAPA_MOEDAS = {
    BRL: { locale: "pt-BR", moeda: "BRL" },
    USD: { locale: "en-US", moeda: "USD" },
    EUR: { locale: "de-DE", moeda: "EUR" },
    GBP: { locale: "en-GB", moeda: "GBP" },
    ARS: { locale: "es-AR", moeda: "ARS" },
    JPY: { locale: "ja-JP", moeda: "JPY" },
    CAD: { locale: "en-CA", moeda: "CAD" },
};

const obterMoedaUsuario = () => localStorage.getItem("userCurrency") || "BRL";

// --- FORMATAR MOEDA ---
const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined) {
        return "R$ 0,00";
    }
    const cfg = MAPA_MOEDAS[obterMoedaUsuario()] || MAPA_MOEDAS.BRL;
    return new Intl.NumberFormat(cfg.locale, { style: "currency", currency: cfg.moeda }).format(valor);
};

// --- FORMATAR DATA ---
const formatarData = (dataString) => {
    if (dataString === null || dataString === undefined) {
        return "";
    }
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dataString));
};

// --- EXIBIR NOTIFICACAO ---
const exibirNotificacao = (mensagem, tipo = "info") => {
    const container = document.getElementById("toast-container");
    const notificacao = document.createElement("div");

    notificacao.className = `toast toast-${tipo}`;
    notificacao.textContent = mensagem;
    container.appendChild(notificacao);

    setTimeout(() => notificacao.remove(), 4000);
};

const exibirSucesso = (msg) => exibirNotificacao(msg, "success");
const exibirErro = (err) => exibirNotificacao(err instanceof Error ? err.message : String(err), "error");

// --- INICIALIZAR TEMA ---
const inicializarTema = () => {
    const salvo = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", salvo);
};

// --- ALTERNAR TEMA ---
const alternarTema = () => {
    const atual = document.documentElement.getAttribute("data-theme");
    const proximo = atual === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", proximo);
    localStorage.setItem("theme", proximo);
    atualizarBotaoTema();
};

// --- ATUALIZAR BOTAO DO TEMA ---
const atualizarBotaoTema = () => {
    const btn = document.getElementById("btn-theme-toggle");
    if (!btn) {
        return;
    }
    const escuro = document.documentElement.getAttribute("data-theme") === "dark";

    btn.innerHTML = "";
    const icone = document.createElement("i");
    icone.className = escuro ? "pi pi-sun" : "pi pi-moon";
    btn.appendChild(icone);
};

// --- TOGGLE DE VISIBILIDADE DE SENHA ---
const configurarToggleSenha = () => {
    document.querySelectorAll(".password-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
            const campo = document.getElementById(btn.dataset.target);
            if (!campo) {
                return;
            }
            const icone = btn.querySelector("i");
            const visivel = campo.type === "text";

            campo.type = visivel ? "password" : "text";
            icone.className = visivel ? "pi pi-eye" : "pi pi-eye-slash";
            btn.setAttribute("aria-label", visivel ? "Mostrar senha" : "Ocultar senha");
        });
    });
};

// --- MODAL DE CONFIRMAÇÃO PERSONALIZADO ---
const confirmar = (opcoes = {}) => {
    const {
        titulo = "Confirmar ação",
        mensagem = "Tem certeza que deseja continuar?",
        textoConfirmar = "Excluir",
        textoCancelar = "Cancelar",
    } = typeof opcoes === "string" ? { mensagem: opcoes } : opcoes;

    return new Promise((resolve) => {
        const overlay = document.getElementById("modal-confirmacao");
        if (!overlay) {
            resolve(window.confirm(mensagem));
            return;
        }

        const elTitulo = document.getElementById("confirmacao-titulo");
        const elMensagem = document.getElementById("confirmacao-mensagem");
        const btnConfirmar = document.getElementById("confirmacao-confirmar");
        const btnCancelar = document.getElementById("confirmacao-cancelar");

        // --- PREENCHE OS TEXTOS ---
        elTitulo.textContent = titulo;
        elMensagem.textContent = mensagem;
        btnConfirmar.textContent = textoConfirmar;
        btnCancelar.textContent = textoCancelar;

        // --- EXIBE O MODAL ---
        overlay.classList.remove("hidden");

        // --- FUNÇÃO DE FECHAMENTO E LIMPEZA DOS EVENTOS ---
        const fechar = (resultado) => {
            overlay.classList.add("hidden");
            btnConfirmar.removeEventListener("click", aoConfirmar);
            btnCancelar.removeEventListener("click", aoCancelar);
            overlay.removeEventListener("click", aoClicarFora);
            document.removeEventListener("keydown", aoTeclar);
            resolve(resultado);
        };

        const aoConfirmar = () => fechar(true);
        const aoCancelar = () => fechar(false);
        const aoClicarFora = (e) => {
            if (e.target === overlay) {
                fechar(false);
            }
        };
        const aoTeclar = (e) => {
            if (e.key === "Escape") {
                fechar(false);
            } else if (e.key === "Enter") {
                fechar(true);
            }
        };

        // --- REGISTRA OS EVENTOS ---
        btnConfirmar.addEventListener("click", aoConfirmar);
        btnCancelar.addEventListener("click", aoCancelar);
        overlay.addEventListener("click", aoClicarFora);
        document.addEventListener("keydown", aoTeclar);

        // --- FOCO NO BOTÃO DE CONFIRMAR ---
        btnConfirmar.focus();
    });
};

inicializarTema();

export { formatarMoeda, formatarData, exibirNotificacao, exibirSucesso, exibirErro, obterMoedaUsuario, MAPA_MOEDAS, inicializarTema, alternarTema, atualizarBotaoTema, configurarToggleSenha, confirmar };
