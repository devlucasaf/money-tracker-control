import { iniciarLogin }                                                 from "./pages/loginPage.js";
import { iniciarRegistro }                                              from "./pages/registerPage.js";
import { iniciarDashboard }                                             from "./pages/homePage.js";
import { iniciarTransacoes }                                            from "./pages/transacoesPage.js";
import { iniciarContas }                                                from "./pages/contasPage.js";
import { iniciarCategorias }                                            from "./pages/categoriasPage.js";
import { iniciarMetas }                                                 from "./pages/metasPage.js";
import { iniciarOrcamentos }                                            from "./pages/orcamentosPage.js";
import { iniciarInvestimentos }                                         from "./pages/investimentosPage.js";
import { iniciarPlano }                                                 from "./pages/planoPage.js";
import { iniciarContasPagar }                                           from "./pages/contasPagarPage.js";
import { alternarTema, atualizarBotaoTema, exibirSucesso, exibirErro }  from "./util.js";
import { aprimorarSelects }                                             from "./customSelect.js";
import { atualizarPerfil }                                              from "./remotes/usuario/usuarioRemote.js";
import { inicializarNotificacoes }                                      from "./notificacoes.js";
import { inicializarBuscaGlobal }                                       from "./buscaGlobal.js";
import { rotaAtual, caminhoDaRota, irPara, aoMudarRota }                from "./router.js";

const templates = {};

// --- CARREGAMENTO DE TEMPLATE ---
const carregarTemplate = (nome) => {
    if (templates[nome] !== undefined) {
        return Promise.resolve(templates[nome]);
    }

    return fetch(`/src/templates/${nome}.html`)
        .then(r => r.text())
        .then(html => {
            templates[nome] = html;
            return html;
        });
};

// --- VERIFICAÇÃO DE AUTENTICAÇÃO ---
const estaAutenticado = () => {
    const token = localStorage.getItem("token");
    return token !== null && token !== undefined && token !== "";
};

// --- MAPA DE ROTAS ---
const rotas = {
    "/login": {
        template: "login",
        init: iniciarLogin,
        auth: false
    },
    "/register": {
        template: "register",
        init: iniciarRegistro,
        auth: false
    },
    "/home": {
        template: "home",
        init: iniciarDashboard,
        auth: true
    },
    "/licenca": {
        template: "licenca",
        init: () => {},
        auth: true
    },
    "/transacoes": {
        template: "transacoes",
        init: iniciarTransacoes,
        auth: true
    },
    "/contas": {
        template: "contas",
        init: iniciarContas,
        auth: true
    },
    "/categorias": {
        template: "categorias",
        init: iniciarCategorias,
        auth: true
    },
    "/metas": {
        template: "metas",
        init: iniciarMetas,
        auth: true
    },
    "/orcamentos": {
        template: "orcamentos",
        init: iniciarOrcamentos,
        auth: true
    },
    "/investimentos": {
        template: "investimentos",
        init: iniciarInvestimentos,
        auth: true
    },
    "/plano": {
        template: "plano",
        init: iniciarPlano,
        auth: true
    },
    "/contas-pagar": {
        template: "contasPagar",
        init: iniciarContasPagar,
        auth: true
    },
};

// --- ROTAS ANTIGAS QUE REDIRECIONAM PARA A NOVA ---
const aliases = {
    "/dashboard": "/home",
};

