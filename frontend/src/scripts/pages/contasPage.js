import { formatarMoeda, formatarData, exibirSucesso, exibirErro, confirmar }    from "../util.js";
import { pesquisarContas, criarConta, atualizarConta, excluirConta }            from "../remotes/contas/contasRemote.js";
import { pesquisarTransferencias, criarTransferencia, excluirTransferencia }    from "../remotes/transferencias/transferenciasRemote.js";
import { criarDatepicker }                                                      from "../datepicker.js";
import { confirmarComSenha }                                                    from "../confirmacaoSenha.js";

let dpTransferencia;

const iniciarContas = () => {
    carregar();
    carregarTransferencias();
    document.getElementById("btn-nova-conta").addEventListener("click", () => abrirModal(null));
    document.getElementById("modal-conta-close").addEventListener("click", fecharModal);
    document.getElementById("modal-conta-cancel").addEventListener("click", fecharModal);
    document.getElementById("form-conta").addEventListener("submit", salvar);

    document.getElementById("btn-transferir").addEventListener("click", abrirModalTransferencia);
    document.getElementById("modal-transferencia-close").addEventListener("click", fecharModalTransferencia);
    document.getElementById("modal-transferencia-cancel").addEventListener("click", fecharModalTransferencia);
    document.getElementById("form-transferencia").addEventListener("submit", salvarTransferencia);

    dpTransferencia = criarDatepicker({ placeholder: "Selecione a data" });
    document.getElementById("transferencia-data-container").appendChild(dpTransferencia.element);
};

const carregar = () => {
    pesquisarContas()
        .then(renderizarTabela)
        .catch(exibirErro);
};

