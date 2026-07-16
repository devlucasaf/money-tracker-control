import { formatarMoeda, formatarData, exibirSucesso, exibirErro, obterMoedaUsuario, confirmar } from "../util.js";
import { pesquisarTransacoes, criarTransacao, excluirTransacao } from "../remotes/transacoes/transacoesRemote.js";
import { pesquisarCategorias } from "../remotes/categorias/categoriasRemote.js";
import { pesquisarContas } from "../remotes/contas/contasRemote.js";
import { criarDatepicker } from "../datepicker.js";

let paginaAtual = 0;
let dpMes, dpAno, dpDataSelecionada;
let debounceBusca;
let dpFiltroInicio, dpFiltroFim;

// --- TAXAS DE CÂMBIO ---
const TAXAS_FALLBACK = {
    USD: 5.1,
    EUR: 5.6,
    GBP: 6.5,
    ARS: 0.006,
    JPY: 0.034,
    BRL: 1,
    CAD: 3.8
};

// --- INICIALIZAÇÃO DA PÁGINA ---
const iniciarTransacoes = () => {
    carregarDependencias();
    carregar(0);

    // --- EVENTOS DO MODAL ---
    document.getElementById("btn-nova-transacao").addEventListener("click", abrirModal);
    document.getElementById("modal-transacao-close").addEventListener("click", fecharModal);
    document.getElementById("modal-transacao-cancel").addEventListener("click", fecharModal);
    document.getElementById("form-transacao").addEventListener("submit", salvar);

    // --- MOSTRA/ESCONDE A FREQUÊNCIA CONFORME O CHECKBOX ---
    document.getElementById("transacao-recorrente").addEventListener("change", (e) => {
        document.getElementById("grupo-frequencia").classList.toggle("hidden", !e.target.checked);
        if (e.target.checked) {
            document.getElementById("transacao-parcelar").checked = false;
            document.getElementById("grupo-parcelas").classList.add("hidden");
        }
    });

    // --- MOSTRA/ESCONDE O Nº DE PARCELAS CONFORME O CHECKBOX ---
    document.getElementById("transacao-parcelar").addEventListener("change", (e) => {
        document.getElementById("grupo-parcelas").classList.toggle("hidden", !e.target.checked);
        if (e.target.checked) {
            document.getElementById("transacao-recorrente").checked = false;
            document.getElementById("grupo-frequencia").classList.add("hidden");
        }
        atualizarPreviewParcelas();
    });

    // --- ATUALIZA A PRÉVIA DO VALOR DA PARCELA ---
    document.getElementById("transacao-parcelas").addEventListener("input", atualizarPreviewParcelas);
    document.getElementById("transacao-valor").addEventListener("input", atualizarPreviewParcelas);

    // --- RECÁLCULO DA CONVERSÃO AO DIGITAR O VALOR ---
    document.getElementById("transacao-valor").addEventListener("input", converterMoeda);

    // --- CUSTOM SELECT DE MOEDA ---
    const toggleMoeda = document.getElementById("converter-moeda-toggle");
    const wrapperMoeda = document.getElementById("converter-moeda-wrapper");
    const opcoesMoeda = document.getElementById("converter-moeda-options");

    // --- ABRIR/FECHAR O DROPDOWN DE MOEDA ---
    toggleMoeda.addEventListener("click", () => {
        wrapperMoeda.classList.toggle("open");
    });

    // --- FECHAR O DROPDOWN AO CLICAR FORA ---
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#converter-moeda-wrapper")) {
            wrapperMoeda.classList.remove("open");
        }
    });

    // --- SELEÇÃO DE UMA MOEDA ---
    opcoesMoeda.querySelectorAll(".custom-select-option").forEach(opt => {
        opt.addEventListener("click", () => {
            opcoesMoeda.querySelectorAll(".custom-select-option").forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
            document.getElementById("converter-moeda-label").textContent = opt.textContent;
            document.getElementById("converter-moeda").value = opt.dataset.value;
            wrapperMoeda.classList.remove("open");
            converterMoeda();
        });
    });

    inicializarCalendario();
    configurarFiltros();
};

