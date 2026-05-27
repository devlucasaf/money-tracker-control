import { formatarMoeda, exibirSucesso, exibirErro } from '../util.js';
import { pesquisarContas, criarConta, atualizarConta, excluirConta } from '../remotes/contas/contasRemote.js';

const iniciarContas = () => {
    carregar();
    document.getElementById('btn-nova-conta').addEventListener('click', () => abrirModal(null));
    document.getElementById('modal-conta-close').addEventListener('click', fecharModal);
    document.getElementById('modal-conta-cancel').addEventListener('click', fecharModal);
    document.getElementById('form-conta').addEventListener('submit', salvar);
};

const carregar = () => {
    pesquisarContas()
        .then(renderizarTabela)
        .catch(exibirErro);
};

const renderizarTabela = (contas) => {
    const container = document.getElementById('contas-body');

    if (contas === null || contas === undefined || contas.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="pi pi-wallet"></i><p>Nenhuma conta cadastrada</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead><tr><th>Nome</th><th>Tipo</th><th>Saldo</th><th></th></tr></thead>
                <tbody>
                    ${contas.map(c => `
                        <tr>
                            <td>${c.nome}</td>
                            <td><span class="badge badge-info">${c.tipo}</span></td>
                            <td style="font-weight:600;color:${c.saldo >= 0 ? 'var(--success)' : 'var(--danger)'}">${formatarMoeda(c.saldo)}</td>
                            <td>
                                <button class="btn btn-outline btn-editar-conta" data-id="${c.id}" data-nome="${c.nome}" data-tipo="${c.tipo}" data-saldo="${c.saldo}" style="margin-right:0.5rem"><i class="pi pi-pencil"></i></button>
                                <button class="btn btn-danger btn-excluir-conta" data-id="${c.id}"><i class="pi pi-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.querySelectorAll('.btn-editar-conta').forEach(btn => {
        btn.addEventListener('click', () => {
            abrirModal({ 
                id:    btn.dataset.id, 
                nome:  btn.dataset.nome, 
                tipo:  btn.dataset.tipo, 
                saldo: btn.dataset.saldo 
            });
        });
    });

    container.querySelectorAll('.btn-excluir-conta').forEach(btn => {
        btn.addEventListener('click', () => excluir(btn.dataset.id));
    });
};

const abrirModal = (conta) => {
    const formulario = document.getElementById('form-conta');
    formulario.reset();
    if (conta !== null) {
        document.getElementById('modal-conta-title').textContent = 'Editar Conta';
        document.getElementById('conta-id').value = conta.id;
        document.getElementById('conta-nome').value = conta.nome;
        document.getElementById('conta-tipo').value = conta.tipo;
        document.getElementById('conta-saldo').value = conta.saldo;
    } else {
        document.getElementById('modal-conta-title').textContent = 'Nova Conta';
        document.getElementById('conta-id').value = '';
    }
    document.getElementById('modal-conta').classList.remove('hidden');
};

const fecharModal = () => {
    document.getElementById('modal-conta').classList.add('hidden');
};

const salvar = (e) => {
    e.preventDefault();
    const id = document.getElementById('conta-id').value;
    const payload = {
        nome:  document.getElementById('conta-nome').value,
        tipo:  document.getElementById('conta-tipo').value,
        saldo: parseFloat(document.getElementById('conta-saldo').value),
    };

    const promessa = id !== '' ? atualizarConta(id, payload) : criarConta(payload);

    promessa
        .then(() => {
            exibirSucesso(id !== '' ? 'Conta atualizada' : 'Conta criada');
            fecharModal();
            carregar();
        })
        .catch(exibirErro);
};

const excluir = (id) => {
    if (!confirm('Deseja excluir esta conta?')) {
        return;
    }
    excluirConta(id)
        .then(() => { exibirSucesso('Conta excluída'); carregar(); })
        .catch(exibirErro);
};

export { iniciarContas };