const renderizarTabela = (contas) => {
    const container = document.getElementById("contas-body");

    if (contas === null || contas === undefined || contas.length === 0) {
        const tplVazio = document.getElementById("tpl-contas-vazio");
        container.innerHTML = "";
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    const tplTabela = document.getElementById("tpl-contas-tabela");
    const tplLinha = document.getElementById("tpl-contas-linha");

    container.innerHTML = "";
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector("#contas-tbody");
    contas.forEach(c => {
        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector("tr");

        tr.querySelector("[data-campo='nome']").textContent = c.nome;

        const tdTipo = tr.querySelector("[data-campo='tipo']");
        const badge = document.createElement("span");
        badge.className = "badge badge-info";
        badge.textContent = c.tipo;
        tdTipo.appendChild(badge);

        const tdSaldo = tr.querySelector("[data-campo='saldo']");

        tdSaldo.style.fontWeight = "600";
        tdSaldo.style.color = c.saldo >= 0 ? "var(--success)" : "var(--danger)";
        tdSaldo.textContent = formatarMoeda(c.saldo);

        const tdAcoes = tr.querySelector("[data-campo='acoes']");
        const btnEditar = document.createElement("button");

        btnEditar.className = "btn btn-outline btn-editar-conta";
        btnEditar.style.marginRight = "0.5rem";
        btnEditar.dataset.id = c.id;
        btnEditar.dataset.nome = c.nome;
        btnEditar.dataset.tipo = c.tipo;
        btnEditar.dataset.saldo = c.saldo;

        const iconeEditar = document.createElement("i");

        iconeEditar.className = "pi pi-pencil";
        btnEditar.appendChild(iconeEditar);
        tdAcoes.appendChild(btnEditar);

        const btnExcluir = document.createElement("button");

        btnExcluir.className = "btn btn-danger btn-excluir-conta";
        btnExcluir.dataset.id = c.id;

        const iconeExcluir = document.createElement("i");

        iconeExcluir.className = "pi pi-trash";
        btnExcluir.appendChild(iconeExcluir);
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });

    container.querySelectorAll(".btn-editar-conta").forEach(btn => {
        btn.addEventListener("click", () => {
            abrirModal({
                id: btn.dataset.id,
                nome: btn.dataset.nome,
                tipo: btn.dataset.tipo,
                saldo: btn.dataset.saldo
            });
        });
    });

    container.querySelectorAll(".btn-excluir-conta").forEach(btn => {
        btn.addEventListener("click", () => excluir(btn.dataset.id));
    });
};

const abrirModal = (conta) => {
    const formulario = document.getElementById("form-conta");
    formulario.reset();
    if (conta !== null) {
        document.getElementById("modal-conta-title").textContent = "Editar Conta";
        document.getElementById("conta-id").value = conta.id;
        document.getElementById("conta-nome").value = conta.nome;
        document.getElementById("conta-tipo").value = conta.tipo;
        document.getElementById("conta-saldo").value = conta.saldo;
    } else {
        document.getElementById("modal-conta-title").textContent = "Nova Conta";
        document.getElementById("conta-id").value = "";
    }
    document.getElementById("modal-conta").classList.remove("hidden");
};

const fecharModal = () => {
    document.getElementById("modal-conta").classList.add("hidden");
};

const salvar = (e) => {
    e.preventDefault();
    const id = document.getElementById("conta-id").value;
    const payload = {
        nome: document.getElementById("conta-nome").value,
        tipo: document.getElementById("conta-tipo").value,
        saldo: parseFloat(document.getElementById("conta-saldo").value),
    };

    const promessa = id !== "" ? atualizarConta(id, payload) : criarConta(payload);

    promessa
        .then(() => {
            exibirSucesso(id !== "" ? "Conta atualizada" : "Conta criada");
            fecharModal();
            carregar();
        })
        .catch(exibirErro);
};

const excluir = (id) => {
    confirmar({
        titulo: "Excluir conta",
        mensagem: "Deseja realmente excluir esta conta? Esta ação não pode ser desfeita.",
    }).then((confirmado) => {
        if (!confirmado) {
            return;
        }

        // --- EXIGE CONFIRMAÇÃO POR SENHA ---
        confirmarComSenha({
            titulo: "Confirme sua senha",
            mensagem: "Para excluir a conta, digite sua senha.",
            textoConfirmar: "Excluir conta",
        }).then((senhaOk) => {
            if (!senhaOk) {
                return;
            }
            excluirConta(id)
                .then(() => { exibirSucesso("Conta excluída"); carregar(); })
                .catch(exibirErro);
        });
    });
};

// --- CARREGAMENTO DAS TRANSFERÊNCIAS ---
const carregarTransferencias = () => {
    pesquisarTransferencias()
        .then(renderizarTransferencias)
        .catch(exibirErro);
};

// --- RENDERIZAÇÃO DA LISTA DE TRANSFERÊNCIAS ---
const renderizarTransferencias = (transferencias) => {
    const container = document.getElementById("transferencias-body");

    if (!transferencias || transferencias.length === 0) {
        const tplVazio = document.getElementById("tpl-transferencias-vazio");
        container.innerHTML = "";
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    const tplTabela = document.getElementById("tpl-transferencias-tabela");
    const tplLinha = document.getElementById("tpl-transferencias-linha");

    container.innerHTML = "";
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector("#transferencias-tbody");
    transferencias.forEach(t => {
        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector("tr");

        tr.querySelector("[data-campo='data']").textContent = formatarData(t.data);
        tr.querySelector("[data-campo='origem']").textContent = t.contaOrigemNome ?? "-";
        tr.querySelector("[data-campo='destino']").textContent = t.contaDestinoNome ?? "-";

        const tdValor = tr.querySelector("[data-campo='valor']");
        tdValor.style.fontWeight = "600";
        tdValor.textContent = formatarMoeda(t.valor);

        tr.querySelector("[data-campo='descricao']").textContent = t.descricao ?? "-";

        const tdAcoes = tr.querySelector("[data-campo='acoes']");
        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-danger btn-excluir-transferencia";
        btnExcluir.dataset.id = t.id;
        const icone = document.createElement("i");
        icone.className = "pi pi-trash";
        btnExcluir.appendChild(icone);
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });

    container.querySelectorAll(".btn-excluir-transferencia").forEach(btn => {
        btn.addEventListener("click", () => excluirTransf(btn.dataset.id));
    });
};

// --- ABERTURA DO MODAL DE TRANSFERÊNCIA ---
const abrirModalTransferencia = () => {
    document.getElementById("form-transferencia").reset();
    dpTransferencia.limpar();

    // --- POPULA OS SELECTS DE ORIGEM E DESTINO COM AS CONTAS ATUAIS ---
    pesquisarContas().then(contas => {
            ["transferencia-origem", "transferencia-destino"].forEach(id => {
                const select = document.getElementById(id);
                select.innerHTML = "";
                const optPadrao = document.createElement("option");
                optPadrao.value = "";
                optPadrao.textContent = "Selecione...";
                select.appendChild(optPadrao);
                contas.forEach(c => {
                    const opt = document.createElement("option");
                    opt.value = c.id;
                    opt.textContent = `${c.nome} (${formatarMoeda(c.saldo)})`;
                    select.appendChild(opt);
                });
            });
        })
        .catch(exibirErro);

    document.getElementById("modal-transferencia").classList.remove("hidden");
};

// --- FECHAMENTO DO MODAL DE TRANSFERÊNCIA ---
const fecharModalTransferencia = () => {
    document.getElementById("modal-transferencia").classList.add("hidden");
};

// --- SALVAR TRANSFERÊNCIA ---
const salvarTransferencia = (e) => {
    e.preventDefault();

    const origemId = document.getElementById("transferencia-origem").value;
    const destinoId = document.getElementById("transferencia-destino").value;
    const valor = parseFloat(document.getElementById("transferencia-valor").value);
    const data = dpTransferencia.getValor();

    if (!origemId || !destinoId) {
        exibirErro("Selecione as contas de origem e destino");
        return;
    }

    if (origemId === destinoId) {
        exibirErro("A conta de origem e destino devem ser diferentes");
        return;
    }

    if (!data) {
        exibirErro("Selecione a data da transferência");
        return;
    }

    const payload = {
        contaOrigemId: parseInt(origemId),
        contaDestinoId: parseInt(destinoId),
        valor: valor,
        data: data,
        descricao: document.getElementById("transferencia-descricao").value || null,
    };

    criarTransferencia(payload)
        .then(() => {
            exibirSucesso("Transferência realizada");
            fecharModalTransferencia();
            carregar();
            carregarTransferencias();
        })
        .catch(exibirErro);
};

// --- EXCLUSÃO DE TRANSFERÊNCIA ---
const excluirTransf = (id) => {
    confirmar({
        titulo: "Excluir transferência",
        mensagem: "Deseja realmente excluir esta transferência? O saldo das contas será revertido.",
    }).then((confirmado) => {
        if (!confirmado) {
            return;
        }
        excluirTransferencia(id)
            .then(() => {
                exibirSucesso("Transferência excluída");
                carregar();
                carregarTransferencias();
            })
            .catch(exibirErro);
    });
};

export { iniciarContas };
