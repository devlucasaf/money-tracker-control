import { formatarMoeda, formatarData, exibirSucesso, exibirErro, obterMoedaUsuario } from '../util.js';
import { pesquisarTransacoes, criarTransacao, excluirTransacao } from '../remotes/transacoes/transacoesRemote.js';
import { pesquisarCategorias } from '../remotes/categorias/categoriasRemote.js';
import { pesquisarContas } from '../remotes/contas/contasRemote.js';

let paginaAtual = 0;
let dpMes, dpAno, dpDataSelecionada;

const TAXAS_FALLBACK = { USD: 5.1, EUR: 5.6, GBP: 6.5, ARS: 0.006, JPY: 0.034, BRL: 1, CAD: 3.8 };

const iniciarTransacoes = () => {
    carregarDependencias();
    carregar(0);

    document.getElementById('btn-nova-transacao').addEventListener('click', abrirModal);
    document.getElementById('modal-transacao-close').addEventListener('click', fecharModal);
    document.getElementById('modal-transacao-cancel').addEventListener('click', fecharModal);
    document.getElementById('form-transacao').addEventListener('submit', salvar);

    document.getElementById('transacao-valor').addEventListener('input', converterMoeda);

    const toggleMoeda = document.getElementById('converter-moeda-toggle');
    const wrapperMoeda = document.getElementById('converter-moeda-wrapper');
    const opcoesMoeda = document.getElementById('converter-moeda-options');

    toggleMoeda.addEventListener('click', () => {
        wrapperMoeda.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#converter-moeda-wrapper')) {
            wrapperMoeda.classList.remove('open');
        }
    });

    opcoesMoeda.querySelectorAll('.custom-select-option').forEach(opt => {
        opt.addEventListener('click', () => {
            opcoesMoeda.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            document.getElementById('converter-moeda-label').textContent = opt.textContent;
            document.getElementById('converter-moeda').value = opt.dataset.value;
            wrapperMoeda.classList.remove('open');
            converterMoeda();
        });
    });

    inicializarCalendario();
};

// ---- CONVERSOR DE MOEDA ----
const converterMoeda = () => {
    const valor = parseFloat(document.getElementById('transacao-valor').value);
    const moedaDestino = document.getElementById('converter-moeda').value;
    const elementoResultado = document.getElementById('converted-value');
    const moedaBase = obterMoedaUsuario();

    if (!valor || isNaN(valor)) {
        elementoResultado.textContent = '\u2014';
        return;
    }

    if (moedaBase === moedaDestino) {
        elementoResultado.textContent = formatarValorConvertido(valor, moedaDestino);
        return;
    }

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
    elemento.textContent = `\u2248 ${formatarValorConvertido(convertido, para)}`;
};

const formatarValorConvertido = (valor, moeda) => {
    const locales = { 
        USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB',
        ARS: 'es-AR', JPY: 'ja-JP', BRL: 'pt-BR', CAD: 'en-CA'
    };
    return new Intl.NumberFormat(locales[moeda] || 'en-US', { style: 'currency', currency: moeda }).format(valor);
};

// ---- CALENDARIO PERSONALIZADO ----
const inicializarCalendario = () => {
    const hoje = new Date();
    dpMes = hoje.getMonth();
    dpAno = hoje.getFullYear();
    dpDataSelecionada = null;

    const exibicao = document.getElementById('transacao-data-display');
    const dropdown = document.getElementById('datepicker-dropdown');

    exibicao.addEventListener('click', () => {
        dropdown.classList.toggle('open');
        renderizarCalendario();
    });

    document.getElementById('dp-prev').addEventListener('click', () => {
        dpMes--;
        if (dpMes < 0) { dpMes = 11; dpAno--; }
        renderizarCalendario();
    });

    document.getElementById('dp-next').addEventListener('click', () => {
        dpMes++;
        if (dpMes > 11) { dpMes = 0; dpAno++; }
        renderizarCalendario();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#datepicker-wrapper')) {
            dropdown.classList.remove('open');
        }
    });
};

const renderizarCalendario = () => {
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    document.getElementById('dp-month-year').textContent = `${meses[dpMes]} ${dpAno}`;

    const containerDias = document.getElementById('dp-days');
    containerDias.innerHTML = '';

    const primeiroDia = new Date(dpAno, dpMes, 1).getDay();
    const diasNoMes = new Date(dpAno, dpMes + 1, 0).getDate();
    const hoje = new Date();

    for (let i = 0; i < primeiroDia; i++) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'datepicker-day other-month';
        containerDias.appendChild(el);
    }

    for (let d = 1; d <= diasNoMes; d++) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'datepicker-day';
        el.textContent = d;

        const ehHoje = d === hoje.getDate() && dpMes === hoje.getMonth() && dpAno === hoje.getFullYear();
        if (ehHoje) el.classList.add('today');

        if (dpDataSelecionada && d === dpDataSelecionada.getDate() && dpMes === dpDataSelecionada.getMonth() && dpAno === dpDataSelecionada.getFullYear()) {
            el.classList.add('selected');
        }

        el.addEventListener('click', () => selecionarData(d));
        containerDias.appendChild(el);
    }
};

