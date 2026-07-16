import { formatarMoeda }              from "./util.js";
import { pesquisarContasPagar }       from "./remotes/contaspagar/contasPagarRemote.js";
import { pesquisarOrcamentos }        from "./remotes/orcamentos/orcamentosRemote.js";
import { pesquisarMetas }             from "./remotes/metas/metasRemote.js";

// --- QUANTOS DIAS ANTES DO VENCIMENTO JÁ GERAM ALERTA ---
const DIAS_ALERTA = 5;

// --- ORDEM DE EXIBIÇÃO POR NÍVEL ---
const ORDEM_NIVEL = { danger: 0, warning: 1, ok: 2 };

// --- DATA DE HOJE ZERADA (SEM HORAS) ---
const hojeZerado = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

// --- CONVERTE UMA DATA ISO (YYYY-MM-DD) EM DATE ZERADO ---
const dataVencimento = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    d.setHours(0, 0, 0, 0);
    return d;
};

// --- INICIALIZAÇÃO: LIGA O SININHO E CARREGA AS NOTIFICAÇÕES ---
const inicializarNotificacoes = () => {
    const btn = document.getElementById("btn-notif");
    const dropdown = document.getElementById("notif-dropdown");
    if (!btn || !dropdown) {
        return;
    }

    // --- ABRE/FECHA O PAINEL ---
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("open");
    });

    // --- FECHA AO CLICAR FORA ---
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".notif-menu")) {
            dropdown.classList.remove("open");
        }
    });

    carregar();
};

// --- BUSCA AS FONTES E MONTA A LISTA (TOLERANTE A FALHAS) ---
const carregar = () => {
    Promise.allSettled([
        pesquisarContasPagar(),
        pesquisarOrcamentos(),
        pesquisarMetas(),
    ]).then(([contas, orcamentos, metas]) => {
        const itens = [];

        if (contas.status === "fulfilled") {
            itens.push(...montarContasPagar(contas.value));
        }
        if (orcamentos.status === "fulfilled") {
            itens.push(...montarOrcamentos(orcamentos.value));
        }
        if (metas.status === "fulfilled") {
            itens.push(...montarMetas(metas.value));
        }

        renderizar(itens);
    });
};

// --- NOTIFICAÇÕES DE CONTAS A PAGAR/RECEBER ---
const montarContasPagar = (lista) => {
    const hoje = hojeZerado();
    const itens = [];

    (lista || []).forEach((c) => {
        if (c.pago) {
            return;
        }

        const venc = dataVencimento(c.dataVencimento);
        const dias = Math.round((venc - hoje) / 86400000);
        const rotulo = c.tipo === "PAGAR" ? "Conta a pagar" : "A receber";

        if (dias < 0) {
            itens.push({
                nivel: "danger",
                icone: "pi-exclamation-triangle",
                urgente: true,
                titulo: `${c.descricao} — vencida`,
                detalhe: `${rotulo} de ${formatarMoeda(c.valor)} venceu há ${Math.abs(dias)} dia(s)`,
                rota: "#/contas-pagar",
            });
        } else if (dias === 0) {
            itens.push({
                nivel: "warning",
                icone: "pi-clock",
                urgente: true,
                titulo: `${c.descricao} — vence hoje`,
                detalhe: `${rotulo} de ${formatarMoeda(c.valor)}`,
                rota: "#/contas-pagar",
            });
        } else if (dias <= DIAS_ALERTA) {
            itens.push({
                nivel: "warning",
                icone: "pi-clock",
                urgente: true,
                titulo: `${c.descricao} — vence em ${dias} dia(s)`,
                detalhe: `${rotulo} de ${formatarMoeda(c.valor)}`,
                rota: "#/contas-pagar",
            });
        }
    });

    return itens;
};

