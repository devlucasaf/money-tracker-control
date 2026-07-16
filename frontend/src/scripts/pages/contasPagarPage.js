import { formatarMoeda, formatarData, exibirSucesso, exibirErro, confirmar } from "../util.js";
import {
    pesquisarContasPagar, criarContaPagar, atualizarContaPagar,
    marcarPago, desmarcarPago, excluirContaPagar
}                           from "../remotes/contaspagar/contasPagarRemote.js";
import { pesquisarContas }  from "../remotes/contas/contasRemote.js";
import { criarDatepicker }  from "../datepicker.js";

let dpVencimento;
let contasCache = [];

// --- INICIALIZAÇÃO ---
const iniciarContasPagar = () => {
    carregar();
    carregarContas();

    document.getElementById("btn-novo-cp").addEventListener("click", () => abrirModal(null));
    document.getElementById("modal-cp-close").addEventListener("click", fecharModal);
    document.getElementById("modal-cp-cancel").addEventListener("click", fecharModal);
    document.getElementById("form-cp").addEventListener("submit", salvar);

    dpVencimento = criarDatepicker({ placeholder: "Selecione a data" });
    document.getElementById("cp-data-container").appendChild(dpVencimento.element);
};

// --- CARREGA AS CONTAS PARA O SELECT ---
const carregarContas = () => {
    pesquisarContas()
        .then(contas => {
            contasCache = contas;
            const select = document.getElementById("cp-conta");
            select.innerHTML = "";
            const padrao = document.createElement("option");
            padrao.value = "";
            padrao.textContent = "Nenhuma (apenas lembrete)";
            select.appendChild(padrao);
            contas.forEach(c => {
                const o = document.createElement("option");
                o.value = c.id;
                o.textContent = c.nome;
                select.appendChild(o);
            });
        })
        .catch(exibirErro);
};

// --- CARREGAMENTO ---
const carregar = () => {
    pesquisarContasPagar()
        .then((lista) => {
            renderizarResumo(lista);
            renderizarTabela(lista);
        })
        .catch(exibirErro);
};

// --- RESUMO ---
const renderizarResumo = (lista) => {
    const container = document.getElementById("cp-resumo");
    container.innerHTML = "";

    const hoje = zerarHora(new Date());
    let totalPagar = 0;
    let totalReceber = 0;
    let vencidas = 0;

    lista.forEach(item => {
        if (item.pago) {
            return;
        }

        if (item.tipo === "PAGAR") {
            totalPagar += Number(item.valor);
        } else {
            totalReceber += Number(item.valor);
        }

        if (dataVencimento(item) < hoje) {
            vencidas++;
        }
    });

    const fragmento = document.getElementById("tpl-cp-resumo").content.cloneNode(true);
    
    fragmento.querySelector("[data-campo='total-pagar']").textContent = formatarMoeda(totalPagar);
    fragmento.querySelector("[data-campo='total-receber']").textContent = formatarMoeda(totalReceber);
    fragmento.querySelector("[data-campo='total-vencidas']").textContent = vencidas;
    container.appendChild(fragmento);
};

