import { formatCurrency, showSuccess, showError } from '../util.js';
import { pesquisarOrcamentos, criarOrcamento, excluirOrcamento } from '../remotes/orcamentos/orcamentosRemote.js';
import { pesquisarCategorias } from '../remotes/categorias/categoriasRemote.js';

const initOrcamentos = () => {
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
            select.innerHTML = '<option value="">Selecione...</option>';
            categorias.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
            });
        })
        .catch(showError);
};

const carregar = () => {
    pesquisarOrcamentos()
        .then(renderTabela)
        .catch(showError);
};

const renderTabela = (orcamentos) => {
    const container = document.getElementById('orcamentos-body');

    if (orcamentos === null || orcamentos === undefined || orcamentos.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="pi pi-chart-pie"></i><p>Nenhum orçamento cadastrado</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead><tr><th>Categoria</th><th>Limite</th><th>Gasto</th><th>Disponível</th><th>Mês/Ano</th><th></th></tr></thead>
                <tbody>
                    ${orcamentos.map(o => {
                        const gasto = o.valorGasto ?? 0;
                        const disponivel = o.valorLimite - gasto;
                        const percentual = o.valorLimite > 0 ? Math.min((gasto / o.valorLimite) * 100, 100) : 0;
                        const cor = percentual >= 90 ? 'var(--danger)' : percentual >= 70 ? 'var(--warning)' : 'var(--success)';
                        return `
                        <tr>
                            <td>${o.categoriaNome ?? '-'}</td>
                            <td>${formatCurrency(o.valorLimite)}</td>
                            <td>
                                <div class="progress-bar" style="margin-bottom:4px">
                                    <div class="fill" style="width:${percentual}%;background:${cor}"></div>
                                </div>
                                <small>${formatCurrency(gasto)} (${percentual.toFixed(0)}%)</small>
                            </td>
                            <td style="font-weight:600;color:${disponivel >= 0 ? 'var(--success)' : 'var(--danger)'}">${formatCurrency(disponivel)}</td>
                            <td>${o.mesAno ?? '-'}</td>
                            <td><button class="btn btn-danger btn-excluir-orcamento" data-id="${o.id}"><i class="pi pi-trash"></i></button></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

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
            showSuccess('Orçamento criado');
            fecharModal();
            carregar();
        })
        .catch(showError);
};

const excluir = (id) => {
    if (!confirm('Deseja excluir este orçamento?')) {
        return;
    }
    excluirOrcamento(id)
        .then(() => { showSuccess('Orçamento excluído'); carregar(); })
        .catch(showError);
};

export { initOrcamentos };
