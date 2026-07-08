import { formatarMoeda, exibirSucesso, exibirErro } from '../util.js';
import { pesquisarOrcamentos, criarOrcamento, excluirOrcamento } from '../remotes/orcamentos/orcamentosRemote.js';
import { pesquisarCategorias } from '../remotes/categorias/categoriasRemote.js';

const iniciarOrcamentos = () => {
    carregar();
    carregarCategorias();
    document.getElementById('btn-novo-orcamento').addEventListener('click', abrirModal);
    document.getElementById('modal-orcamento-close').addEventListener('click', fecharModal);
    document.getElementById('modal-orcamento-cancel').addEventListener('click', fecharModal);
    document.getElementById('form-orcamento').addEventListener('submit', salvar);
};

const carregarCategorias = () => {
    pesquisarCategorias()
        .then(categorias => {
            const select = document.getElementById('orcamento-categoria');
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
};

const carregar = () => {
    pesquisarOrcamentos()
        .then(renderizarTabela)
        .catch(exibirErro);
};

const renderizarTabela = (orcamentos) => {
    const container = document.getElementById('orcamentos-body');

    if (orcamentos === null || orcamentos === undefined || orcamentos.length === 0) {
        const tplVazio = document.getElementById('tpl-orcamentos-vazio');
        container.innerHTML = '';
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    const tplTabela = document.getElementById('tpl-orcamentos-tabela');
    const tplLinha = document.getElementById('tpl-orcamentos-linha');

    container.innerHTML = '';
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector('#orcamentos-tbody');
    orcamentos.forEach(o => {
        const gasto = o.valorGasto ?? 0;
        const disponivel = o.valorLimite - gasto;
        const percentual = o.valorLimite > 0 ? Math.min((gasto / o.valorLimite) * 100, 100) : 0;
        const cor = percentual >= 90 ? 'var(--danger)' : percentual >= 70 ? 'var(--warning)' : 'var(--success)';

        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector('tr');

        tr.querySelector('[data-campo="categoria"]').textContent = o.categoriaNome ?? '-';
        tr.querySelector('[data-campo="limite"]').textContent = formatarMoeda(o.valorLimite);

        const fill = tr.querySelector('[data-campo="fill"]');
        fill.style.width = `${percentual}%`;
        fill.style.background = cor;

        tr.querySelector('[data-campo="gasto-texto"]').textContent = `${formatarMoeda(gasto)} (${percentual.toFixed(0)}%)`;

        const tdDisponivel = tr.querySelector('[data-campo="disponivel"]');
        tdDisponivel.style.fontWeight = '600';
        tdDisponivel.style.color = disponivel >= 0 ? 'var(--success)' : 'var(--danger)';
        tdDisponivel.textContent = formatarMoeda(disponivel);

        tr.querySelector('[data-campo="mesAno"]').textContent = o.mesAno ?? '-';

        const tdAcoes = tr.querySelector('[data-campo="acoes"]');
        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'btn btn-danger btn-excluir-orcamento';
        btnExcluir.dataset.id = o.id;
        const icone = document.createElement('i');
        icone.className = 'pi pi-trash';
        btnExcluir.appendChild(icone);
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });

    container.querySelectorAll('.btn-excluir-orcamento').forEach(btn => {
        btn.addEventListener('click', () => excluir(btn.dataset.id));
    });
};

const abrirModal = () => {
    document.getElementById('form-orcamento').reset();
    document.getElementById('modal-orcamento').classList.remove('hidden');
};

const fecharModal = () => {
    document.getElementById('modal-orcamento').classList.add('hidden');
};

const salvar = (e) => {
    e.preventDefault();
    const payload = {
        categoriaId: parseInt(document.getElementById('orcamento-categoria').value),
        valorLimite: parseFloat(document.getElementById('orcamento-valorLimite').value),
        mesAno:      document.getElementById('orcamento-mesAno').value,
    };

    criarOrcamento(payload)
        .then(() => {
            exibirSucesso('Orçamento criado');
            fecharModal();
            carregar();
        })
        .catch(exibirErro);
};

const excluir = (id) => {
    if (!confirm('Deseja excluir este orçamento?')) return;
    excluirOrcamento(id)
        .then(() => { exibirSucesso('Orçamento excluído'); carregar(); })
        .catch(exibirErro);
};

export { iniciarOrcamentos };
