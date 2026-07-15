import { exibirSucesso, exibirErro, confirmar } from "../util.js";
import { pesquisarCategorias, criarCategoria, atualizarCategoria, excluirCategoria } from "../remotes/categorias/categoriasRemote.js";

const iniciarCategorias = () => {
    carregar();
    document.getElementById("btn-nova-categoria").addEventListener("click", () => abrirModal(null));
    document.getElementById("modal-categoria-close").addEventListener("click", fecharModal);
    document.getElementById("modal-categoria-cancel").addEventListener("click", fecharModal);
    document.getElementById("form-categoria").addEventListener("submit", salvar);
};

const carregar = () => {
    pesquisarCategorias()
        .then(renderizarTabela)
        .catch(exibirErro);
};

const renderizarTabela = (categorias) => {
    const container = document.getElementById("categorias-body");

    if (categorias === null || categorias === undefined || categorias.length === 0) {
        const tplVazio = document.getElementById("tpl-categorias-vazio");
        container.innerHTML = "";
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    const tplTabela = document.getElementById("tpl-categorias-tabela");
    const tplLinha = document.getElementById("tpl-categorias-linha");

    container.innerHTML = "";
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector("#categorias-tbody");
    categorias.forEach(c => {
        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector("tr");

        const tdCor = tr.querySelector("[data-campo='cor']");
        const dot = document.createElement("span");
        dot.className = "color-dot";
        dot.style.background = c.cor ?? "#6366f1";
        tdCor.appendChild(dot);

        tr.querySelector("[data-campo='nome']").textContent = c.nome;

        const tdTipo = tr.querySelector("[data-campo='tipo']");
        const badge = document.createElement("span");
        badge.className = `badge ${c.tipo === "RECEITA" ? "badge-success" : "badge-danger"}`;
        badge.textContent = c.tipo;
        tdTipo.appendChild(badge);

        const tdAcoes = tr.querySelector("[data-campo='acoes']");

        const btnEditar = document.createElement("button");

        btnEditar.className = "btn btn-outline btn-editar-categoria";
        btnEditar.style.marginRight = "0.5rem";
        btnEditar.dataset.id = c.id;
        btnEditar.dataset.nome = c.nome;
        btnEditar.dataset.tipo = c.tipo;
        btnEditar.dataset.cor = c.cor ?? "#6366f1";

        const iconeEditar = document.createElement("i");
        iconeEditar.className = "pi pi-pencil";
        btnEditar.appendChild(iconeEditar);
        tdAcoes.appendChild(btnEditar);

        const btnExcluir = document.createElement("button");

        btnExcluir.className = "btn btn-danger btn-excluir-categoria";
        btnExcluir.dataset.id = c.id;

        const iconeExcluir = document.createElement("i");
        iconeExcluir.className = "pi pi-trash";
        btnExcluir.appendChild(iconeExcluir);
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });

    container.querySelectorAll(".btn-editar-categoria").forEach(btn => {
        btn.addEventListener("click", () => {
            abrirModal({
                id: btn.dataset.id,
                nome: btn.dataset.nome,
                tipo: btn.dataset.tipo,
                cor: btn.dataset.cor
            });
        });
    });

    container.querySelectorAll(".btn-excluir-categoria").forEach(btn => {
        btn.addEventListener("click", () => excluir(btn.dataset.id));
    });
};

const abrirModal = (categoria) => {
    const formulario = document.getElementById("form-categoria");
    formulario.reset();
    if (categoria !== null) {
        document.getElementById("modal-categoria-title").textContent = "Editar Categoria";
        document.getElementById("categoria-id").value = categoria.id;
        document.getElementById("categoria-nome").value = categoria.nome;
        document.getElementById("categoria-tipo").value = categoria.tipo;
        document.getElementById("categoria-cor").value = categoria.cor;
    } else {
        document.getElementById("modal-categoria-title").textContent = "Nova Categoria";
        document.getElementById("categoria-id").value = "";
    }
    document.getElementById("modal-categoria").classList.remove("hidden");
};

const fecharModal = () => {
    document.getElementById("modal-categoria").classList.add("hidden");
};

const salvar = (e) => {
    e.preventDefault();
    const id = document.getElementById("categoria-id").value;
    const payload = {
        nome: document.getElementById("categoria-nome").value,
        tipo: document.getElementById("categoria-tipo").value,
        cor: document.getElementById("categoria-cor").value,
    };

    const promessa = id !== "" ? atualizarCategoria(id, payload) : criarCategoria(payload);

    promessa
        .then(() => {
            exibirSucesso(id !== "" ? "Categoria atualizada" : "Categoria criada");
            fecharModal();
            carregar();
        })
        .catch(exibirErro);
};

const excluir = (id) => {
    confirmar({
        titulo: "Excluir categoria",
        mensagem: "Deseja realmente excluir esta categoria? Esta ação não pode ser desfeita.",
    }).then((confirmado) => {
        if (!confirmado) {
            return;
        }
        excluirCategoria(id)
            .then(() => { exibirSucesso("Categoria excluída"); carregar(); })
            .catch(exibirErro);
    });
};

export { iniciarCategorias };