// --- NOTIFICAÇÕES DE ORÇAMENTOS ESTOURADOS / NO LIMITE ---
const montarOrcamentos = (lista) => {
    const itens = [];

    (lista || []).forEach((o) => {
        // --- USA O LIMITE EFETIVO (COM ROLLOVER) QUANDO DISPONÍVEL ---
        const limite = o.rollover && o.limiteEfetivo != null ? o.limiteEfetivo : o.valorLimite;
        if (!limite || limite <= 0) {
            return;
        }

        const gasto = o.valorGasto ?? 0;
        const pct = (gasto / limite) * 100;
        const nome = o.categoriaNome ?? "Categoria";

        if (pct >= 100) {
            itens.push({
                nivel: "danger",
                icone: "pi-chart-pie",
                urgente: true,
                titulo: `Orçamento estourado — ${nome}`,
                detalhe: `${pct.toFixed(0)}% de ${formatarMoeda(limite)} utilizados`,
                rota: "#/orcamentos",
            });
        } else if (pct >= 90) {
            itens.push({
                nivel: "warning",
                icone: "pi-chart-pie",
                urgente: true,
                titulo: `Orçamento quase no limite — ${nome}`,
                detalhe: `${pct.toFixed(0)}% de ${formatarMoeda(limite)} utilizados`,
                rota: "#/orcamentos",
            });
        }
    });

    return itens;
};

// --- NOTIFICAÇÕES DE METAS ATINGIDAS (POSITIVAS) ---
const montarMetas = (lista) => {
    const itens = [];

    (lista || []).forEach((m) => {
        if (m.valorAlvo > 0 && m.valorAtual >= m.valorAlvo) {
            itens.push({
                nivel: "ok",
                icone: "pi-check-circle",
                urgente: false,
                titulo: `Meta atingida — ${m.descricao}`,
                detalhe: `Você alcançou ${formatarMoeda(m.valorAlvo)}! 🎉`,
                rota: "#/metas",
            });
        }
    });

    return itens;
};

// --- RENDERIZA O BADGE E A LISTA DO PAINEL ---
const renderizar = (itens) => {
    const lista = document.getElementById("notif-list");
    const badge = document.getElementById("notif-badge");
    if (!lista || !badge) {
        return;
    }

    lista.innerHTML = "";

    // --- ORDENA POR SEVERIDADE ---
    itens.sort((a, b) => ORDEM_NIVEL[a.nivel] - ORDEM_NIVEL[b.nivel]);

    // --- BADGE CONTA APENAS ITENS QUE PEDEM ATENÇÃO ---
    const urgentes = itens.filter((i) => i.urgente).length;
    if (urgentes > 0) {
        badge.textContent = urgentes > 9 ? "9+" : String(urgentes);
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }

    // --- ESTADO VAZIO ---
    if (itens.length === 0) {
        const vazio = document.createElement("div");
        vazio.className = "notif-empty";
        const icone = document.createElement("i");
        icone.className = "pi pi-check-circle";
        const texto = document.createElement("span");
        texto.textContent = "Tudo em dia! Nenhuma notificação.";
        vazio.appendChild(icone);
        vazio.appendChild(texto);
        lista.appendChild(vazio);
        return;
    }

    // --- ITENS ---
    itens.forEach((item) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = `notif-item notif-${item.nivel}`;

        const icone = document.createElement("i");
        icone.className = `pi ${item.icone}`;

        const conteudo = document.createElement("div");
        conteudo.className = "notif-item-texto";

        const titulo = document.createElement("span");
        titulo.className = "notif-item-titulo";
        titulo.textContent = item.titulo;

        const detalhe = document.createElement("span");
        detalhe.className = "notif-item-detalhe";
        detalhe.textContent = item.detalhe;

        conteudo.appendChild(titulo);
        conteudo.appendChild(detalhe);
        el.appendChild(icone);
        el.appendChild(conteudo);

        el.addEventListener("click", () => {
            document.getElementById("notif-dropdown").classList.remove("open");
            window.location.hash = item.rota;
        });

        lista.appendChild(el);
    });
};

export { inicializarNotificacoes };

