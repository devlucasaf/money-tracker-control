import { initLogin } from './pages/loginPage.js';
import { initRegister } from './pages/registerPage.js';
import { initDashboard } from './pages/dashboardPage.js';
import { initTransacoes } from './pages/transacoesPage.js';
import { initContas } from './pages/contasPage.js';
import { initCategorias } from './pages/categoriasPage.js';
import { initMetas } from './pages/metasPage.js';
import { initOrcamentos } from './pages/orcamentosPage.js';

const templates = {};

const loadTemplate = (name) => {
    if (templates[name] !== undefined) {
        return Promise.resolve(templates[name]);
    }

    return fetch(`/src/templates/${name}.html`)
        .then(r => r.text())
        .then(html => {
            templates[name] = html;
            return html;
        });
};

const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token !== null && token !== undefined && token !== '';
};

const routes = {
    '/login':       { template: 'login',        init: initLogin,        auth: false },
    '/register':    { template: 'register',     init: initRegister,     auth: false },
    '/dashboard':   { template: 'dashboard',    init: initDashboard,    auth: true  },
    '/transacoes':  { template: 'transacoes',   init: initTransacoes,   auth: true  },
    '/contas':      { template: 'contas',       init: initContas,       auth: true  },
    '/categorias':  { template: 'categorias',   init: initCategorias,   auth: true  },
    '/metas':       { template: 'metas',        init: initMetas,        auth: true  },
    '/orcamentos':  { template: 'orcamentos',   init: initOrcamentos,   auth: true  },
};

const navigate = () => {
    const hash = window.location.hash.slice(1) || '/login';
    const route = routes[hash];

    if (route === undefined) {
        window.location.hash = '#/dashboard';
        return;
    }

    if (route.auth && !isAuthenticated()) {
        window.location.hash = '#/login';
        return;
    }

    if (!route.auth && isAuthenticated() && (hash === '/login' || hash === '/register')) {
        window.location.hash = '#/dashboard';
        return;
    }

    const app = document.getElementById('app');

    if (route.auth) {
        loadTemplate('layout').then(layoutHtml => {
            app.innerHTML = layoutHtml;

            const userName = localStorage.getItem('userName') ?? 'Usuário';
            document.getElementById('sidebar-user-name').textContent = userName;

            document.getElementById('btn-logout').addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
                window.location.hash = '#/login';
            });

            document.querySelectorAll('.nav-item').forEach(item => {
                const navHash = item.getAttribute('data-navigate');
                if (navHash === `#${hash}`) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            loadTemplate(route.template).then(pageHtml => {
                document.getElementById('page-content').innerHTML = pageHtml;
                route.init();
            });
        });
    } else {
        loadTemplate(route.template).then(html => {
            app.innerHTML = html;
            route.init();
        });
    }
};

document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-navigate]');
    if (nav !== null) {
        e.preventDefault();
        window.location.hash = nav.getAttribute('data-navigate');
    }
});

window.addEventListener('hashchange', navigate);
navigate();
