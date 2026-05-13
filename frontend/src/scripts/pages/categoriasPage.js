import { showSuccess, showError } from '../util.js';
import { pesquisarCategorias, criarCategoria, atualizarCategoria, excluirCategoria } from '../remotes/categorias/categoriasRemote.js';

const initCategorias = () => {
    carregar();
    document.getElementById('btn-nova-categoria').addEventListener('click', () => abrirModal(null));
    document.getElementById('modal-categoria-close').addEventListener('click', fecharModal);
    document.getElementById('modal-categoria-cancel').addEventListener('click', fecharModal);
    document.getElementById('form-categoria').addEventListener('submit', salvar);
};

const carregar = () => {
    pesquisarCategorias()
        .then(renderTabela)
        .catch(showError);
};

const renderTabela = (categorias) => {
    const container = document.getElementById('categorias-body');

    if (categorias === null || categorias === undefined || categorias.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="pi pi-tag"></i><p>Nenhuma categoria cadastrada</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead><tr><th>Cor</th><th>Nome</th><th>Tipo</th><th></th></tr></thead>
                <tbody>
                    ${categorias.map(c => `
                        <tr>
                            <td><span class="color-dot" style="background:${c.cor ?? '#6366f1'}"></span></td>
                            <td>${c.nome}</td>
                            <td><span class="badge ${c.tipo === 'RECEITA' ? 'badge-success' : 'badge-danger'}">${c.tipo}</span></td>
                            <td>
                                <button class="btn btn-outline btn-editar-categoria" data-id="${c.id}" data-nome="${c.nome}" data-tipo="${c.tipo}" data-cor="${c.cor ?? '#6366f1'}" style="margin-right:0.5rem"><i class="pi pi-pencil"></i></button>
                                <button class="btn btn-danger btn-excluir-categoria" data-id="${c.id}"><i class="pi pi-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.querySelectorAll('.btn-editar-categoria').forEach(btn => {
        btn.addEventListener('click', () => {
            abrirModal({ id: btn.dataset.id, nome: btn.dataset.nome, tipo: btn.dataset.tipo, cor: btn.dataset.cor });
        });
    });

    container.querySelectorAll('.btn-excluir-categoria').forEach(btn => {
        btn.addEventListener('click', () => excluir(btn.dataset.id));
    });
};

const abrirModal = (categoria) => {
    const form = document.getElementById('form-categoria');
    form.reset();
    if (categoria !== null) {
        document.getElementById('modal-categoria-title').textContent = 'Editar Categoria';
        document.getElementById('categoria-id').value = categoria.id;
        document.getElementById('categoria-nome').value = categoria.nome;
        document.getElementById('categoria-tipo').value = categoria.tipo;
        document.getElementById('categoria-cor').value = categoria.cor;
    } else {
        document.getElementById('modal-categoria-title').textContent = 'Nova Categoria';
        document.getElementById('categoria-id').value = '';
    }
    document.getElementById('modal-categoria').classList.remove('hidden');
};

const fecharModal = () => {
    document.getElementById('modal-categoria').classList.add('hidden');
};

const salvar = (e) => {
    e.preventDefault();
    const id = document.getElementById('categoria-id').value;
    const payload = {
        nome: document.getElementById('categoria-nome').value,
        tipo: document.getElementById('categoria-tipo').value,
        cor: document.getElementById('categoria-cor').value,
    };

    const promise = id !== '' ? atualizarCategoria(id, payload) : criarCategoria(payload);

    promise
        .then(() => {
            showSuccess(id !== '' ? 'Categoria atualizada' : 'Categoria criada');
            fecharModal();
            carregar();
        })
        .catch(showError);
};

const excluir = (id) => {
    if (!confirm('Deseja excluir esta categoria?')) return;
    excluirCategoria(id)
        .then(() => { showSuccess('Categoria excluída'); carregar(); })
        .catch(showError);
};

export { initCategorias };
