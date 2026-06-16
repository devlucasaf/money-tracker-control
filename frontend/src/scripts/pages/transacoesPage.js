import { formatarMoeda, formatarData, exibirSucesso, exibirErro, obterMoedaUsuario } from "../util.js";
import { pesquisarTransacoes, criarTransacao, excluirTransacao } from "../remotes/transacoes/transacoesRemote.js";
import { pesquisarCategorias } from "../remotes/categorias/categoriasRemote.js";
import { pesquisarContas } from "../remotes/contas/contasRemote.js";

let paginaAtual = 0;
let dpMes, dpAno, dpDataSelecionada;

// --- TAXAS APROXIMADAS ---
const TAXAS_FALLBACK = { 
    USD: 5.1, 
    EUR: 5.6, 
    GBP: 6.5, 
    ARS: 0.006, 
    JPY: 0.034, 
    BRL: 1, 
    CAD: 3.8 
};

const iniciarTransacoes = () => {
    carregarDependencias();
    carregar(0);

    document.getElementById("btn-nova-transacao").addEventListener("click", abrirModal);
    document.getElementById("modal-transacao-close").addEventListener("click", fecharModal);
    document.getElementById("modal-transacao-cancel").addEventListener("click", fecharModal);
    document.getElementById("form-transacao").addEventListener("submit", salvar);

    // --- CONVERSOR DE MOEDA ---
    document.getElementById("transacao-valor").addEventListener("input", converterMoeda);
    document.getElementById("converter-moeda").addEventListener("change", converterMoeda);

    // --- CALENDÁRIO PERSONALIZADO ---
    inicializarCalendario();
};

// ---- CONVERSOR DE MOEDA ----
const converterMoeda = () => {
    const valor = parseFloat(document.getElementById("transacao-valor").value);
    const moedaDestino = document.getElementById("converter-moeda").value;
    const elementoResultado = document.getElementById("converted-value");
    const moedaBase = obterMoedaUsuario();

    if (!valor || isNaN(valor)) {
        elementoResultado.textContent = "—";
        return;
    }

    if (moedaBase === moedaDestino) {
        elementoResultado.textContent = formatarValorConvertido(valor, moedaDestino);
        return;
    }

    // --- API ---
    fetch(`https://open.er-api.com/v6/latest/${moedaBase}`)
        .then(r => r.json())
        .then(dados => {
            if (dados.rates && dados.rates[moedaDestino]) {
                const convertido = valor * dados.rates[moedaDestino];
                elementoResultado.textContent = formatarValorConvertido(convertido, moedaDestino);
            } else {
                conversaoFallback(valor, moedaBase, moedaDestino, elementoResultado);
            }
        })
        .catch(() => conversaoFallback(valor, moedaBase, moedaDestino, elementoResultado));
};

const conversaoFallback = (valor, de, para, elemento) => {
    const taxaDe = TAXAS_FALLBACK[de] || 1;
    const taxaPara = TAXAS_FALLBACK[para] || 1;
    const emBRL = valor * taxaDe;
    const convertido = emBRL / taxaPara;
    elemento.textContent = `≈ ${formatarValorConvertido(convertido, para)}`;
};

const formatarValorConvertido = (valor, moeda) => {
    const locales = { 
        USD: "en-US", 
        EUR: "de-DE", 
        GBP: "en-GB", 
        ARS: "es-AR", 
        JPY: "ja-JP", 
        BRL: "pt-BR", 
        CAD: "en-CA" 
    };
    return new Intl.NumberFormat(locales[moeda] || "en-US", { style: "currency", currency: moeda }).format(valor);
};

// ---- CALENDÁRIO PERSONALIZADO ----
const inicializarCalendario = () => {
    const hoje = new Date();
    dpMes = hoje.getMonth();
    dpAno = hoje.getFullYear();
    dpDataSelecionada = null;

    const exibicao = document.getElementById("transacao-data-display");
    const dropdown = document.getElementById("datepicker-dropdown");

    exibicao.addEventListener("click", () => {
        dropdown.classList.toggle("open");
        renderizarCalendario();
    });

    document.getElementById("dp-prev").addEventListener("click", () => {
        dpMes--;
        if (dpMes < 0) { 
            dpMes = 11; 
            dpAno--; 
        }
        renderizarCalendario();
    });

    document.getElementById("dp-next").addEventListener("click", () => {
        dpMes++;
        if (dpMes > 11) { 
            dpMes = 0;
            dpAno++; 
        }
        renderizarCalendario();
    });

    // --- FECHAR AO CLICAR FORA ---
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#datepicker-wrapper")) {
            dropdown.classList.remove("open");
        }
    });
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
    document.getElementById("dp-month-year").textContent = `${meses[dpMes]} ${dpAno}`;

    const containerDias = document.getElementById("dp-days");
    containerDias.innerHTML = "";

    const primeiroDia = new Date(dpAno, dpMes, 1).getDay();
    const diasNoMes = new Date(dpAno, dpMes + 1, 0).getDate();
    const hoje = new Date();

    // --- CÉLULAS VAZIAS ANTES DO PRIMEIRO DIA ---
    for (let i = 0; i < primeiroDia; i++) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "datepicker-day other-month";
        el.textContent = "";
        containerDias.appendChild(el);
    }

    // --- DIAS ---
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
    document.getElementById("transacao-data").value = iso;
    document.getElementById("transacao-data-display").value = new Intl.DateTimeFormat("pt-BR").format(dpDataSelecionada);
    document.getElementById("datepicker-dropdown").classList.remove("open");
};