// --- TABELA ---
const renderizarTabela = (lista) => {
    const container = document.getElementById("cp-body");

    if (!lista || lista.length === 0) {
        const tplVazio = document.getElementById("tpl-cp-vazio");
        container.innerHTML = "";
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    const tplTabela = document.getElementById("tpl-cp-tabela");
    const tplLinha = document.getElementById("tpl-cp-linha");
    container.innerHTML = "";
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector("#cp-tbody");
    const hoje = zerarHora(new Date());

    lista.forEach(item => {
        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector("tr");

        tr.querySelector("[data-campo='descricao']").textContent = item.descricao;

        // --- TIPO ---
        const tdTipo = tr.querySelector("[data-campo='tipo']");
        const badgeTipo = document.createElement("span");
        badgeTipo.className = `badge ${item.tipo === "PAGAR" ? "badge-danger" : "badge-success"}`;
        badgeTipo.textContent = item.tipo === "PAGAR" ? "A pagar" : "A receber";
        tdTipo.appendChild(badgeTipo);

        // --- VALOR ---
        const tdValor = tr.querySelector("[data-campo='valor']");
        tdValor.style.fontWeight = "600";
        tdValor.textContent = formatarMoeda(item.valor);

        // --- VENCIMENTO ---
        tr.querySelector("[data-campo='vencimento']").textContent = formatarData(item.dataVencimento);

        // --- CONTA ---
        tr.querySelector("[data-campo='conta']").textContent = item.contaNome ?? "-";

        // --- STATUS ---
        const tdStatus = tr.querySelector("[data-campo='status']");
        const badgeStatus = document.createElement("span");
        if (item.pago) {
            badgeStatus.className = "badge badge-success";
            badgeStatus.textContent = item.tipo === "PAGAR" ? "Pago" : "Recebido";
        } else if (dataVencimento(item) < hoje) {
            badgeStatus.className = "badge badge-danger";
            badgeStatus.textContent = "Vencida";
        } else if (dataVencimento(item).getTime() === hoje.getTime()) {
            badgeStatus.className = "badge badge-warning";
            badgeStatus.textContent = "Vence hoje";
        } else {
            badgeStatus.className = "badge badge-info";
            badgeStatus.textContent = "Pendente";
        }
        tdStatus.appendChild(badgeStatus);

        // --- AÇÕES ---
        const tdAcoes = tr.querySelector("[data-campo='acoes']");

        const btnPago = document.createElement("button");
        btnPago.style.marginRight = "0.5rem";
        if (item.pago) {
            btnPago.className = "btn btn-outline";
            btnPago.title = "Desmarcar";
            btnPago.innerHTML = '<i class="pi pi-undo"></i>';
            btnPago.addEventListener("click", () => alternarPago(item, false));
        } else {
            btnPago.className = "btn btn-success";
            btnPago.title = "Marcar como pago/recebido";
            btnPago.innerHTML = '<i class="pi pi-check"></i>';
            btnPago.addEventListener("click", () => alternarPago(item, true));
        }
        tdAcoes.appendChild(btnPago);

        if (!item.pago) {
            const btnEditar = document.createElement("button");
            btnEditar.className = "btn btn-outline";
            btnEditar.style.marginRight = "0.5rem";
            btnEditar.innerHTML = '<i class="pi pi-pencil"></i>';
            btnEditar.addEventListener("click", () => abrirModal(item));
            tdAcoes.appendChild(btnEditar);
        }

        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-danger";
        btnExcluir.innerHTML = '<i class="pi pi-trash"></i>';
        btnExcluir.addEventListener("click", () => excluir(item.id));
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });
};

// --- ABERTURA DO MODAL ---
const abrirModal = (item) => {
    document.getElementById("form-cp").reset();
    dpVencimento.limpar();

    const selConta = document.getElementById("cp-conta");
    const selTipo = document.getElementById("cp-tipo");

    if (item !== null) {
        document.getElementById("modal-cp-title").textContent = "Editar Compromisso";
        document.getElementById("cp-id").value = item.id;
        document.getElementById("cp-descricao").value = item.descricao;
        document.getElementById("cp-valor").value = item.valor;
        selTipo.value = item.tipo;
        selConta.value = item.contaId ?? "";
        dpVencimento.setValor(item.dataVencimento);
    } else {
        document.getElementById("modal-cp-title").textContent = "Novo Compromisso";
        document.getElementById("cp-id").value = "";
        selTipo.value = "PAGAR";
        selConta.value = "";
    }
    selTipo.dispatchEvent(new Event("change", { bubbles: true }));
    selConta.dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("modal-cp").classList.remove("hidden");
};

const fecharModal = () => {
    document.getElementById("modal-cp").classList.add("hidden");
};

// --- SALVAR ---
const salvar = (e) => {
    e.preventDefault();

    const data = dpVencimento.getValor();
    if (!data) {
        exibirErro("Selecione a data de vencimento");
        return;
    }

    const id = document.getElementById("cp-id").value;
    const contaVal = document.getElementById("cp-conta").value;
    const payload = {
        descricao: document.getElementById("cp-descricao").value,
        valor: parseFloat(document.getElementById("cp-valor").value),
        tipo: document.getElementById("cp-tipo").value,
        dataVencimento: data,
        contaId: contaVal ? parseInt(contaVal) : null,
    };

    const promessa = id !== "" ? atualizarContaPagar(id, payload) : criarContaPagar(payload);
    promessa
        .then(() => {
            exibirSucesso(id !== "" ? "Compromisso atualizado" : "Compromisso criado");
            fecharModal();
            carregar();
        })
        .catch(exibirErro);
};

// --- MARCAR/DESMARCAR PAGO ---
const alternarPago = (item, marcar) => {
    const acao = marcar ? marcarPago(item.id) : desmarcarPago(item.id);
    acao
        .then(() => {
            exibirSucesso(marcar ? "Marcado como pago" : "Marcação desfeita");
            carregar();
        })
        .catch(exibirErro);
};

// --- EXCLUIR ---
const excluir = (id) => {
    confirmar({
        titulo: "Excluir compromisso",
        mensagem: "Deseja realmente excluir este compromisso? Se estiver pago, o saldo será revertido.",
    }).then((confirmado) => {
        if (!confirmado) {
            return;
        }
        excluirContaPagar(id)
            .then(() => { exibirSucesso("Compromisso excluído"); carregar(); })
            .catch(exibirErro);
    });
};

// --- HELPERS DE DATA ---
const zerarHora = (data) => {
    data.setHours(0, 0, 0, 0);
    return data;
};

const dataVencimento = (item) => zerarHora(new Date(`${item.dataVencimento}T00:00:00`));

export { iniciarContasPagar };

