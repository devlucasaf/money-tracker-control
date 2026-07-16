
import { formatarMoeda, formatarData, exibirSucesso, exibirErro, confirmar } from "../util.js";
import { pesquisarInvestimentos, criarInvestimento, atualizarInvestimento, excluirInvestimento } from "../remotes/investimentos/investimentosRemote.js";

// --- RÓTULOS ---
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

const ROTULO_TIPO = {
    CDB: "CDB",
    CDI: "CDI",
    TESOURO: "Tesouro Direto",
    POUPANCA: "Poupança",
    LCI_LCA: "LCI/LCA",
    ACOES: "Ações",
    FUNDOS: "Fundos",
    CRIPTO: "Cripto",
    OURO: "Ouro",
    BET: "Aposta",
    OUTRO: "Outro"
};

const ROTULO_STATUS = {
    ATIVO: "Ativo",
    RESGATADO: "Resgatado",
    PERDIDO: "Perdido"
};

const CLASSE_STATUS = {
    ATIVO: "badge-info",
    RESGATADO: "badge-success",
    PERDIDO: "badge-danger"
};

let dpAplicacao, dpVencimento;

// --- INICIALIZAÇÃO DA PÁGINA ---
const iniciarInvestimentos = () => {
    carregar();

    document.getElementById("btn-novo-investimento").addEventListener("click", () => abrirModal(null));
    document.getElementById("modal-investimento-close").addEventListener("click", fecharModal);
    document.getElementById("modal-investimento-cancel").addEventListener("click", fecharModal);
    document.getElementById("form-investimento").addEventListener("submit", salvar);

    document.getElementById("investimento-tipo").addEventListener("change", atualizarCamposBet);

    dpAplicacao = criarDatepicker("inv-dataAplicacao");
    dpVencimento = criarDatepicker("inv-dataVencimento");
};

// --- FÁBRICA DE DATEPICKER ---
const criarDatepicker = (p) => {
    const hoje = new Date();
    let mes = hoje.getMonth();
    let ano = hoje.getFullYear();
    let selecionada = null;

    const dropdown = document.getElementById(`${p}-dropdown`);
    const display = document.getElementById(`${p}-display`);
    const hidden = document.getElementById(p);

    // --- RENDERIZAÇÃO DOS DIAS ---
    const renderizar = () => {
        document.getElementById(`${p}-month-year`).textContent = `${MESES[mes]} ${ano}`;

        const containerDias = document.getElementById(`${p}-days`);
        containerDias.innerHTML = "";

        const primeiroDia = new Date(ano, mes, 1).getDay();
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();
        const agora = new Date();

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

            if (d === agora.getDate() && mes === agora.getMonth() && ano === agora.getFullYear()) {
                el.classList.add("today");
            }

            if (selecionada && d === selecionada.getDate() && mes === selecionada.getMonth() && ano === selecionada.getFullYear()) {
                el.classList.add("selected");
            }

            el.addEventListener("click", () => selecionar(d));
            containerDias.appendChild(el);
        }
    };

    // --- RENDERIZAÇÃO DOS ANOS ---
    const renderizarAnos = () => {
        const container = document.getElementById(`${p}-years`);
        container.innerHTML = "";

        const anoAtual = new Date().getFullYear();
        const inicio = anoAtual - 100;
        const fim = anoAtual + 20;

        for (let a = fim; a >= inicio; a--) {
            const el = document.createElement("button");
            el.type = "button";
            el.className = "datepicker-year-item";
            el.textContent = a;

            if (a === anoAtual) {
                el.classList.add("today");
            }

            if (a === ano) {
                el.classList.add("selected");
            }

            el.addEventListener("click", () => {
                ano = a;
                dropdown.classList.remove("showing-years");
                renderizar();
            });
            container.appendChild(el);
        }

        const sel = container.querySelector(".selected");
        if (sel) {
            sel.scrollIntoView({
                block: "center"
            });
        }
    };

    // --- SELEÇÃO DE UMA DATA ---
    const selecionar = (dia) => {
        selecionada = new Date(ano, mes, dia);
        const iso = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
        hidden.value = iso;
        display.value = new Intl.DateTimeFormat("pt-BR").format(selecionada);
        dropdown.classList.remove("open");
    };

    // --- EVENTOS ---
    display.addEventListener("click", () => {
        dropdown.classList.toggle("open");
        dropdown.classList.remove("showing-years");
        renderizar();
    });

    document.getElementById(`${p}-prev`).addEventListener("click", () => {
        mes--;
        if (mes < 0) {
            mes = 11;
            ano--;
        }
        renderizar();
    });

    document.getElementById(`${p}-next`).addEventListener("click", () => {
        mes++;
        if (mes > 11) {
            mes = 0;
            ano++;
        }
        renderizar();
    });

    document.getElementById(`${p}-title`).addEventListener("click", () => {
        const aberto = dropdown.classList.toggle("showing-years");
        if (aberto) {
            renderizarAnos();
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest(`#${p}-wrapper`)) {
            dropdown.classList.remove("open");
            dropdown.classList.remove("showing-years");
        }
    });

    // --- API PÚBLICA ---
    return {
        definir(iso) {
            if (!iso) {
                selecionada = null;
                hidden.value = "";
                display.value = "";
                const h = new Date();
                mes = h.getMonth();
                ano = h.getFullYear();
                return;
            }
            const [y, m, d] = iso.split("-").map(Number);
            selecionada = new Date(y, m - 1, d);
            mes = m - 1;
            ano = y;
            hidden.value = iso;
            display.value = new Intl.DateTimeFormat("pt-BR").format(selecionada);
        }
    };
};