// --- CONFIGURA OS EVENTOS DA BARRA DE FILTROS ---
const configurarFiltros = () => {
    document.getElementById("filtro-busca").addEventListener("input", () => {
        clearTimeout(debounceBusca);
        debounceBusca = setTimeout(() => carregar(0), 350);
    });

    document.getElementById("filtro-tag").addEventListener("input", () => {
        clearTimeout(debounceBusca);
        debounceBusca = setTimeout(() => carregar(0), 350);
    });

    ["filtro-tipo", "filtro-categoria", "filtro-conta"]
        .forEach(id => {
            document.getElementById(id).addEventListener("change", () => carregar(0));
        });

    // --- DATEPICKERS DE INÍCIO E FIM ---
    dpFiltroInicio = criarDatepicker({
        placeholder: "Data inicial",
        classeInput: "filtro-select",
        aoSelecionar: () => carregar(0),
    });

    dpFiltroFim = criarDatepicker({
        placeholder: "Data final",
        classeInput: "filtro-select",
        aoSelecionar: () => carregar(0),
    });

    document.getElementById("filtro-data-inicio").appendChild(dpFiltroInicio.element);
    document.getElementById("filtro-data-fim").appendChild(dpFiltroFim.element);

    // --- LIMPAR FILTROS ---
    document.getElementById("btn-limpar-filtros").addEventListener("click", () => {
        document.getElementById("filtro-busca").value = "";
        document.getElementById("filtro-tag").value = "";
        ["filtro-tipo", "filtro-categoria", "filtro-conta"].forEach(id => {
            const sel = document.getElementById(id);
            sel.value = "";
            sel.dispatchEvent(new Event("change", { bubbles: true }));
        });
        dpFiltroInicio.limpar();
        dpFiltroFim.limpar();
        carregar(0);
    });
};

// --- LÊ OS FILTROS ATUAIS ---
const obterFiltros = () => ({
    busca: document.getElementById("filtro-busca").value.trim(),
    tipo: document.getElementById("filtro-tipo").value,
    categoriaId: document.getElementById("filtro-categoria").value,
    contaId: document.getElementById("filtro-conta").value,
    dataInicio: dpFiltroInicio ? dpFiltroInicio.getValor() : "",
    dataFim: dpFiltroFim ? dpFiltroFim.getValor() : "",
    tag: document.getElementById("filtro-tag").value.trim(),
});

// --- ATUALIZA A PRÉVIA DO VALOR DAS PARCELAS ---
const atualizarPreviewParcelas = () => {
    const preview = document.getElementById("parcelas-preview");
    if (!preview) {
        return;
    }
    const total = parseFloat(document.getElementById("transacao-valor").value);
    const parcelas = parseInt(document.getElementById("transacao-parcelas").value);
    if (!total || !parcelas || parcelas < 2) {
        preview.textContent = "";
        return;
    }
    preview.textContent = `${parcelas}x de ${formatarMoeda(total / parcelas)} (total ${formatarMoeda(total)})`;
};

