import { formatarMoeda, exibirSucesso, exibirErro, confirmar } from "../util.js";
import { pesquisarOrcamentos, criarOrcamento, excluirOrcamento } from "../remotes/orcamentos/orcamentosRemote.js";
import { pesquisarCategorias } from "../remotes/categorias/categoriasRemote.js";

// --- MESES ---
const MESES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

// --- MESES ABREVIADOS ---
const MESES_ABREV = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez"
];

// --- ESTADO DO SELETOR DE MÊS/ANO ---
let mpAno, mpMesSelecionado, mpAnoSelecionado;

// --- INICIALIZAÇÃO DA PÁGINA ---
const iniciarOrcamentos = () => {
    carregar();
    carregarCategorias();

    document.getElementById("btn-novo-orcamento").addEventListener("click", abrirModal);
    document.getElementById("modal-orcamento-close").addEventListener("click", fecharModal);
    document.getElementById("modal-orcamento-cancel").addEventListener("click", fecharModal);
    document.getElementById("form-orcamento").addEventListener("submit", salvar);

    inicializarSeletorMes();
};

// --- SELETOR DE MÊS/ANO ---
const inicializarSeletorMes = () => {
    const hoje = new Date();
    mpAno = hoje.getFullYear();
    mpMesSelecionado = null;
    mpAnoSelecionado = null;

    const exibicao = document.getElementById("orcamento-mesAno-display");
    const dropdown = document.getElementById("orcamento-datepicker-dropdown");

    // --- ABRIR/FECHAR O SELETOR ---
    exibicao.addEventListener("click", () => {
        dropdown.classList.toggle("open");
        dropdown.classList.remove("showing-years");
        renderizarMeses();
    });

    // --- ANO ANTERIOR ---
    document.getElementById("orc-dp-prev").addEventListener("click", () => {
        mpAno--;
        renderizarMeses();
    });

    // --- PRÓXIMO ANO ---
    document.getElementById("orc-dp-next").addEventListener("click", () => {
        mpAno++;
        renderizarMeses();
    });

    // --- ALTERNA PARA A VISUALIZAÇÃO DE ANOS ---
    document.getElementById("orc-dp-title").addEventListener("click", () => {
        const aberto = dropdown.classList.toggle("showing-years");
        if (aberto) {
            renderizarAnos();
        }
    });

    // --- FECHAR O SELETOR AO CLICAR FORA ---
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#orcamento-datepicker-wrapper")) {
            dropdown.classList.remove("open");
            dropdown.classList.remove("showing-years");
        }
    });
};

// --- RENDERIZAÇÃO DA LISTA DE ANOS ---
const renderizarAnos = () => {
    const container = document.getElementById("orc-dp-years");
    container.innerHTML = "";

    const anoAtual = new Date().getFullYear();
    const inicio = anoAtual - 100;
    const fim = anoAtual + 20;

    // --- GERAÇÃO DOS BOTÕES DE ANO ---
    for (let ano = fim; ano >= inicio; ano--) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "datepicker-year-item";
        el.textContent = ano;

        if (ano === anoAtual) {
            el.classList.add("today");
        }

        if (ano === mpAno) {
            el.classList.add("selected");
        }

        el.addEventListener("click", () => {
            mpAno = ano;
            document.getElementById("orcamento-datepicker-dropdown").classList.remove("showing-years");
            renderizarMeses();
        });
        container.appendChild(el);
    }

    const selecionado = container.querySelector(".selected");
    if (selecionado) {
        selecionado.scrollIntoView({
            block: "center"
        });
    }
};

// --- RENDERIZAÇÃO DA GRADE DE MESES ---
const renderizarMeses = () => {
    document.getElementById("orc-dp-year").textContent = mpAno;

    const container = document.getElementById("orc-dp-months");
    container.innerHTML = "";

    const hoje = new Date();

    for (let m = 0; m < 12; m++) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "datepicker-month";
        el.textContent = MESES_ABREV[m];

        const ehAtual = m === hoje.getMonth() && mpAno === hoje.getFullYear();
        if (ehAtual) {
            el.classList.add("today");
        }

        if (mpMesSelecionado === m && mpAnoSelecionado === mpAno) {
            el.classList.add("selected");
        }

        el.addEventListener("click", () => selecionarMes(m));
        container.appendChild(el);
    }
};

