import { formatCurrency, formatDate, showSuccess, showError } from '../util.js';
import { pesquisarTransacoes, criarTransacao, excluirTransacao } from '../remotes/transacoes/transacoesRemote.js';
import { pesquisarCategorias } from '../remotes/categorias/categoriasRemote.js';
import { pesquisarContas } from '../remotes/contas/contasRemote.js';

let currentPage = 0;

const initTransacoes = () => {
    carregarDependencias();
    carregar(0);

    document.getElementById('btn-nova-transacao').addEventListener('click', abrirModal);
    document.getElementById('modal-transacao-close').addEventListener('click', fecharModal);
    document.getElementById('modal-transacao-cancel').addEventListener('click', fecharModal);
    document.getElementById('form-transacao').addEventListener('submit', salvar);
};

const carregarDependencias = () => {
    pesquisarCategorias()
        .then(categorias => {
            const select = document.getElementById('transacao-categoria');
            select.innerHTML = '<option value="">Selecione...</option>';
            categorias.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
            });
        })
        .catch(showError);

    pesquisarContas()
        .then(contas => {
            const select = document.getElementById('transacao-conta');
            select.innerHTML = '<option value="">Selecione...</option>';
            contas.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
            });
        })
        .catch(showError);
};

const carregar = (page) => {
    currentPage = page;
    pesquisarTransacoes({ page, size: 10 })
        .then(renderTabela)
        .catch(showError);
};

const renderTabela = (data) => {
    const container = document.getElementById('transacoes-body');
    const transacoes = data.content;

    if (transacoes === null || transacoes === undefined || transacoes.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="pi pi-inbox"></i><p>Nenhuma transação cadastrada</p></div>';
        document.getElementById('transacoes-pagination').innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead><tr><th>Descrição</th><th>Valor</th><th>Tipo</th><th>Data</th><th>Categoria</th><th>Conta</th><th></th></tr></thead>
                <tbody>
                    ${transacoes.map(t => `
                        <tr>
                            <td>${t.descricao}</td>
                            <td style="font-weight:600;color:${t.tipo === 'RECEITA' ? 'var(--success)' : 'var(--danger)'}">
                                ${t.tipo === 'RECEITA' ? '+' : '-'} ${formatCurrency(t.valor)}
                            </td>
                            <td><span class="badge ${t.tipo === 'RECEITA' ? 'badge-success' : 'badge-danger'}">${t.tipo}</span></td>
                            <td>${formatDate(t.data)}</td>
                            <td>${t.categoriaNome ?? '-'}</td>
                            <td>${t.contaNome ?? '-'}</td>
                            <td><button class="btn btn-danger btn-excluir-transacao" data-id="${t.id}"><i class="pi pi-trash"></i></button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.querySelectorAll('.btn-excluir-transacao').forEach(btn => {
        btn.addEventListener('click', () => excluir(btn.dataset.id));
    });

    renderPagination(data);
};

const renderPagination = (data) => {
    const pagination = document.getElementById('transacoes-pagination');
    pagination.innerHTML = `
        <button ${currentPage === 0 ? 'disabled' : ''} id="pag-prev">Anterior</button>
        <span>Página ${currentPage + 1} de ${data.totalPages}</span>
        <button ${currentPage >= data.totalPages - 1 ? 'disabled' : ''} id="pag-next">Próxima</button>
    `;
    document.getElementById('pag-prev')?.addEventListener('click', () => carregar(currentPage - 1));
    document.getElementById('pag-next')?.addEventListener('click', () => carregar(currentPage + 1));
};

const abrirModal = () => {
    document.getElementById('form-transacao').reset();
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
    
    if (payload.categoriaId !== null) {
        payload.categoriaId = parseInt(payload.categoriaId);
    }

    if (payload.contaId !== null) {
        payload.contaId = parseInt(payload.contaId);
    }

    criarTransacao(payload)
        .then(() => {
            showSuccess('Transação criada com sucesso');
            fecharModal();
            carregar(currentPage);
        })
        .catch(showError);
};

const excluir = (id) => {
    if (!confirm('Deseja excluir esta transação?')) {
        return;
    }
    excluirTransacao(id)
        .then(() => {
            showSuccess('Transação excluída');
            carregar(currentPage);
        })
        .catch(showError);
};

export { initTransacoes };
