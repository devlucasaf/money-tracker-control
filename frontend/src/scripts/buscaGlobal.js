import { formatarMoeda }              from "./util.js";
import { pesquisarTransacoes }        from "./remotes/transacoes/transacoesRemote.js";
import { pesquisarContas }            from "./remotes/contas/contasRemote.js";
import { pesquisarMetas }             from "./remotes/metas/metasRemote.js";
import { pesquisarCategorias }        from "./remotes/categorias/categoriasRemote.js";

let cacheContas = [];
let cacheMetas = [];
let cacheCategorias = [];

let temporizador;

// --- NORMALIZA TEXTO PARA COMPARAÇÃO ---
const normalizar = (texto) => (texto ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// --- INICIALIZAÇÃO DA BUSCA GLOBAL ---
const inicializarBuscaGlobal = () => {
    const btn = document.getElementById("btn-busca");
    const dropdown = document.getElementById("busca-dropdown");
    const input = document.getElementById("busca-input");
    if (!btn || !dropdown || !input) {
        return;
    }

    // --- PRÉ-CARREGA AS LISTAS PEQUENAS ---
    pesquisarContas().then(l => { cacheContas = l || []; }).catch(() => {});
    pesquisarMetas().then(l => { cacheMetas = l || []; }).catch(() => {});
    pesquisarCategorias().then(l => { cacheCategorias = l || []; }).catch(() => {});

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const aberto = dropdown.classList.toggle("open");
        if (aberto) {
            input.focus();
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".busca-menu")) {
            dropdown.classList.remove("open");
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            dropdown.classList.remove("open");
            btn.focus();
        }
    });

    input.addEventListener("input", () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => executarBusca(input.value.trim()), 300);
    });
};

// --- EXECUTA A BUSCA NAS QUATRO FONTES ---
const executarBusca = (termo) => {
    const resultados = document.getElementById("busca-resultados");
    if (!resultados) {
        return;
    }

    if (termo.length < 2) {
        resultados.innerHTML = "";
        const dica = document.createElement("div");
        dica.className = "busca-dica";
        dica.textContent = "Digite ao menos 2 caracteres para buscar.";
        resultados.appendChild(dica);
        return;
    }

    const alvo = normalizar(termo);

    const contas = cacheContas
        .filter(c => normalizar(c.nome).includes(alvo))
        .slice(0, 5);

    const metas = cacheMetas
        .filter(m => normalizar(m.descricao).includes(alvo))
        .slice(0, 5);

    const categorias = cacheCategorias
        .filter(c => normalizar(c.nome).includes(alvo))
        .slice(0, 5);

    pesquisarTransacoes({ busca: termo, page: 0, size: 5 })
        .then(pagina => (pagina && pagina.content) ? pagina.content : [])
        .catch(() => [])
        .then(transacoes => {
            renderizar(resultados, { transacoes, contas, metas, categorias });
        });
};

// --- RENDERIZA OS GRUPOS DE RESULTADOS ---
const renderizar = (container, grupos) => {
    container.innerHTML = "";

    const total = grupos.transacoes.length + grupos.contas.length
        + grupos.metas.length + grupos.categorias.length;

    if (total === 0) {
        const vazio = document.createElement("div");
        vazio.className = "busca-dica";
        vazio.textContent = "Nenhum resultado encontrado.";
        container.appendChild(vazio);
        return;
    }

    adicionarGrupo(container, "Transações", grupos.transacoes, (t) => ({
        titulo: t.descricao,
        detalhe: `${t.tipo === "RECEITA" ? "+" : "-"} ${formatarMoeda(t.valor)}`,
        icone: "pi-arrow-right-arrow-left",
        rota: "#/transacoes",
    }));

    adicionarGrupo(container, "Contas", grupos.contas, (c) => ({
        titulo: c.nome,
        detalhe: formatarMoeda(c.saldo),
        icone: "pi-wallet",
        rota: "#/contas",
    }));

    adicionarGrupo(container, "Metas", grupos.metas, (m) => ({
        titulo: m.descricao,
        detalhe: `${formatarMoeda(m.valorAtual)} / ${formatarMoeda(m.valorAlvo)}`,
        icone: "pi-flag",
        rota: "#/metas",
    }));

    adicionarGrupo(container, "Categorias", grupos.categorias, (c) => ({
        titulo: c.nome,
        detalhe: c.tipo === "RECEITA" ? "Receita" : "Despesa",
        icone: "pi-tag",
        rota: "#/categorias",
    }));
};

// --- MONTA UM GRUPO DE RESULTADOS ---
const adicionarGrupo = (container, titulo, itens, mapear) => {
    if (!itens || itens.length === 0) {
        return;
    }

    const cabecalho = document.createElement("div");
    cabecalho.className = "busca-grupo-titulo";
    cabecalho.textContent = titulo;
    container.appendChild(cabecalho);

    itens.forEach(item => {
        const dados = mapear(item);

        const el = document.createElement("button");
        el.type = "button";
        el.className = "busca-item";

        const icone = document.createElement("i");
        icone.className = `pi ${dados.icone}`;

        const texto = document.createElement("div");
        texto.className = "busca-item-texto";

        const t = document.createElement("span");
        t.className = "busca-item-titulo";
        t.textContent = dados.titulo;

        const d = document.createElement("span");
        d.className = "busca-item-detalhe";
        d.textContent = dados.detalhe;

        texto.appendChild(t);
        texto.appendChild(d);
        el.appendChild(icone);
        el.appendChild(texto);

        el.addEventListener("click", () => {
            document.getElementById("busca-dropdown").classList.remove("open");
            window.location.hash = dados.rota;
        });

        container.appendChild(el);
    });
};

export { inicializarBuscaGlobal };

