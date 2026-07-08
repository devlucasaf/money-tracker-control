import { iniciarLogin }                     from "./pages/loginPage.js";
import { iniciarRegistro }                  from "./pages/registerPage.js";
import { iniciarTransacoes }                from "./pages/transacoesPage.js";
import { iniciarContas }                    from "./pages/contasPage.js";
import { iniciarCategorias }                from "./pages/categoriasPage.js";
import { iniciarMetas }                     from "./pages/metasPage.js";
import { iniciarOrcamentos }                from "./pages/orcamentosPage.js";
import { alternarTema, atualizarBotaoTema } from "./util.js";

// --- CACHE DE TEMPLATES ---
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
    "/login":       { template: "login",        init: iniciarLogin,        auth: false },
    "/register":    { template: "register",     init: iniciarRegistro,     auth: false },
    "/transacoes":  { template: "transacoes",   init: iniciarTransacoes,   auth: true  },
    "/contas":      { template: "contas",       init: iniciarContas,       auth: true  },
    "/categorias":  { template: "categorias",   init: iniciarCategorias,   auth: true  },
    "/metas":       { template: "metas",        init: iniciarMetas,        auth: true  },
    "/orcamentos":  { template: "orcamentos",   init: iniciarOrcamentos,   auth: true  },
};

// --- NAVEGAÇÃO ENTRE ROTAS ---
const navegar = () => {
    const hash = window.location.hash.slice(1) || "/login";
    const rota = rotas[hash];

    // --- ROTA INEXISTENTE ---
    if (rota === undefined) {
        window.location.hash = "#/transacoes";
        return;
    }

    // --- ROTA PROTEGIDA SEM AUTENTICAÇÃO ---
    if (rota.auth && !estaAutenticado()) {
        window.location.hash = "#/login";
        return;
    }

    // --- ROTA PÚBLICA COM USUÁRIO JÁ AUTENTICADO ---
    if (!rota.auth && estaAutenticado() && (hash === "/login" || hash === "/register")) {
        window.location.hash = "#/transacoes";
        return;
    }

    const app = document.getElementById("app");

    // --- ROTAS AUTENTICADAS ---
    if (rota.auth) {
        carregarTemplate("layout").then(layoutHtml => {
            app.innerHTML = layoutHtml;

            const nomeUsuario = localStorage.getItem("userName") ?? "Usuário";
            document.getElementById("sidebar-user-name").textContent = nomeUsuario;

            // --- LOGOUT ---
            document.getElementById("btn-logout").addEventListener("click", () => {
                localStorage.removeItem("token");
                localStorage.removeItem("userName");
                window.location.hash = "#/login";
            });

            document.getElementById("btn-theme-toggle").addEventListener("click", alternarTema);
            atualizarBotaoTema();

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
            });
        });
    } else {
        carregarTemplate(rota.template).then(html => {
            app.innerHTML = html;
            rota.init();
        });
    }
};

// --- INTERCEPTAÇÃO DE CLIQUES EM LINKS DE NAVEGAÇÃO ---
document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-navigate]");
    if (nav !== null) {
        e.preventDefault();
        window.location.hash = nav.getAttribute("data-navigate");
    }
});

// --- EVENTOS DE INICIALIZAÇÃO ---
window.addEventListener("hashchange", navegar);
navegar();