// --- ALTERNA CAMPOS ESPECÍFICOS DE APOSTA ---
const atualizarCamposBet = () => {
    const ehBet = document.getElementById("investimento-tipo").value === "BET";
    document.getElementById("grupo-resultado").classList.toggle("hidden", !ehBet);
    document.getElementById("grupo-status").classList.toggle("hidden", ehBet);
};

// --- CARREGAMENTO ---
const carregar = () => {
    pesquisarInvestimentos()
        .then(renderizarTabela)
        .catch(exibirErro);
};

// --- RENDERIZAÇÃO DA TABELA + RESUMO ---
const renderizarTabela = (investimentos) => {
    const container = document.getElementById("investimentos-body");

    atualizarResumo(investimentos);

    if (investimentos === null || investimentos === undefined || investimentos.length === 0) {
        const tplVazio = document.getElementById("tpl-investimentos-vazio");
        container.innerHTML = "";
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    const tplTabela = document.getElementById("tpl-investimentos-tabela");
    const tplLinha = document.getElementById("tpl-investimentos-linha");

    container.innerHTML = "";
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector("#investimentos-tbody");
    investimentos.forEach(inv => {
        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector("tr");

        tr.querySelector("[data-campo='nome']").textContent = inv.nome;

        const tdTipo = tr.querySelector("[data-campo='tipo']");
        const badgeTipo = document.createElement("span");
        badgeTipo.className = "badge badge-info";
        badgeTipo.textContent = ROTULO_TIPO[inv.tipo] ?? inv.tipo;
        tdTipo.appendChild(badgeTipo);

        tr.querySelector("[data-campo='aplicado']").textContent = formatarMoeda(inv.valorAplicado);
        tr.querySelector("[data-campo='atual']").textContent = formatarMoeda(inv.valorAtual);

        // --- RENDIMENTO ---
        const tdRend = tr.querySelector("[data-campo='rendimento']");
        const rendimento = inv.rendimento ?? 0;
        const percentual = inv.percentualRendimento ?? 0;
        tdRend.style.fontWeight = "600";
        tdRend.style.color = rendimento >= 0 ? "var(--success)" : "var(--danger)";
        const sinal = rendimento >= 0 ? "+" : "";
        tdRend.textContent = `${sinal}${formatarMoeda(rendimento)} (${percentual}%)`;

        const tdStatus = tr.querySelector("[data-campo='status']");
        const badgeStatus = document.createElement("span");
        badgeStatus.className = `badge ${CLASSE_STATUS[inv.status] ?? "badge-info"}`;
        badgeStatus.textContent = ROTULO_STATUS[inv.status] ?? inv.status;
        tdStatus.appendChild(badgeStatus);

        const tdAcoes = tr.querySelector("[data-campo='acoes']");

        const btnEditar = document.createElement("button");
        btnEditar.className = "btn btn-outline btn-editar-investimento";
        btnEditar.style.marginRight = "0.5rem";
        btnEditar.dataset.investimento = JSON.stringify(inv);
        const iconeEditar = document.createElement("i");
        iconeEditar.className = "pi pi-pencil";
        btnEditar.appendChild(iconeEditar);
        tdAcoes.appendChild(btnEditar);

        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-danger btn-excluir-investimento";
        btnExcluir.dataset.id = inv.id;
        const iconeExcluir = document.createElement("i");
        iconeExcluir.className = "pi pi-trash";
        btnExcluir.appendChild(iconeExcluir);
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });

    // --- VÍNCULO DOS BOTÕES ---
    container.querySelectorAll(".btn-editar-investimento").forEach(btn => {
        btn.addEventListener("click", () => abrirModal(JSON.parse(btn.dataset.investimento)));
    });

    container.querySelectorAll(".btn-excluir-investimento").forEach(btn => {
        btn.addEventListener("click", () => excluir(btn.dataset.id));
    });
};

// --- ATUALIZAÇÃO DOS CARTÕES DE RESUMO ---
const atualizarResumo = (investimentos) => {
    const lista = investimentos ?? [];
    const totalAplicado = lista.reduce((soma, i) => soma + Number(i.valorAplicado ?? 0), 0);
    const totalAtual = lista.reduce((soma, i) => soma + Number(i.valorAtual ?? 0), 0);
    const rendimento = totalAtual - totalAplicado;

    document.getElementById("resumo-aplicado").textContent = formatarMoeda(totalAplicado);
    document.getElementById("resumo-atual").textContent = formatarMoeda(totalAtual);

    const elRend = document.getElementById("resumo-rendimento");
    elRend.style.color = rendimento >= 0 ? "var(--success)" : "var(--danger)";
    const sinal = rendimento >= 0 ? "+" : "";
    elRend.textContent = `${sinal}${formatarMoeda(rendimento)}`;
};

// --- ABERTURA DO MODAL ---
const abrirModal = (investimento) => {
    const formulario = document.getElementById("form-investimento");
    formulario.reset();

    const selTipo = document.getElementById("investimento-tipo");
    const selStatus = document.getElementById("investimento-status");
    const selResultado = document.getElementById("investimento-resultado");

    if (investimento !== null) {
        document.getElementById("modal-investimento-title").textContent = "Editar Investimento";
        document.getElementById("investimento-id").value = investimento.id;
        document.getElementById("investimento-nome").value = investimento.nome ?? "";
        selTipo.value = investimento.tipo ?? "CDB";
        document.getElementById("investimento-valorAplicado").value = investimento.valorAplicado ?? "";
        document.getElementById("investimento-valorAtual").value = investimento.valorAtual ?? "";
        document.getElementById("investimento-instituicao").value = investimento.instituicao ?? "";
        document.getElementById("investimento-taxa").value = investimento.taxa ?? "";
        selStatus.value = investimento.status === "RESGATADO" ? "RESGATADO" : "ATIVO";
        selResultado.value = investimento.resultadoAposta ?? "PENDENTE";
        dpAplicacao.definir(investimento.dataAplicacao ?? null);
        dpVencimento.definir(investimento.dataVencimento ?? null);
    } else {
        document.getElementById("modal-investimento-title").textContent = "Novo Investimento";
        document.getElementById("investimento-id").value = "";
        selTipo.value = "CDB";
        selStatus.value = "ATIVO";
        selResultado.value = "PENDENTE";
        dpAplicacao.definir(null);
        dpVencimento.definir(null);
    }

    selTipo.dispatchEvent(new Event("change"));
    selStatus.dispatchEvent(new Event("change"));
    selResultado.dispatchEvent(new Event("change"));

    document.getElementById("modal-investimento").classList.remove("hidden");
};

// --- FECHAMENTO DO MODAL ---
const fecharModal = () => {
    document.getElementById("modal-investimento").classList.add("hidden");
};

// --- SALVAR INVESTIMENTO ---
const salvar = (e) => {
    e.preventDefault();

    const id = document.getElementById("investimento-id").value;
    const tipo = document.getElementById("investimento-tipo").value;
    const ehBet = tipo === "BET";

    const valorAtualStr = document.getElementById("investimento-valorAtual").value;
    const taxaStr = document.getElementById("investimento-taxa").value;
    const instituicao = document.getElementById("investimento-instituicao").value;

    // --- MONTAGEM DO PAYLOAD ---
    const payload = {
        nome: document.getElementById("investimento-nome").value,
        tipo: tipo,
        valorAplicado: parseFloat(document.getElementById("investimento-valorAplicado").value),
        valorAtual: valorAtualStr !== "" ? parseFloat(valorAtualStr) : null,
        instituicao: instituicao !== "" ? instituicao : null,
        taxa: taxaStr !== "" ? parseFloat(taxaStr) : null,
        dataAplicacao: document.getElementById("inv-dataAplicacao").value || null,
        dataVencimento: document.getElementById("inv-dataVencimento").value || null,
        status: ehBet ? null : document.getElementById("investimento-status").value,
        resultadoAposta: ehBet ? document.getElementById("investimento-resultado").value : null,
    };

    // --- ENVIO AO BACKEND ---
    const promessa = id !== "" ? atualizarInvestimento(id, payload) : criarInvestimento(payload);

    promessa
        .then(() => {
            exibirSucesso(id !== "" ? "Investimento atualizado" : "Investimento criado");
            fecharModal();
            carregar();
        })
        .catch(exibirErro);
};

// --- EXCLUSÃO DE INVESTIMENTO ---
const excluir = (id) => {
    confirmar({
        titulo: "Excluir investimento",
        mensagem: "Deseja realmente excluir este investimento? Esta ação não pode ser desfeita.",
    }).then((confirmado) => {
        if (!confirmado) {
            return;
        }
        excluirInvestimento(id)
            .then(() => {
                exibirSucesso("Investimento excluído");
                carregar();
            })
            .catch(exibirErro);
    });
};

export { iniciarInvestimentos };
