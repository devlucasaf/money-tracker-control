import { formatarMoeda, exibirErro } from '../util.js';
import { obterDashboard } from '../remotes/dashboard/getDashboardRemote.js';

const CORES_GRAFICO = [
    '#7c3aed', 
    '#ec4899', 
    '#6366f1', 
    '#f59e0b', 
    '#10b981',
    '#3b82f6', 
    '#f472b6', 
    '#8b5cf6', 
    '#ef4444', 
    '#14b8a6'
];

const iniciarDashboard = () => {
    obterDashboard()
        .then(renderizarDashboard)
        .catch(exibirErro);
};

const renderizarDashboard = (dados) => {
    document.getElementById('dash-saldo').textContent = formatarMoeda(dados.saldoTotal);
    document.getElementById('dash-saldo').className = `value ${dados.saldoTotal >= 0 ? 'positive' : 'negative'}`;
    document.getElementById('dash-receitas').textContent = formatarMoeda(dados.receitasMes);
    document.getElementById('dash-despesas').textContent = formatarMoeda(dados.despesasMes);
    document.getElementById('dash-economia').textContent = formatarMoeda(dados.economiaMes);
    document.getElementById('dash-economia').className = `value ${dados.economiaMes >= 0 ? 'positive' : 'negative'}`;

    renderizarGraficoPizza(dados.despesasPorCategoria || []);

    const container = document.getElementById('dash-transacoes-body');
    const transacoes = dados.ultimasTransacoes;

    if (transacoes === null || transacoes === undefined || transacoes.length === 0) {
        const tplVazio = document.getElementById('tpl-dash-vazio-transacoes');
        container.innerHTML = '';
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    const tplTabela = document.getElementById('tpl-dash-tabela-transacoes');
    const tplLinha = document.getElementById('tpl-dash-transacao-linha');

    container.innerHTML = '';
    container.appendChild(tplTabela.content.cloneNode(true));

    const tbody = container.querySelector('#dash-transacoes-tbody');
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

        tr.querySelector('[data-campo="data"]').textContent = t.data ?? '';

        tbody.appendChild(tr);
    });
};

const renderizarGraficoPizza = (despesas) => {
    const canvas = document.getElementById('dash-pie-chart');
    const legenda = document.getElementById('dash-chart-legend');

    if (!canvas || !legenda) {
        return;
    }

    if (!despesas || despesas.length === 0) {
        const container = document.getElementById('dash-chart-container');
        const tplVazio = document.getElementById('tpl-dash-vazio-grafico');
        container.innerHTML = '';
        container.appendChild(tplVazio.content.cloneNode(true));
        return;
    }

    const ctx = canvas.getContext('2d');
    const total = despesas.reduce((soma, d) => soma + d.valor, 0);
    const centroX = canvas.width / 2;
    const centroY = canvas.height / 2;
    const raio = 90;
    const raioInterno = 55;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let anguloInicial = -Math.PI / 2;
    despesas.forEach((item, i) => {
        const anguloFatia = (item.valor / total) * 2 * Math.PI;

        ctx.beginPath();
        ctx.arc(centroX, centroY, raio, anguloInicial, anguloInicial + anguloFatia);
        ctx.arc(centroX, centroY, raioInterno, anguloInicial + anguloFatia, anguloInicial, true);
        ctx.closePath();
        ctx.fillStyle = CORES_GRAFICO[i % CORES_GRAFICO.length];
        ctx.fill();

        anguloInicial += anguloFatia;
    });

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(formatarMoeda(total), centroX, centroY - 8);
    ctx.font = '11px Inter';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    ctx.fillText('Total', centroX, centroY + 12);

    const tplLegendaItem = document.getElementById('tpl-dash-legenda-item');
    legenda.innerHTML = '';
    despesas.forEach((item, i) => {
        const pct = ((item.valor / total) * 100).toFixed(1);
        const clone = tplLegendaItem.content.cloneNode(true);
        clone.querySelector('[data-campo="dot"]').style.background = CORES_GRAFICO[i % CORES_GRAFICO.length];
        clone.querySelector('[data-campo="texto"]').textContent = `${item.categoriaNome || 'Sem categoria'} (${pct}%)`;
        legenda.appendChild(clone);
    });
};

export { iniciarDashboard };
