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
        const tplVazio = document.getElementById('tpl-contas-vazio');
        container.innerHTML = '';
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    const tplTabela = document.getElementById('tpl-contas-tabela');
    const tplLinha = document.getElementById('tpl-contas-linha');

    container.innerHTML = '';
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector('#contas-tbody');
    contas.forEach(c => {
        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector('tr');

        tr.querySelector('[data-campo="nome"]').textContent = c.nome;

        const tdTipo = tr.querySelector('[data-campo="tipo"]');
        const badge = document.createElement('span');
        badge.className = 'badge badge-info';
        badge.textContent = c.tipo;
        tdTipo.appendChild(badge);

        const tdSaldo = tr.querySelector('[data-campo="saldo"]');
        tdSaldo.style.fontWeight = '600';
        tdSaldo.style.color = c.saldo >= 0 ? 'var(--success)' : 'var(--danger)';
        tdSaldo.textContent = formatarMoeda(c.saldo);

        const tdAcoes = tr.querySelector('[data-campo="acoes"]');

        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn btn-outline btn-editar-conta';
        btnEditar.style.marginRight = '0.5rem';
        btnEditar.dataset.id = c.id;
        btnEditar.dataset.nome = c.nome;
        btnEditar.dataset.tipo = c.tipo;
        btnEditar.dataset.saldo = c.saldo;
        const iconeEditar = document.createElement('i');
        iconeEditar.className = 'pi pi-pencil';
        btnEditar.appendChild(iconeEditar);
        tdAcoes.appendChild(btnEditar);

        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'btn btn-danger btn-excluir-conta';
        btnExcluir.dataset.id = c.id;
        const iconeExcluir = document.createElement('i');
        iconeExcluir.className = 'pi pi-trash';
        btnExcluir.appendChild(iconeExcluir);
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });

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
    if (!confirm('Deseja excluir esta conta?')) return;
    excluirConta(id)
        .then(() => { exibirSucesso('Conta excluída'); carregar(); })
        .catch(exibirErro);
};

export { iniciarContas };