const selecionarData = (dia) => {
    dpDataSelecionada = new Date(dpAno, dpMes, dia);
    const iso = `${dpAno}-${String(dpMes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    document.getElementById('transacao-data').value = iso;
    document.getElementById('transacao-data-display').value = new Intl.DateTimeFormat('pt-BR').format(dpDataSelecionada);
    document.getElementById('datepicker-dropdown').classList.remove('open');
};

// ---- LOGICA PRINCIPAL ----
const carregarDependencias = () => {
    pesquisarCategorias()
        .then(categorias => {
            const select = document.getElementById('transacao-categoria');
            select.innerHTML = '';
            const optPadrao = document.createElement('option');
            optPadrao.value = '';
            optPadrao.textContent = 'Selecione...';
            select.appendChild(optPadrao);
            categorias.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.nome;
                select.appendChild(opt);
            });
        })
        .catch(exibirErro);

    pesquisarContas()
        .then(contas => {
            const select = document.getElementById('transacao-conta');
            select.innerHTML = '';
            const optPadrao = document.createElement('option');
            optPadrao.value = '';
            optPadrao.textContent = 'Selecione...';
            select.appendChild(optPadrao);
            contas.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.nome;
                select.appendChild(opt);
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
    const container = document.getElementById('transacoes-body');
    const transacoes = dados.content;

    if (transacoes === null || transacoes === undefined || transacoes.length === 0) {
        const tplVazio = document.getElementById('tpl-transacoes-vazio');
        container.innerHTML = '';
        container.appendChild(tplVazio.content.cloneNode(true));
        document.getElementById('transacoes-pagination').innerHTML = '';
        return;
    }

    const tplTabela = document.getElementById('tpl-transacoes-tabela');
    const tplLinha = document.getElementById('tpl-transacoes-linha');

    container.innerHTML = '';
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector('#transacoes-tbody');
    transacoes.forEach(t => {
        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector('tr');

        tr.querySelector('[data-campo="descricao"]').textContent = t.descricao;

        const tdValor = tr.querySelector('[data-campo="valor"]');
        tdValor.style.fontWeight = '600';
        tdValor.style.color = t.tipo === 'RECEITA' ? 'var(--success)' : 'var(--danger)';
        tdValor.textContent = `${t.tipo === 'RECEITA' ? '+' : '-'} ${formatarMoeda(t.valor)}`;

        const tdTipo = tr.querySelector('[data-campo="tipo"]');
        const badge = document.createElement('span');
        badge.className = `badge ${t.tipo === 'RECEITA' ? 'badge-success' : 'badge-danger'}`;
        badge.textContent = t.tipo;
        tdTipo.appendChild(badge);

        tr.querySelector('[data-campo="data"]').textContent = formatarData(t.data);
        tr.querySelector('[data-campo="categoria"]').textContent = t.categoriaNome ?? '-';
        tr.querySelector('[data-campo="conta"]').textContent = t.contaNome ?? '-';

        const tdAcoes = tr.querySelector('[data-campo="acoes"]');
        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'btn btn-danger btn-excluir-transacao';
        btnExcluir.dataset.id = t.id;
        const icone = document.createElement('i');
        icone.className = 'pi pi-trash';
        btnExcluir.appendChild(icone);
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });

    container.querySelectorAll('.btn-excluir-transacao').forEach(btn => {
        btn.addEventListener('click', () => excluir(btn.dataset.id));
    });

    renderizarPaginacao(dados);
};

const renderizarPaginacao = (dados) => {
    const paginacao = document.getElementById('transacoes-pagination');
    const tplPag = document.getElementById('tpl-transacoes-paginacao');

    paginacao.innerHTML = '';
    paginacao.appendChild(tplPag.content.cloneNode(true));

    const btnPrev = paginacao.querySelector('#pag-prev');
    const btnNext = paginacao.querySelector('#pag-next');
    const info = paginacao.querySelector('#pag-info');

    btnPrev.disabled = paginaAtual === 0;
    btnNext.disabled = paginaAtual >= dados.totalPages - 1;
    info.textContent = `Página ${paginaAtual + 1} de ${dados.totalPages}`;

    btnPrev.addEventListener('click', () => carregar(paginaAtual - 1));
    btnNext.addEventListener('click', () => carregar(paginaAtual + 1));
};

const abrirModal = () => {
    document.getElementById('form-transacao').reset();
    document.getElementById('transacao-data').value = '';
    document.getElementById('transacao-data-display').value = '';
    document.getElementById('converted-value').textContent = '\u2014';
    document.getElementById('converter-moeda').value = 'USD';
    document.getElementById('converter-moeda-label').textContent = '🇺🇸 Dólar (USD)';
    const opcoes = document.getElementById('converter-moeda-options');
    opcoes.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
    opcoes.querySelector('[data-value="USD"]').classList.add('selected');
    dpDataSelecionada = null;
    document.getElementById('modal-transacao').classList.remove('hidden');
};

const fecharModal = () => {
    document.getElementById('modal-transacao').classList.add('hidden');
};

const salvar = (e) => {
    e.preventDefault();
    const payload = {
        descricao:      document.getElementById('transacao-descricao').value,
        valor:          parseFloat(document.getElementById('transacao-valor').value),
        tipo:           document.getElementById('transacao-tipo').value,
        data:           document.getElementById('transacao-data').value,
        categoriaId:    document.getElementById('transacao-categoria').value || null,
        contaId:        document.getElementById('transacao-conta').value || null,
    };
    
    if (payload.categoriaId !== null) payload.categoriaId = parseInt(payload.categoriaId);
    if (payload.contaId !== null) payload.contaId = parseInt(payload.contaId);

    criarTransacao(payload)
        .then(() => {
            exibirSucesso('Transação criada com sucesso');
            fecharModal();
            carregar(paginaAtual);
        })
        .catch(exibirErro);
};

const excluir = (id) => {
    if (!confirm('Deseja excluir esta transação?')) return;
    excluirTransacao(id)
        .then(() => {
            exibirSucesso('Transação excluída');
            carregar(paginaAtual);
        })
        .catch(exibirErro);
};

export { iniciarTransacoes };