// --- CONVERSOR DE MOEDA ---
const converterMoeda = () => {
    const valor = parseFloat(document.getElementById("transacao-valor").value);
    const moedaDestino = document.getElementById("converter-moeda").value;
    const elementoResultado = document.getElementById("converted-value");
    const moedaBase = obterMoedaUsuario();

    if (!valor || isNaN(valor)) {
        elementoResultado.textContent = "\u2014";
        return;
    }

    if (moedaBase === moedaDestino) {
        elementoResultado.textContent = formatarValorConvertido(valor, moedaDestino);
        return;
    }

    // --- BUSCA A COTAÇÃO NA API E CONVERTE ---
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

// --- CONVERSÃO USANDO TAXAS LOCAIS ---
const conversaoFallback = (valor, de, para, elemento) => {
    const taxaDe = TAXAS_FALLBACK[de] || 1;
    const taxaPara = TAXAS_FALLBACK[para] || 1;
    const emBRL = valor * taxaDe;
    const convertido = emBRL / taxaPara;
    elemento.textContent = `\u2248 ${formatarValorConvertido(convertido, para)}`;
};

// --- FORMATAÇÃO DO VALOR CONVERTIDO ---
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

// --- CALENDÁRIO ---
const inicializarCalendario = () => {
    const hoje = new Date();
    dpMes = hoje.getMonth();
    dpAno = hoje.getFullYear();
    dpDataSelecionada = null;

    const exibicao = document.getElementById("transacao-data-display");
    const dropdown = document.getElementById("datepicker-dropdown");

    // --- ABRIR/FECHAR O CALENDÁRIO ---
    exibicao.addEventListener("click", () => {
        dropdown.classList.toggle("open");
        dropdown.classList.remove("showing-years");
        renderizarCalendario();
    });

    document.getElementById("dp-prev").addEventListener("click", () => {
        dpMes--;
        if (dpMes < 0) {
            dpMes = 11; dpAno--;
        }
        renderizarCalendario();
    });

    document.getElementById("dp-next").addEventListener("click", () => {
        dpMes++;
        if (dpMes > 11) {
            dpMes = 0; dpAno++;
        }
        renderizarCalendario();
    });

    document.getElementById("dp-title").addEventListener("click", () => {
        const aberto = dropdown.classList.toggle("showing-years");
        if (aberto) {
            renderizarAnos();
        }
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest("#datepicker-wrapper")) {
            dropdown.classList.remove("open");
            dropdown.classList.remove("showing-years");
        }
    });
};

// --- RENDERIZAÇÃO DA LISTA DE ANOS ---
const renderizarAnos = () => {
    const container = document.getElementById("dp-years");
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

        if (ano === dpAno) {
            el.classList.add("selected");
        }

        el.addEventListener("click", () => {
            dpAno = ano;
            document.getElementById("datepicker-dropdown").classList.remove("showing-years");
            renderizarCalendario();
        });
        container.appendChild(el);
    }

    // --- ROLA ATÉ O ANO SELECIONADO ---
    const selecionado = container.querySelector(".selected");
    if (selecionado) {
        selecionado.scrollIntoView({
            block: "center"
        });
    }
};

// --- RENDERIZAÇÃO DO CALENDÁRIO ---
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

    // --- CÁLCULO DO PRIMEIRO DIA E TOTAL DE DIAS DO MÊS ---
    const primeiroDia = new Date(dpAno, dpMes, 1).getDay();
    const diasNoMes = new Date(dpAno, dpMes + 1, 0).getDate();
    const hoje = new Date();

    // --- ESPAÇOS VAZIOS ANTES DO PRIMEIRO DIA ---
    for (let i = 0; i < primeiroDia; i++) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "datepicker-day other-month";
        containerDias.appendChild(el);
    }

    // --- GERAÇÃO DOS DIAS DO MÊS ---
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

