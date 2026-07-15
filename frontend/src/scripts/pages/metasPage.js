import { formatarMoeda, formatarData, exibirSucesso, exibirErro, confirmar } from "../util.js";
import {
    pesquisarMetas, criarMeta, atualizarMeta, excluirMeta,
    pesquisarMovimentacoes, registrarMovimentacao, excluirMovimentacao
} from "../remotes/metas/metasRemote.js";
import { pesquisarContas } from "../remotes/contas/contasRemote.js";
import { criarDatepicker } from "../datepicker.js";

let dpMes, dpAno, dpDataSelecionada;
let dpMovimentacao;
let contasCache = [];
let historicoMetaId = null;

const iniciarMetas = () => {
    carregar();
    carregarContas();
    document.getElementById("btn-nova-meta").addEventListener("click", () => abrirModal(null));
    document.getElementById("modal-meta-close").addEventListener("click", fecharModal);
    document.getElementById("modal-meta-cancel").addEventListener("click", fecharModal);
    document.getElementById("form-meta").addEventListener("submit", salvar);
    inicializarCalendario();

    // --- MODAL DE MOVIMENTAÇÃO ---
    document.getElementById("modal-movimentacao-close").addEventListener("click", fecharModalMovimentacao);
    document.getElementById("modal-movimentacao-cancel").addEventListener("click", fecharModalMovimentacao);
    document.getElementById("form-movimentacao").addEventListener("submit", salvarMovimentacao);
    dpMovimentacao = criarDatepicker({ placeholder: "Selecione a data" });
    document.getElementById("movimentacao-data-container").appendChild(dpMovimentacao.element);

    // --- MODAL DE HISTÓRICO ---
    document.getElementById("modal-historico-close").addEventListener("click", () => {
        document.getElementById("modal-historico").classList.add("hidden");
    });
};

// --- CARREGA AS CONTAS PARA OS SELECTS ---
const carregarContas = () => {
    pesquisarContas()
        .then(contas => {
            contasCache = contas;
            preencherSelectContas("meta-contaVinculada", "Nenhuma");
            preencherSelectContas("movimentacao-conta", "Nenhuma (apenas registro)");
        })
        .catch(exibirErro);
};

// --- PREENCHE UM SELECT COM AS CONTAS ---
const preencherSelectContas = (id, textoPadrao) => {
    const select = document.getElementById(id);
    if (!select) {
        return;
    }
    select.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = textoPadrao;
    select.appendChild(opt);
    contasCache.forEach(c => {
        const o = document.createElement("option");
        o.value = c.id;
        o.textContent = c.nome;
        select.appendChild(o);
    });
};

// ---- CALENDARIO ----
const inicializarCalendario = () => {
    const hoje = new Date();
    dpMes = hoje.getMonth();
    dpAno = hoje.getFullYear();
    dpDataSelecionada = null;

    const exibicao = document.getElementById("meta-dataLimite-display");
    const dropdown = document.getElementById("meta-datepicker-dropdown");

    exibicao.addEventListener("click", () => {
        dropdown.classList.toggle("open");
        dropdown.classList.remove("showing-years");
        renderizarCalendario();
    });

    document.getElementById("meta-dp-prev").addEventListener("click", () => {
        dpMes--;
        if (dpMes < 0) {
            dpMes = 11;
            dpAno--;
        }
        renderizarCalendario();
    });

    document.getElementById("meta-dp-next").addEventListener("click", () => {
        dpMes++;
        if (dpMes > 11) {
            dpMes = 0;
            dpAno++;
        }
        renderizarCalendario();
    });

    document.getElementById("meta-dp-title").addEventListener("click", () => {
        const aberto = dropdown.classList.toggle("showing-years");
        if (aberto) {
            renderizarAnos();
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest("#meta-datepicker-wrapper")) {
            dropdown.classList.remove("open");
            dropdown.classList.remove("showing-years");
        }
    });
};

