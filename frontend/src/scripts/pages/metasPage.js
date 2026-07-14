import { formatarMoeda, formatarData, exibirSucesso, exibirErro } from '../util.js';
import { pesquisarMetas, criarMeta, atualizarMeta, excluirMeta } from '../remotes/metas/metasRemote.js';

let dpMes, dpAno, dpDataSelecionada;

const iniciarMetas = () => {
    carregar();
    document.getElementById('btn-nova-meta').addEventListener('click', () => abrirModal(null));
    document.getElementById('modal-meta-close').addEventListener('click', fecharModal);
    document.getElementById('modal-meta-cancel').addEventListener('click', fecharModal);
    document.getElementById('form-meta').addEventListener('submit', salvar);
    inicializarCalendario();
};

// ---- CALENDARIO ----
const inicializarCalendario = () => {
    const hoje = new Date();
    dpMes = hoje.getMonth();
    dpAno = hoje.getFullYear();
    dpDataSelecionada = null;

    const exibicao = document.getElementById('meta-dataLimite-display');
    const dropdown = document.getElementById('meta-datepicker-dropdown');

    exibicao.addEventListener('click', () => {
        dropdown.classList.toggle('open');
        dropdown.classList.remove('showing-years');
        renderizarCalendario();
    });

    document.getElementById('meta-dp-prev').addEventListener('click', () => {
        dpMes--;
        if (dpMes < 0) {
            dpMes = 11; dpAno--;
        }
        renderizarCalendario();
    });

    document.getElementById('meta-dp-next').addEventListener('click', () => {
        dpMes++;
        if (dpMes > 11) {
            dpMes = 0; dpAno++;
        }
        renderizarCalendario();
    });

    // Alterna para a visualizacao de anos
    document.getElementById('meta-dp-title').addEventListener('click', () => {
        const aberto = dropdown.classList.toggle('showing-years');
        if (aberto) {
            renderizarAnos();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#meta-datepicker-wrapper')) {
            dropdown.classList.remove('open');
            dropdown.classList.remove('showing-years');
        }
    });
};

const renderizarAnos = () => {
    const container = document.getElementById('meta-dp-years');
    container.innerHTML = '';

    const anoAtual = new Date().getFullYear();
    const inicio = anoAtual - 100;
    const fim = anoAtual + 20;

    for (let ano = fim; ano >= inicio; ano--) {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'datepicker-year-item';
        el.textContent = ano;

        if (ano === anoAtual) {
            el.classList.add('today');
        }

        if (ano === dpAno) {
            el.classList.add('selected');
        }

        el.addEventListener('click', () => {
            dpAno = ano;
            document.getElementById('meta-datepicker-dropdown').classList.remove('showing-years');
            renderizarCalendario();
        });
        container.appendChild(el);
    }

    const selecionado = container.querySelector('.selected');
    if (selecionado) {
        selecionado.scrollIntoView({
            block: 'center'
        });
    }
};

const renderizarCalendario = () => {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    document.getElementById('meta-dp-month-year').textContent = `${meses[dpMes]} ${dpAno}`;

    const containerDias = document.getElementById('meta-dp-days');
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
        if (ehHoje) {
            el.classList.add('today');
        }

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
    document.getElementById('meta-dataLimite').value = iso;
    document.getElementById('meta-dataLimite-display').value = new Intl.DateTimeFormat('pt-BR').format(dpDataSelecionada);
    document.getElementById('meta-datepicker-dropdown').classList.remove('open');
};

// Define a data no calendario a partir de uma string ISO (usado na edicao)
const definirDataLimite = (iso) => {
    if (!iso) {
        dpDataSelecionada = null;
        document.getElementById('meta-dataLimite').value = '';
        document.getElementById('meta-dataLimite-display').value = '';
        const hoje = new Date();
        dpMes = hoje.getMonth();
        dpAno = hoje.getFullYear();
        return;
    }

    const [ano, mes, dia] = iso.split('-').map(Number);
    dpDataSelecionada = new Date(ano, mes - 1, dia);
    dpMes = mes - 1;
    dpAno = ano;
    document.getElementById('meta-dataLimite').value = iso;
    document.getElementById('meta-dataLimite-display').value = new Intl.DateTimeFormat('pt-BR').format(dpDataSelecionada);
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
        definirDataLimite(meta.dataLimite);
    } else {
        document.getElementById('modal-meta-title').textContent = 'Nova Meta';
        document.getElementById('meta-id').value = '';
        definirDataLimite(null);
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