// --- SELEÇÃO DE UMA DATA ---
const selecionarData = (dia) => {
    dpDataSelecionada = new Date(dpAno, dpMes, dia);
    const iso = `${dpAno}-${String(dpMes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    document.getElementById("transacao-data").value = iso;
    document.getElementById("transacao-data-display").value = new Intl.DateTimeFormat("pt-BR").format(dpDataSelecionada);
    document.getElementById("datepicker-dropdown").classList.remove("open");
};

// --- CARREGAMENTO DE CATEGORIAS E CONTAS ---
const carregarDependencias = () => {
    pesquisarCategorias()
        .then(categorias => {
            const select = document.getElementById("transacao-categoria");
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

            // --- POPULA O FILTRO DE CATEGORIA ---
            const filtro = document.getElementById("filtro-categoria");
            if (filtro) {
                categorias.forEach(c => {
                    const opt = document.createElement("option");
                    opt.value = c.id;
                    opt.textContent = c.nome;
                    filtro.appendChild(opt);
                });
            }
        })
        .catch(exibirErro);

    // --- CONTAS ---
    pesquisarContas()
        .then(contas => {
            const select = document.getElementById("transacao-conta");
            select.innerHTML = "";
            const optPadrao = document.createElement("option");
            optPadrao.value = "";
            optPadrao.textContent = "Selecione...";
            select.appendChild(optPadrao);
            contas.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.id;
                opt.textContent = c.nome;
                select.appendChild(opt);
            });

            // --- POPULA O FILTRO DE CONTA ---
            const filtro = document.getElementById("filtro-conta");
            if (filtro) {
                contas.forEach(c => {
                    const opt = document.createElement("option");
                    opt.value = c.id;
                    opt.textContent = c.nome;
                    filtro.appendChild(opt);
                });
            }
        })
        .catch(exibirErro);
};

// --- CARREGAMENTO DAS TRANSAÇÕES ---
const carregar = (pagina) => {
    paginaAtual = pagina;
    pesquisarTransacoes({ page: pagina, size: 10, ...obterFiltros() })
        .then(renderizarTabela)
        .catch(exibirErro);
};

// --- RENDERIZAÇÃO DA TABELA DE TRANSAÇÕES ---
const renderizarTabela = (dados) => {
    const container = document.getElementById("transacoes-body");
    const transacoes = dados.content;

    if (transacoes === null || transacoes === undefined || transacoes.length === 0) {
        const tplVazio = document.getElementById("tpl-transacoes-vazio");
        container.innerHTML = "";
        container.appendChild(tplVazio.content.cloneNode(true));
        document.getElementById("transacoes-pagination").innerHTML = "";
        return;
    }

    // --- MONTAGEM DA TABELA A PARTIR DOS TEMPLATES ---
    const tplTabela = document.getElementById("tpl-transacoes-tabela");
    const tplLinha = document.getElementById("tpl-transacoes-linha");

    container.innerHTML = "";
    container.appendChild(tplTabela.content.cloneNode(true));

    // --- PREENCHIMENTO DAS LINHAS ---
    const tbody = container.querySelector("#transacoes-tbody");
    transacoes.forEach(t => {
        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector("tr");

        const tdDescricao = tr.querySelector("[data-campo='descricao']");
        tdDescricao.textContent = t.descricao;
        if (t.recorrente) {
            const selo = document.createElement("span");

            selo.className = "badge badge-info badge-recorrente";
            selo.innerHTML = '<i class="pi pi-sync"></i> Recorrente';
            selo.title = t.frequencia === "SEMANAL" ? "Repete semanalmente" : "Repete mensalmente";

            tdDescricao.appendChild(selo);
        }

        // --- CHIPS DE TAGS ---
        if (t.tags && t.tags.length > 0) {
            const wrap = document.createElement("div");
            wrap.className = "tag-chips";
            t.tags.forEach(tag => {
                const chip = document.createElement("span");
                chip.className = "tag-chip";
                chip.textContent = tag;
                chip.title = "Filtrar por esta tag";
                chip.addEventListener("click", () => {
                    document.getElementById("filtro-tag").value = tag;
                    carregar(0);
                });
                wrap.appendChild(chip);
            });
            tdDescricao.appendChild(wrap);
        }

        // --- VALOR ---
        const tdValor = tr.querySelector("[data-campo='valor']");
        tdValor.style.fontWeight = "600";
        tdValor.style.color = t.tipo === "RECEITA" ? "var(--success)" : "var(--danger)";
        tdValor.textContent = `${t.tipo === "RECEITA" ? "+" : "-"} ${formatarMoeda(t.valor)}`;

        // --- BADGE DO TIPO ---
        const tdTipo = tr.querySelector("[data-campo='tipo']");
        const badge = document.createElement("span");
        badge.className = `badge ${t.tipo === "RECEITA" ? "badge-success" : "badge-danger"}`;
        badge.textContent = t.tipo;
        tdTipo.appendChild(badge);

        tr.querySelector("[data-campo='data']").textContent = formatarData(t.data);
        tr.querySelector("[data-campo='categoria']").textContent = t.categoriaNome ?? "-";
        tr.querySelector("[data-campo='conta']").textContent = t.contaNome ?? "-";

        // --- BOTÃO DE EXCLUIR ---
        const tdAcoes = tr.querySelector("[data-campo='acoes']");
        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-danger btn-excluir-transacao";
        btnExcluir.dataset.id = t.id;
        const icone = document.createElement("i");
        icone.className = "pi pi-trash";
        btnExcluir.appendChild(icone);
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });

    // --- VÍNCULO DOS BOTÕES DE EXCLUSÃO ---
    container.querySelectorAll(".btn-excluir-transacao").forEach(btn => {
        btn.addEventListener("click", () => excluir(btn.dataset.id));
    });

    renderizarPaginacao(dados);
};

// --- RENDERIZAÇÃO DA PAGINAÇÃO ---
const renderizarPaginacao = (dados) => {
    const paginacao = document.getElementById("transacoes-pagination");
    const tplPag = document.getElementById("tpl-transacoes-paginacao");

    paginacao.innerHTML = "";
    paginacao.appendChild(tplPag.content.cloneNode(true));

    const btnPrev = paginacao.querySelector("#pag-prev");
    const btnNext = paginacao.querySelector("#pag-next");
    const info = paginacao.querySelector("#pag-info");

    btnPrev.disabled = paginaAtual === 0;
    btnNext.disabled = paginaAtual >= dados.totalPages - 1;
    info.textContent = `Página ${paginaAtual + 1} de ${dados.totalPages}`;

    btnPrev.addEventListener("click", () => carregar(paginaAtual - 1));
    btnNext.addEventListener("click", () => carregar(paginaAtual + 1));
};

// --- ABERTURA DO MODAL ---
const abrirModal = () => {
    document.getElementById("form-transacao").reset();
    document.getElementById("transacao-data").value = "";
    document.getElementById("transacao-data-display").value = "";
    document.getElementById("converted-value").textContent = "\u2014";

    // --- RESET DO CONVERSOR DE MOEDA ---
    document.getElementById("converter-moeda").value = "USD";
    document.getElementById("converter-moeda-label").textContent = "🇺🇸 Dólar (USD)";
    const opcoes = document.getElementById("converter-moeda-options");
    opcoes.querySelectorAll(".custom-select-option").forEach(o => o.classList.remove("selected"));
    opcoes.querySelector("[data-value='USD']").classList.add("selected");

    dpDataSelecionada = null;

    // --- RESET DA RECORRÊNCIA ---
    document.getElementById("transacao-recorrente").checked = false;
    document.getElementById("grupo-frequencia").classList.add("hidden");

    // --- RESET DE TAGS E PARCELAMENTO ---
    document.getElementById("transacao-tags").value = "";
    document.getElementById("transacao-parcelar").checked = false;
    document.getElementById("grupo-parcelas").classList.add("hidden");
    document.getElementById("transacao-parcelas").value = "2";
    document.getElementById("parcelas-preview").textContent = "";

    document.getElementById("modal-transacao").classList.remove("hidden");
};

// --- FECHAMENTO DO MODAL ---
const fecharModal = () => {
    document.getElementById("modal-transacao").classList.add("hidden");
};

// --- SALVAR TRANSAÇÃO ---
const salvar = (e) => {
    e.preventDefault();

    // --- MONTAGEM DO PAYLOAD ---
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

    const tagsRaw = document.getElementById("transacao-tags").value;
    payload.tags = tagsRaw.split(",").map(t => t.trim()).filter(t => t.length > 0);

    if (document.getElementById("transacao-parcelar").checked) {
        payload.parcelas = parseInt(document.getElementById("transacao-parcelas").value) || 1;
    }

    // --- RECORRÊNCIA ---
    const recorrente = document.getElementById("transacao-recorrente").checked;
    payload.recorrente = recorrente;
    if (recorrente) {
        payload.frequencia = document.getElementById("transacao-frequencia").value;
    }

    // --- ENVIO AO BACKEND ---
    criarTransacao(payload)
        .then(() => {
            exibirSucesso("Transação criada com sucesso");
            fecharModal();
            carregar(paginaAtual);
        })
        .catch(exibirErro);
};

// --- EXCLUSÃO DE TRANSAÇÃO ---
const excluir = (id) => {
    confirmar({
        titulo: "Excluir transação",
        mensagem: "Deseja realmente excluir esta transação? Esta ação não pode ser desfeita.",
    }).then((confirmado) => {
        if (!confirmado) {
            return;
        }
        excluirTransacao(id).then(() => {
                exibirSucesso("Transação excluída");
                carregar(paginaAtual);
            })
            .catch(exibirErro);
    });
};

export { iniciarTransacoes };