// ---- LÓGICA PRINCIPAL ----
const carregarDependencias = () => {
    pesquisarCategorias()
        .then(categorias => {
            const select = document.getElementById("transacao-categoria");
            select.innerHTML = "<option value=''>Selecione...</option>";
            categorias.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
            });
        })
        .catch(exibirErro);

    pesquisarContas()
        .then(contas => {
            const select = document.getElementById("transacao-conta");
            select.innerHTML = "<option value=''>Selecione...</option>";
            contas.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
            });
        })
        .catch(exibirErro);
};

const carregar = (pagina) => {
    paginaAtual = pagina;
    pesquisarTransacoes({ page: pagina, size: 10 })
        .then(renderizarTabela)
        .catch(exibirErro);
};

const renderizarTabela = (dados) => {
    const container = document.getElementById("transacoes-body");
    const transacoes = dados.content;

    if (transacoes === null || transacoes === undefined || transacoes.length === 0) {
        container.innerHTML = "<div class='empty-state'><i class='pi pi-inbox'></i><p>Nenhuma transação cadastrada</p></div>";
        document.getElementById("transacoes-pagination").innerHTML = "";
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead><tr><th>Descrição</th><th>Valor</th><th>Tipo</th><th>Data</th><th>Categoria</th><th>Conta</th><th></th></tr></thead>
                <tbody>
                    ${transacoes.map(t => `
                        <tr>
                            <td>
                                ${t.descricao}
                            </td>

                            <td style="font-weight:600;color:${t.tipo === "RECEITA" ? "var(--success)" : "var(--danger)"}">
                                ${t.tipo === "RECEITA" ? "+" : "-"} ${formatarMoeda(t.valor)}
                            </td>

                            <td>
                                <span class="badge ${t.tipo === "RECEITA" ? "badge-success" : "badge-danger"}">
                                    ${t.tipo}
                                </span>
                            </td>

                            <td>
                                ${formatarData(t.data)}
                            </td>

                            <td>
                                ${t.categoriaNome ?? "-"}
                            </td>

                            <td>    
                                ${t.contaNome ?? "-"}
                            </td>
                            <td>
                                <button class="btn btn-danger btn-excluir-transacao" data-id="${t.id}">
                                    <i class="pi pi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;

    container.querySelectorAll(".btn-excluir-transacao").forEach(btn => {
        btn.addEventListener("click", () => excluir(btn.dataset.id));
    });

    renderizarPaginacao(dados);
};

const renderizarPaginacao = (dados) => {
    const paginacao = document.getElementById("transacoes-pagination");
    paginacao.innerHTML = `
        <button ${paginaAtual === 0 ? "disabled" : ""} id="pag-prev">Anterior</button>
        <span>Página ${paginaAtual + 1} de ${dados.totalPages}</span>
        <button ${paginaAtual >= dados.totalPages - 1 ? "disabled" : ""} id="pag-next">Próxima</button>
    `;
    document.getElementById("pag-prev")?.addEventListener("click", () => carregar(paginaAtual - 1));
    document.getElementById("pag-next")?.addEventListener("click", () => carregar(paginaAtual + 1));
};

const abrirModal = () => {
    document.getElementById("form-transacao").reset();
    document.getElementById("transacao-data").value = "";
    document.getElementById("transacao-data-display").value = "";
    document.getElementById("converted-value").textContent = "—";
    dpDataSelecionada = null;
    document.getElementById("modal-transacao").classList.remove("hidden");
};

const fecharModal = () => {
    document.getElementById("modal-transacao").classList.add("hidden");
};

const salvar = (e) => {
    e.preventDefault();
    const payload = {
        descricao: document.getElementById("transacao-descricao").value,
        valor: parseFloat(document.getElementById("transacao-valor").value),
        tipo: document.getElementById("transacao-tipo").value,
        data: document.getElementById("transacao-data").value,
        categoriaId: document.getElementById("transacao-categoria").value || null,
        contaId: document.getElementById("transacao-conta").value || null,
    };
    
    if (payload.categoriaId !== null) {
        payload.categoriaId = parseInt(payload.categoriaId);
    }

    if (payload.contaId !== null) {
        payload.contaId = parseInt(payload.contaId);
    }

    criarTransacao(payload)
        .then(() => {
            exibirSucesso("Transação criada com sucesso");
            fecharModal();
            carregar(paginaAtual);
        })
        .catch(exibirErro);
};

const excluir = (id) => {
    if (!confirm("Deseja excluir esta transação?")) {
        return;
    }
    excluirTransacao(id)
        .then(() => {
            exibirSucesso("Transação excluída");
            carregar(paginaAtual);
        })
        .catch(exibirErro);
};

export { iniciarTransacoes };
