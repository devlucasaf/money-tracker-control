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
        container.innerHTML = '<div class="empty-state"><i class="pi pi-flag"></i><p>Nenhuma meta cadastrada</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead><tr><th>Descrição</th><th>Progresso</th><th>Valor Alvo</th><th>Data Limite</th><th></th></tr></thead>
                <tbody>
                    ${metas.map(m => {
                        const percentual = m.valorAlvo > 0 ? Math.min((m.valorAtual / m.valorAlvo) * 100, 100) : 0;
                        const cor = percentual >= 100 ? 'var(--success)' : 'var(--primary)';
                        return `
                        <tr>
                            <td>${m.descricao}</td>
                            <td style="min-width:150px">
                                <div class="progress-bar">
                                    <div class="fill" style="width:${percentual}%;background:${cor}"></div>
                                </div>
                                <small style="color:var(--text-secondary)">${formatarMoeda(m.valorAtual)} / ${formatarMoeda(m.valorAlvo)} (${percentual.toFixed(0)}%)</small>
                            </td>
                            <td>${formatarMoeda(m.valorAlvo)}</td>
                            <td>${m.dataLimite ? formatarData(m.dataLimite) : '-'}</td>
                            <td>
                                <button class="btn btn-outline btn-editar-meta" data-id="${m.id}" data-descricao="${m.descricao}" data-valoralvo="${m.valorAlvo}" data-valoratual="${m.valorAtual}" data-datalimite="${m.dataLimite ?? ''}" style="margin-right:0.5rem"><i class="pi pi-pencil"></i></button>
                                <button class="btn btn-danger btn-excluir-meta" data-id="${m.id}"><i class="pi pi-trash"></i></button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

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
    if (!confirm('Deseja excluir esta meta?')) {
        return;
    }
    excluirMeta(id)
        .then(() => { exibirSucesso('Meta excluída'); carregar(); })
        .catch(exibirErro);
};

export { iniciarMetas };