const renderizarAnos = () => {
    const container = document.getElementById("meta-dp-years");
    container.innerHTML = "";

    const anoAtual = new Date().getFullYear();
    const inicio = anoAtual - 100;
    const fim = anoAtual + 20;

    for (let ano = fim; ano >= inicio; ano--) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "datepicker-year-item";
        el.textContent = ano;

        if (ano === anoAtual) {
            el.classList.add("today");
        }

        if (ano === dpAno) {
            el.classList.add("selected");
        }

        el.addEventListener("click", () => {
            dpAno = ano;
            document.getElementById("meta-datepicker-dropdown").classList.remove("showing-years");
            renderizarCalendario();
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

const renderizarCalendario = () => {
    const meses = [
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
    document.getElementById("meta-dp-month-year").textContent = `${meses[dpMes]} ${dpAno}`;

    const containerDias = document.getElementById("meta-dp-days");
    containerDias.innerHTML = "";

    const primeiroDia = new Date(dpAno, dpMes, 1).getDay();
    const diasNoMes = new Date(dpAno, dpMes + 1, 0).getDate();
    const hoje = new Date();

    for (let i = 0; i < primeiroDia; i++) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "datepicker-day other-month";
        containerDias.appendChild(el);
    }

    for (let d = 1; d <= diasNoMes; d++) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "datepicker-day";
        el.textContent = d;

        const ehHoje = d === hoje.getDate() && dpMes === hoje.getMonth() && dpAno === hoje.getFullYear();
        if (ehHoje) {
            el.classList.add("today");
        }

        if (dpDataSelecionada && d === dpDataSelecionada.getDate() && dpMes === dpDataSelecionada.getMonth() && dpAno === dpDataSelecionada.getFullYear()) {
            el.classList.add("selected");
        }

        el.addEventListener("click", () => selecionarData(d));
        containerDias.appendChild(el);
    }
};

const selecionarData = (dia) => {
    dpDataSelecionada = new Date(dpAno, dpMes, dia);
    const iso = `${dpAno}-${String(dpMes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    document.getElementById("meta-dataLimite").value = iso;
    document.getElementById("meta-dataLimite-display").value = new Intl.DateTimeFormat("pt-BR").format(dpDataSelecionada);
    document.getElementById("meta-datepicker-dropdown").classList.remove("open");
};

// --- DEFINE A DATA NO CALENDARIO A PARTIR DE UMA STRING ISO ---
const definirDataLimite = (iso) => {
    if (!iso) {
        dpDataSelecionada = null;
        document.getElementById("meta-dataLimite").value = "";
        document.getElementById("meta-dataLimite-display").value = "";
        const hoje = new Date();
        dpMes = hoje.getMonth();
        dpAno = hoje.getFullYear();
        return;
    }

    const [ano, mes, dia] = iso.split("-").map(Number);
    dpDataSelecionada = new Date(ano, mes - 1, dia);
    dpMes = mes - 1;
    dpAno = ano;
    document.getElementById("meta-dataLimite").value = iso;
    document.getElementById("meta-dataLimite-display").value = new Intl.DateTimeFormat("pt-BR").format(dpDataSelecionada);
};

const carregar = () => {
    pesquisarMetas()
        .then(renderizarTabela)
        .catch(exibirErro);
};

const renderizarTabela = (metas) => {
    const container = document.getElementById("metas-body");

    if (metas === null || metas === undefined || metas.length === 0) {
        const tplVazio = document.getElementById("tpl-metas-vazio");
        container.innerHTML = "";
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    const tplTabela = document.getElementById("tpl-metas-tabela");
    const tplLinha = document.getElementById("tpl-metas-linha");

    container.innerHTML = "";
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector("#metas-tbody");
    metas.forEach(m => {
        const percentual = m.valorAlvo > 0 ? Math.min((m.valorAtual / m.valorAlvo) * 100, 100) : 0;
        const cor = percentual >= 100 ? "var(--success)" : "var(--primary)";

        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector("tr");

        tr.querySelector("[data-campo='descricao']").textContent = m.descricao;

        const fill = tr.querySelector("[data-campo='fill']");
        fill.style.width = `${percentual}%`;
        fill.style.background = cor;

        const progressoTexto = tr.querySelector("[data-campo='progresso-texto']");
        progressoTexto.style.color = "var(--text-secondary)";
        progressoTexto.textContent = `${formatarMoeda(m.valorAtual)} / ${formatarMoeda(m.valorAlvo)} (${percentual.toFixed(0)}%)`;

        tr.querySelector("[data-campo='valorAlvo']").textContent = formatarMoeda(m.valorAlvo);
        tr.querySelector("[data-campo='dataLimite']").textContent = m.dataLimite ? formatarData(m.dataLimite) : "-";

        const tdAcoes = tr.querySelector("[data-campo='acoes']");

        // --- APORTAR / RESGATAR ---
        const btnAportar = document.createElement("button");
        btnAportar.className = "btn btn-success btn-aportar-meta";
        btnAportar.style.marginRight = "0.5rem";
        btnAportar.dataset.id = m.id;
        btnAportar.dataset.conta = m.contaVinculadaId ?? "";
        btnAportar.title = "Aportar / Resgatar";
        btnAportar.innerHTML = '<i class="pi pi-plus-circle"></i>';
        tdAcoes.appendChild(btnAportar);

        // --- VER EVOLUÇÃO ---
        const btnHistorico = document.createElement("button");
        btnHistorico.className = "btn btn-outline btn-historico-meta";
        btnHistorico.style.marginRight = "0.5rem";
        btnHistorico.dataset.id = m.id;
        btnHistorico.dataset.titulo = m.descricao;
        btnHistorico.title = "Ver evolução";
        btnHistorico.innerHTML = '<i class="pi pi-chart-line"></i>';
        tdAcoes.appendChild(btnHistorico);

        const btnEditar = document.createElement("button");

        btnEditar.className = "btn btn-outline btn-editar-meta";
        btnEditar.style.marginRight = "0.5rem";
        btnEditar.dataset.id = m.id;
        btnEditar.dataset.descricao = m.descricao;
        btnEditar.dataset.valoralvo = m.valorAlvo;
        btnEditar.dataset.valoratual = m.valorAtual;
        btnEditar.dataset.datalimite = m.dataLimite ?? "";
        btnEditar.dataset.contavinculada = m.contaVinculadaId ?? "";

        const iconeEditar = document.createElement("i");
        iconeEditar.className = "pi pi-pencil";
        btnEditar.appendChild(iconeEditar);
        tdAcoes.appendChild(btnEditar);

        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-danger btn-excluir-meta";
        btnExcluir.dataset.id = m.id;
        const iconeExcluir = document.createElement("i");
        iconeExcluir.className = "pi pi-trash";
        btnExcluir.appendChild(iconeExcluir);
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });

    container.querySelectorAll(".btn-editar-meta").forEach(btn => {
        btn.addEventListener("click", () => {
            abrirModal({
                id: btn.dataset.id,
                descricao: btn.dataset.descricao,
                valorAlvo: btn.dataset.valoralvo,
                valorAtual: btn.dataset.valoratual,
                dataLimite: btn.dataset.datalimite,
                contaVinculadaId: btn.dataset.contavinculada,
            });
        });
    });

    container.querySelectorAll(".btn-aportar-meta").forEach(btn => {
        btn.addEventListener("click", () => abrirModalMovimentacao(btn.dataset.id, btn.dataset.conta));
    });

    container.querySelectorAll(".btn-historico-meta").forEach(btn => {
        btn.addEventListener("click", () => abrirHistorico(btn.dataset.id, btn.dataset.titulo));
    });

    container.querySelectorAll(".btn-excluir-meta").forEach(btn => {
        btn.addEventListener("click", () => excluir(btn.dataset.id));
    });
};

const abrirModal = (meta) => {
    const formulario = document.getElementById("form-meta");
    formulario.reset();
    const selConta = document.getElementById("meta-contaVinculada");
    if (meta !== null) {
        document.getElementById("modal-meta-title").textContent = "Editar Meta";
        document.getElementById("meta-id").value = meta.id;
        document.getElementById("meta-descricao").value = meta.descricao;
        document.getElementById("meta-valorAlvo").value = meta.valorAlvo;
        document.getElementById("meta-valorAtual").value = meta.valorAtual;
        definirDataLimite(meta.dataLimite);
        selConta.value = meta.contaVinculadaId ?? "";
    } else {
        document.getElementById("modal-meta-title").textContent = "Nova Meta";
        document.getElementById("meta-id").value = "";
        definirDataLimite(null);
        selConta.value = "";
    }
    selConta.dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("modal-meta").classList.remove("hidden");
};

const fecharModal = () => {
    document.getElementById("modal-meta").classList.add("hidden");
};

const salvar = (e) => {
    e.preventDefault();
    const id = document.getElementById("meta-id").value;
    const descricao = document.getElementById("meta-descricao").value;
    const contaVinc = document.getElementById("meta-contaVinculada").value;
    const payload = {
        titulo: descricao,
        descricao: descricao,
        valorAlvo: parseFloat(document.getElementById("meta-valorAlvo").value),
        valorAtual: parseFloat(document.getElementById("meta-valorAtual").value) || 0,
        dataLimite: document.getElementById("meta-dataLimite").value || null,
        contaVinculadaId: contaVinc ? parseInt(contaVinc) : null,
    };

    const promessa = id !== "" ? atualizarMeta(id, payload) : criarMeta(payload);

    promessa
        .then(() => {
            exibirSucesso(id !== "" ? "Meta atualizada" : "Meta criada");
            fecharModal();
            carregar();
        })
        .catch(exibirErro);
};

const excluir = (id) => {
    confirmar({
        titulo: "Excluir meta",
        mensagem: "Deseja realmente excluir esta meta? Esta ação não pode ser desfeita.",
    }).then((confirmado) => {
        if (!confirmado) {
            return;
        }
        excluirMeta(id)
            .then(() => { exibirSucesso("Meta excluída"); carregar(); })
            .catch(exibirErro);
    });
};

// --- ABERTURA DO MODAL DE MOVIMENTAÇÃO ---
const abrirModalMovimentacao = (metaId, contaVinculadaId) => {
    document.getElementById("form-movimentacao").reset();
    document.getElementById("movimentacao-metaId").value = metaId;
    dpMovimentacao.limpar();

    const selConta = document.getElementById("movimentacao-conta");
    selConta.value = contaVinculadaId || "";
    selConta.dispatchEvent(new Event("change", { bubbles: true }));

    const selTipo = document.getElementById("movimentacao-tipo");
    selTipo.value = "APORTE";
    selTipo.dispatchEvent(new Event("change", { bubbles: true }));

    document.getElementById("modal-movimentacao").classList.remove("hidden");
};

// --- FECHAMENTO DO MODAL DE MOVIMENTAÇÃO ---
const fecharModalMovimentacao = () => {
    document.getElementById("modal-movimentacao").classList.add("hidden");
};

// --- SALVAR APORTE / RESGATE ---
const salvarMovimentacao = (e) => {
    e.preventDefault();

    const metaId = document.getElementById("movimentacao-metaId").value;
    const data = dpMovimentacao.getValor();
    if (!data) {
        exibirErro("Selecione a data da movimentação");
        return;
    }

    const contaVal = document.getElementById("movimentacao-conta").value;
    const payload = {
        tipo: document.getElementById("movimentacao-tipo").value,
        valor: parseFloat(document.getElementById("movimentacao-valor").value),
        data: data,
        contaId: contaVal ? parseInt(contaVal) : null,
    };

    registrarMovimentacao(metaId, payload)
        .then(() => {
            exibirSucesso("Movimentação registrada");
            fecharModalMovimentacao();
            carregar();
        })
        .catch(exibirErro);
};

// --- ABERTURA DO HISTÓRICO / GRÁFICO DE EVOLUÇÃO ---
const abrirHistorico = (metaId, titulo) => {
    historicoMetaId = metaId;
    document.getElementById("modal-historico-title").textContent = `Evolução — ${titulo}`;
    document.getElementById("modal-historico").classList.remove("hidden");
    pesquisarMovimentacoes(metaId)
        .then(renderizarHistorico)
        .catch(exibirErro);
};

// --- RENDERIZA O GRÁFICO E A LISTA DE MOVIMENTAÇÕES ---
const renderizarHistorico = (movs) => {
    renderizarGraficoHistorico(movs);

    const container = document.getElementById("historico-body");
    if (!movs || movs.length === 0) {
        const tpl = document.getElementById("tpl-historico-vazio");
        container.innerHTML = "";
        container.appendChild(tpl.content.cloneNode(true));
        return;
    }

    const tplTabela = document.getElementById("tpl-historico-tabela");
    const tplLinha = document.getElementById("tpl-historico-linha");
    container.innerHTML = "";
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector("#historico-tbody");
    // --- EXIBE DO MAIS RECENTE PARA O MAIS ANTIGO ---
    [...movs].reverse().forEach(mv => {
        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector("tr");

        tr.querySelector("[data-campo='data']").textContent = formatarData(mv.data);

        const tdTipo = tr.querySelector("[data-campo='tipo']");
        const badge = document.createElement("span");
        badge.className = `badge ${mv.tipo === "APORTE" ? "badge-success" : "badge-danger"}`;
        badge.textContent = mv.tipo === "APORTE" ? "Aporte" : "Resgate";
        tdTipo.appendChild(badge);

        const tdValor = tr.querySelector("[data-campo='valor']");
        tdValor.style.fontWeight = "600";
        tdValor.style.color = mv.tipo === "APORTE" ? "var(--color-green)" : "var(--color-red)";
        tdValor.textContent = `${mv.tipo === "APORTE" ? "+" : "-"} ${formatarMoeda(mv.valor)}`;

        tr.querySelector("[data-campo='conta']").textContent = mv.contaNome ?? "-";

        const tdAcoes = tr.querySelector("[data-campo='acoes']");
        const btnDel = document.createElement("button");
        btnDel.className = "btn btn-danger";
        btnDel.innerHTML = '<i class="pi pi-trash"></i>';
        btnDel.addEventListener("click", () => excluirMov(mv.id));
        tdAcoes.appendChild(btnDel);

        tbody.appendChild(tr);
    });
};

// --- GRÁFICO DE LINHA DA EVOLUÇÃO DO VALOR GUARDADO ---
const renderizarGraficoHistorico = (movs) => {
    const container = document.getElementById("historico-grafico");
    if (!container) {
        return;
    }

    if (!movs || movs.length === 0) {
        container.innerHTML = "";
        return;
    }

    const valores = movs.map(m => Number(m.acumulado));
    const largura = 640, altura = 200;
    const padTopo = 16, padBase = 20, padLat = 12;
    const areaAltura = altura - padTopo - padBase;
    const maximo = Math.max(...valores, 0);
    const minimo = Math.min(...valores, 0);
    const amplitude = (maximo - minimo) || 1;
    const passoX = (largura - padLat * 2) / (valores.length - 1 || 1);

    const cx = (i) => padLat + passoX * i;
    const cy = (v) => padTopo + areaAltura - ((v - minimo) / amplitude) * areaAltura;

    let svg = `<svg viewBox="0 0 ${largura} ${altura}" class="chart-svg-linha" preserveAspectRatio="none">`;

    if (minimo < 0 && maximo > 0) {
        const yZero = cy(0);
        svg += `<line x1="${padLat}" y1="${yZero}" x2="${largura - padLat}" y2="${yZero}" class="chart-base-line" stroke-dasharray="4 4" />`;
    }

    const pts = valores.map((v, i) => `${cx(i)},${cy(v)}`).join(" ");
    const baseY = padTopo + areaAltura;
    svg += `<polygon points="${cx(0)},${baseY} ${pts} ${cx(valores.length - 1)},${baseY}" class="chart-linha-area" />`;
    svg += `<polyline points="${pts}" class="chart-linha-traco" />`;

    valores.forEach((v, i) => {
        svg += `<circle cx="${cx(i)}" cy="${cy(v)}" r="3.5" class="chart-linha-ponto">`
            + `<title>${formatarData(movs[i].data)}: ${formatarMoeda(v)}</title></circle>`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
};

// --- EXCLUSÃO DE MOVIMENTAÇÃO ---
const excluirMov = (id) => {
    confirmar({
        titulo: "Excluir movimentação",
        mensagem: "Deseja excluir esta movimentação? O valor será revertido na meta e na conta.",
    }).then((confirmado) => {
        if (!confirmado) {
            return;
        }
        excluirMovimentacao(historicoMetaId, id)
            .then(() => {
                exibirSucesso("Movimentação excluída");
                pesquisarMovimentacoes(historicoMetaId).then(renderizarHistorico).catch(exibirErro);
                carregar();
            })
            .catch(exibirErro);
    });
};

export { iniciarMetas };