// --- SELEÇÃO DE UM MÊS ---
const selecionarMes = (mes) => {
    mpMesSelecionado = mes;
    mpAnoSelecionado = mpAno;

    const valor = `${mpAno}-${String(mes + 1).padStart(2, "0")}`;
    document.getElementById("orcamento-mesAno").value = valor;
    document.getElementById("orcamento-mesAno-display").value = `${MESES[mes]} ${mpAno}`;
    document.getElementById("orcamento-datepicker-dropdown").classList.remove("open");
};

// --- CARREGAMENTO DE CATEGORIAS ---
const carregarCategorias = () => {
    pesquisarCategorias()
        .then(categorias => {
            const select = document.getElementById("orcamento-categoria");
            select.innerHTML = "";
            const optPadrao = document.createElement("option");
            optPadrao.value = "";
            optPadrao.textContent = "Selecione...";
            select.appendChild(optPadrao);
            categorias.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.id;
               opt.textContent = c.nome;
                select.appendChild(opt);
            });
        })
        .catch(exibirErro);
};

// --- CARREGAMENTO DOS ORÇAMENTOS ---
const carregar = () => {
    pesquisarOrcamentos()
        .then(renderizarTabela)
        .catch(exibirErro);
};

// --- RENDERIZAÇÃO DA TABELA DE ORÇAMENTOS ---
const renderizarTabela = (orcamentos) => {
    const container = document.getElementById("orcamentos-body");

    renderizarAlertas(orcamentos);

    if (orcamentos === null || orcamentos === undefined || orcamentos.length === 0) {
        const tplVazio = document.getElementById("tpl-orcamentos-vazio");
        container.innerHTML = "";
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    // --- MONTAGEM DA TABELA A PARTIR DOS TEMPLATES ---
    const tplTabela = document.getElementById("tpl-orcamentos-tabela");
    const tplLinha = document.getElementById("tpl-orcamentos-linha");

    container.innerHTML = "";
    container.appendChild(tplTabela.content.cloneNode(true));

    // --- PREENCHIMENTO DAS LINHAS ---
    const tbody = container.querySelector("#orcamentos-tbody");
    orcamentos.forEach(o => {
        const gasto = o.valorGasto ?? 0;
        const disponivel = o.valorLimite - gasto;
        const percentual = o.valorLimite > 0 ? Math.min((gasto / o.valorLimite) * 100, 100) : 0;
        const cor = percentual >= 90 ? "var(--danger)" : percentual >= 70 ? "var(--warning)" : "var(--success)";

        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector("tr");

        tr.querySelector("[data-campo='categoria']").textContent = o.categoriaNome ?? "-";
        tr.querySelector("[data-campo='limite']").textContent = formatarMoeda(o.valorLimite);

        // --- BARRA DE PROGRESSO ---
        const fill = tr.querySelector("[data-campo='fill']");
        fill.style.width = `${percentual}%`;
        fill.style.background = cor;

        tr.querySelector("[data-campo='gasto-texto']").textContent = `${formatarMoeda(gasto)} (${percentual.toFixed(0)}%)`;

        // --- VALOR DISPONÍVEL ---
        const tdDisponivel = tr.querySelector("[data-campo='disponivel']");
        tdDisponivel.style.fontWeight = "600";
        tdDisponivel.style.color = disponivel >= 0 ? "var(--success)" : "var(--danger)";
        tdDisponivel.textContent = formatarMoeda(disponivel);

        // --- MÊS/ANO FORMATADO ---
        const mesAnoTexto = (o.mes && o.ano)
            ? `${String(o.mes).padStart(2, "0")}/${o.ano}`
            : "-";
        tr.querySelector("[data-campo='mesAno']").textContent = mesAnoTexto;

        // --- BOTÃO DE EXCLUIR ---
        const tdAcoes = tr.querySelector("[data-campo='acoes']");
        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-danger btn-excluir-orcamento";
        btnExcluir.dataset.id = o.id;
        const icone = document.createElement("i");
        icone.className = "pi pi-trash";
        btnExcluir.appendChild(icone);
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });

    // --- VÍNCULO DOS BOTÕES DE EXCLUSÃO ---
    container.querySelectorAll(".btn-excluir-orcamento").forEach(btn => {
        btn.addEventListener("click", () => excluir(btn.dataset.id));
    });
};

// --- RENDERIZAÇÃO DOS ALERTAS DE ORÇAMENTO ---
const renderizarAlertas = (orcamentos) => {
    const container = document.getElementById("orcamentos-alertas");
    if (!container) {
        return;
    }
    container.innerHTML = "";

    if (!orcamentos || orcamentos.length === 0) {
        return;
    }

    // --- CLASSIFICA CADA ORÇAMENTO PELO PERCENTUAL GASTO ---
    const estourados = [];
    const emAlerta = [];

    orcamentos.forEach(o => {
        if (!o.valorLimite || o.valorLimite <= 0) {
            return;
        }
        const gasto = o.valorGasto ?? 0;
        const percentual = (gasto / o.valorLimite) * 100;

        if (percentual >= 100) {
            estourados.push({ o, percentual });
        } else if (percentual >= 70) {
            emAlerta.push({ o, percentual });
        }
    });

    // --- MONTA UM ALERTA VISUAL ---
    const montarAlerta = (item, nivel) => {
        const div = document.createElement("div");
        div.className = `alerta alerta-${nivel}`;

        const icone = document.createElement("i");
        icone.className = nivel === "danger" ? "pi pi-exclamation-triangle" : "pi pi-exclamation-circle";

        const texto = document.createElement("span");
        const nome = item.o.categoriaNome ?? "Categoria";
        const pct = item.percentual.toFixed(0);
        texto.textContent = nivel === "danger"
            ? `${nome}: orçamento estourado (${pct}% de ${formatarMoeda(item.o.valorLimite)})`
            : `${nome}: ${pct}% do orçamento utilizado (${formatarMoeda(item.o.valorLimite)})`;

        div.appendChild(icone);
        div.appendChild(texto);
        return div;
    };

    estourados.forEach(item => container.appendChild(montarAlerta(item, "danger")));
    emAlerta.forEach(item => container.appendChild(montarAlerta(item, "warning")));
};

// --- ABERTURA DO MODAL ---
const abrirModal = () => {
    document.getElementById("form-orcamento").reset();
    document.getElementById("orcamento-mesAno").value = "";
    document.getElementById("orcamento-mesAno-display").value = "";

    // --- RESET DO SELETOR DE MÊS/ANO ---
    mpAno = new Date().getFullYear();
    mpMesSelecionado = null;
    mpAnoSelecionado = null;
    document.getElementById("modal-orcamento").classList.remove("hidden");
};

// --- FECHAMENTO DO MODAL ---
const fecharModal = () => {
    document.getElementById("modal-orcamento").classList.add("hidden");
};

// --- SALVAR ORÇAMENTO ---
const salvar = (e) => {
    e.preventDefault();

    const mesAno = document.getElementById("orcamento-mesAno").value;
    if (!mesAno) {
        exibirErro("Selecione o mês/ano do orçamento");
        return;
    }
    const [ano, mes] = mesAno.split("-").map(Number);

    // --- MONTAGEM DO PAYLOAD ---
    const payload = {
        categoriaId: parseInt(document.getElementById("orcamento-categoria").value),
        valorLimite: parseFloat(document.getElementById("orcamento-valorLimite").value),
        mes: mes,
        ano: ano,
    };

    // --- ENVIO AO BACKEND ---
    criarOrcamento(payload)
        .then(() => {
            exibirSucesso("Orçamento criado");
            fecharModal();
            carregar();
        })
        .catch(exibirErro);
};

// --- EXCLUSÃO DE ORÇAMENTO ---
const excluir = (id) => {
    confirmar({
        titulo: "Excluir orçamento",
        mensagem: "Deseja realmente excluir este orçamento? Esta ação não pode ser desfeita.",
    }).then((confirmado) => {
        if (!confirmado) {
            return;
        }
        excluirOrcamento(id)
            .then(() => { exibirSucesso("Orçamento excluído"); carregar(); })
            .catch(exibirErro);
    });
};

// --- EXPORTAÇÃO ---
export { iniciarOrcamentos };