// --- NAVEGAÇÃO ENTRE ROTAS ---
const navegar = () => {
    const atual = rotaAtual();
    const hash = aliases[atual] ?? (atual || "/login");

    // --- NORMALIZA A URL ---
    if (window.location.pathname !== caminhoDaRota(hash)) {
        irPara(hash, { substituir: true });
        return;
    }

    const rota = rotas[hash];

    // --- ROTA INEXISTENTE ---
    if (rota === undefined) {
        irPara("/transacoes", { substituir: true });
        return;
    }

    // --- ROTA PROTEGIDA SEM AUTENTICAÇÃO ---
    if (rota.auth && !estaAutenticado()) {
        irPara("/login", { substituir: true });
        return;
    }

    // --- ROTA PÚBLICA COM USUÁRIO JÁ AUTENTICADO ---
    if (!rota.auth && estaAutenticado() && (hash === "/login" || hash === "/register")) {
        irPara("/transacoes", { substituir: true });
        return;
    }

    const app = document.getElementById("app");

    // --- ROTAS AUTENTICADAS ---
    if (rota.auth) {
        carregarTemplate("layout").then(layoutHtml => {
            app.innerHTML = layoutHtml;

            const nomeUsuario = localStorage.getItem("userName") ?? "Usuário";
            const emailUsuario = localStorage.getItem("userEmail") ?? "";
            const moedaUsuario = localStorage.getItem("userCurrency") ?? "BRL";

            document.getElementById("sidebar-user-name").textContent = nomeUsuario;
            document.getElementById("user-menu-email").textContent = emailUsuario;

            // --- USER MENU DROPDOWN ---
            const btnUserMenu = document.getElementById("btn-user-menu");
            const userDropdown = document.getElementById("user-menu-dropdown");

            btnUserMenu.addEventListener("click", (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle("open");
            });

            document.addEventListener("click", (e) => {
                if (!e.target.closest(".user-menu")) {
                    userDropdown.classList.remove("open");
                }
            });

            // --- MEU PERFIL ---
            document.getElementById("btn-meu-perfil").addEventListener("click", () => {
                userDropdown.classList.remove("open");
                document.getElementById("perfil-nome").textContent = localStorage.getItem("userName") ?? "";
                document.getElementById("perfil-email").textContent = localStorage.getItem("userEmail") ?? "";
                document.getElementById("perfil-moeda").textContent = localStorage.getItem("userCurrency") ?? "BRL";
                document.getElementById("modal-perfil").classList.remove("hidden");
            });

            document.getElementById("btn-fechar-perfil").addEventListener("click", () => {
                document.getElementById("modal-perfil").classList.add("hidden");
            });

            document.getElementById("modal-perfil").addEventListener("click", (e) => {
                if (e.target.classList.contains("modal-overlay")) {
                    document.getElementById("modal-perfil").classList.add("hidden");
                }
            });

            // --- ALTERAR DADOS ---
            document.getElementById("btn-alterar-dados").addEventListener("click", () => {
                userDropdown.classList.remove("open");
                document.getElementById("alterar-nome").value = localStorage.getItem("userName") ?? "";
                document.getElementById("alterar-email").value = localStorage.getItem("userEmail") ?? "";
                const selMoeda = document.getElementById("alterar-moeda");
                selMoeda.value = localStorage.getItem("userCurrency") ?? "BRL";
                selMoeda.dispatchEvent(new Event("change"));
                document.getElementById("alterar-senha").value = "";
                document.getElementById("modal-alterar-dados").classList.remove("hidden");
            });

            document.getElementById("btn-fechar-alterar").addEventListener("click", () => {
                document.getElementById("modal-alterar-dados").classList.add("hidden");
            });

            document.getElementById("btn-cancelar-alterar").addEventListener("click", () => {
                document.getElementById("modal-alterar-dados").classList.add("hidden");
            });

            document.getElementById("modal-alterar-dados").addEventListener("click", (e) => {
                if (e.target.classList.contains("modal-overlay")) {
                    document.getElementById("modal-alterar-dados").classList.add("hidden");
                }
            });

            document.getElementById("form-alterar-dados").addEventListener("submit", (e) => {
                e.preventDefault();
                const nome = document.getElementById("alterar-nome").value;
                const email = document.getElementById("alterar-email").value;
                const moeda = document.getElementById("alterar-moeda").value;
                const senha = document.getElementById("alterar-senha").value;

                const payload = {
                    nome,
                    email,
                    moeda
                };

                if (senha && senha.trim() !== "") {
                    payload.senha = senha;
                }

                // --- PERSISTE NO BACKEND E ATUALIZA O ARMAZENAMENTO LOCAL ---
                atualizarPerfil(payload)
                    .then((perfil) => {
                        localStorage.setItem("userName", perfil.nome);
                        localStorage.setItem("userEmail", perfil.email);
                        localStorage.setItem("userCurrency", perfil.moeda);

                        document.getElementById("sidebar-user-name").textContent = perfil.nome;
                        document.getElementById("user-menu-email").textContent = perfil.email;

                        document.getElementById("modal-alterar-dados").classList.add("hidden");
                        exibirSucesso("Dados atualizados com sucesso!");
                    })
                    .catch(exibirErro);
            });

            // --- LOGOUT ---
            document.getElementById("btn-logout").addEventListener("click", () => {
                localStorage.removeItem("token");
                localStorage.removeItem("userName");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userCurrency");
                irPara("/login");
            });

            document.getElementById("btn-theme-toggle").addEventListener("click", alternarTema);
            atualizarBotaoTema();

            inicializarNotificacoes();

            inicializarBuscaGlobal();

            // --- DESTAQUE DO ITEM DE MENU ATIVO ---
            document.querySelectorAll(".nav-link").forEach(item => {
                const navHash = item.getAttribute("data-navigate");
                if (navHash === `#${hash}`) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }
            });

            // --- CARREGAMENTO DA PÁGINA E INICIALIZAÇÃO ---
            carregarTemplate(rota.template).then(paginaHtml => {
                document.getElementById("page-content").innerHTML = paginaHtml;
                rota.init();
                aprimorarSelects();
            });
        });
    } else {
        carregarTemplate(rota.template).then(html => {
            app.innerHTML = html;
            rota.init();
            aprimorarSelects();
        });
    }
};

// --- INTERCEPTAÇÃO DE CLIQUES EM LINKS DE NAVEGAÇÃO ---
document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-navigate]");
    if (nav !== null) {
        e.preventDefault();
        irPara(nav.getAttribute("data-navigate"));
    }
});

// --- EVENTOS DE INICIALIZAÇÃO ---
aoMudarRota(navegar);
navegar();
