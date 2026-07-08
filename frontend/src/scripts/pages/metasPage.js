import { formatarMoeda, formatarData, exibirSucesso, exibirErro } from '../util.js';
import { pesquisarMetas, criarMeta, atualizarMeta, excluirMeta } from '../remotes/metas/metasRemote.js';

const iniciarMetas = () => {
    carregar();
    document.getElementById('btn-nova-meta').addEventListener('click', () => abrirModal(null));
    document.getElementById('modal-meta-close').addEventListener('click', fecharModal);
    document.getElementById('modal-meta-cancel').addEventListener('click', fecharModal);
    document.getElementById('form-meta').addEventListener('submit', salvar);
};

const carregar = () => {
    pesquisarMetas()
        .then(renderizarTabela)
        .catch(exibirErro);
};

const renderizarTabela = (metas) => {
    const container = document.getElementById('metas-body');

    if (metas === null || metas === undefined || metas.length === 0) {
        const tplVazio = document.getElementById('tpl-metas-vazio');
        container.innerHTML = '';
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    const tplTabela = document.getElementById('tpl-metas-tabela');
    const tplLinha = document.getElementById('tpl-metas-linha');

    container.innerHTML = '';
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector('#metas-tbody');
    metas.forEach(m => {
        const percentual = m.valorAlvo > 0 ? Math.min((m.valorAtual / m.valorAlvo) * 100, 100) : 0;
        const cor = percentual >= 100 ? 'var(--success)' : 'var(--primary)';

        const linha = tplLinha.content.cloneNode(true);
        const tr = linha.querySelector('tr');

        tr.querySelector('[data-campo="descricao"]').textContent = m.descricao;

        const fill = tr.querySelector('[data-campo="fill"]');
        fill.style.width = `${percentual}%`;
        fill.style.background = cor;

        const progressoTexto = tr.querySelector('[data-campo="progresso-texto"]');
        progressoTexto.style.color = 'var(--text-secondary)';
        progressoTexto.textContent = `${formatarMoeda(m.valorAtual)} / ${formatarMoeda(m.valorAlvo)} (${percentual.toFixed(0)}%)`;

        tr.querySelector('[data-campo="valorAlvo"]').textContent = formatarMoeda(m.valorAlvo);
        tr.querySelector('[data-campo="dataLimite"]').textContent = m.dataLimite ? formatarData(m.dataLimite) : '-';

        const tdAcoes = tr.querySelector('[data-campo="acoes"]');

        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn btn-outline btn-editar-meta';
        btnEditar.style.marginRight = '0.5rem';
        btnEditar.dataset.id = m.id;
        btnEditar.dataset.descricao = m.descricao;
        btnEditar.dataset.valoralvo = m.valorAlvo;
        btnEditar.dataset.valoratual = m.valorAtual;
        btnEditar.dataset.datalimite = m.dataLimite ?? '';
        const iconeEditar = document.createElement('i');
        iconeEditar.className = 'pi pi-pencil';
        btnEditar.appendChild(iconeEditar);
        tdAcoes.appendChild(btnEditar);

        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'btn btn-danger btn-excluir-meta';
        btnExcluir.dataset.id = m.id;
        const iconeExcluir = document.createElement('i');
        iconeExcluir.className = 'pi pi-trash';
        btnExcluir.appendChild(iconeExcluir);
        tdAcoes.appendChild(btnExcluir);

        tbody.appendChild(tr);
    });

    container.querySelectorAll('.btn-editar-meta').forEach(btn => {
        btn.addEventListener('click', () => {
            abrirModal({
                id:         btn.dataset.id,
                descricao:  btn.dataset.descricao,
                valorAlvo:  btn.dataset.valoralvo,
                valorAtual: btn.dataset.valoratual,
                dataLimite: btn.dataset.datalimite,
            });
        });
    });

    container.querySelectorAll('.btn-excluir-meta').forEach(btn => {
        btn.addEventListener('click', () => excluir(btn.dataset.id));
    });
};

const abrirModal = (meta) => {
    const formulario = document.getElementById('form-meta');
    formulario.reset();
    if (meta !== null) {
        document.getElementById('modal-meta-title').textContent = 'Editar Meta';
        document.getElementById('meta-id').value = meta.id;
        document.getElementById('meta-descricao').value = meta.descricao;
        document.getElementById('meta-valorAlvo').value = meta.valorAlvo;
        document.getElementById('meta-valorAtual').value = meta.valorAtual;
        document.getElementById('meta-dataLimite').value = meta.dataLimite;
    } else {
        document.getElementById('modal-meta-title').textContent = 'Nova Meta';
        document.getElementById('meta-id').value = '';
    }
    document.getElementById('modal-meta').classList.remove('hidden');
};

const fecharModal = () => {
    document.getElementById('modal-meta').classList.add('hidden');
};

const salvar = (e) => {
    e.preventDefault();
    const id = document.getElementById('meta-id').value;
    const payload = {
        descricao: document.getElementById('meta-descricao').value,
        valorAlvo: parseFloat(document.getElementById('meta-valorAlvo').value),
        valorAtual: parseFloat(document.getElementById('meta-valorAtual').value) || 0,
        dataLimite: document.getElementById('meta-dataLimite').value || null,
    };

    const promessa = id !== '' ? atualizarMeta(id, payload) : criarMeta(payload);

    promessa
        .then(() => {
            exibirSucesso(id !== '' ? 'Meta atualizada' : 'Meta criada');
            fecharModal();
            carregar();
        })
        .catch(exibirErro);
};

const excluir = (id) => {
    if (!confirm('Deseja excluir esta meta?')) return;
    excluirMeta(id)
        .then(() => { exibirSucesso('Meta excluída'); carregar(); })
        .catch(exibirErro);
};

export { iniciarMetas };
