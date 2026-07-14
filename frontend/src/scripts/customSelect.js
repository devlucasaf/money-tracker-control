// Componente que transforma <select> nativos em dropdowns customizados,
// mantendo o <select> original como fonte de dados (o JS existente continua
// lendo/escrevendo .value normalmente). Suporta opcoes adicionadas
// dinamicamente via MutationObserver.

const construirOpcoes = (select, listaOpcoes, valueSpan) => {
    listaOpcoes.innerHTML = "";

    Array.from(select.options).forEach((opcao) => {
        const item = document.createElement("div");
        item.className = "custom-select-option";
        item.dataset.value = opcao.value;
        item.textContent = opcao.textContent;

        if (opcao.value === select.value) {
            item.classList.add("selected");
        }

        item.addEventListener("click", () => {
            select.value = opcao.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            fecharTodos();
        });

        listaOpcoes.appendChild(item);
    });

    atualizarSelecionado(select, listaOpcoes, valueSpan);
};

const atualizarSelecionado = (select, listaOpcoes, valueSpan) => {
    const opcaoAtual = select.options[select.selectedIndex];
    valueSpan.textContent = opcaoAtual ? opcaoAtual.textContent : "";

    listaOpcoes.querySelectorAll(".custom-select-option").forEach((item) => {
        item.classList.toggle("selected", item.dataset.value === select.value);
    });
};

const fecharTodos = () => {
    document.querySelectorAll(".custom-select.open").forEach((cs) => cs.classList.remove("open"));
};

const aprimorarSelect = (select) => {
    if (select.dataset.csDone === "true") {
        return;
    }
    select.dataset.csDone = "true";

    // Wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "custom-select";

    // Botao toggle
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "custom-select-toggle";

    const valueSpan = document.createElement("span");
    valueSpan.className = "custom-select-value";

    const arrow = document.createElement("i");
    arrow.className = "pi pi-chevron-down custom-select-arrow";

    toggle.appendChild(valueSpan);
    toggle.appendChild(arrow);

    // Lista de opcoes
    const listaOpcoes = document.createElement("div");
    listaOpcoes.className = "custom-select-options";

    // Posiciona wrapper antes do select e move o select para dentro
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(toggle);
    wrapper.appendChild(listaOpcoes);
    wrapper.appendChild(select);
    select.classList.add("cs-native");

    construirOpcoes(select, listaOpcoes, valueSpan);

    // Abrir/fechar
    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const jaAberto = wrapper.classList.contains("open");
        fecharTodos();
        if (!jaAberto) {
            wrapper.classList.add("open");
        }
    });

    // Mudancas programaticas no select (ex.: reset de formulario)
    select.addEventListener("change", () => atualizarSelecionado(select, listaOpcoes, valueSpan));

    // Opcoes adicionadas dinamicamente (categorias/contas)
    const observer = new MutationObserver(() => construirOpcoes(select, listaOpcoes, valueSpan));
    observer.observe(select, { childList: true });
};

const aprimorarSelects = (root = document) => {
    root.querySelectorAll("select:not([data-cs-done])").forEach(aprimorarSelect);
};

// Fecha dropdowns ao clicar fora
document.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-select")) {
        fecharTodos();
    }
});

export { aprimorarSelects };

