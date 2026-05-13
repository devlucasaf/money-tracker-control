import { formatCurrency, showError } from '../util.js';
import { getDashboard } from '../remotes/dashboard/getDashboardRemote.js';

const initDashboard = () => {
    getDashboard()
        .then(renderDashboard)
        .catch(showError);
};

const renderDashboard = (dados) => {
    document.getElementById('dash-saldo').textContent = formatCurrency(dados.saldoTotal);
    document.getElementById('dash-saldo').className = `value ${dados.saldoTotal >= 0 ? 'positive' : 'negative'}`;
    document.getElementById('dash-receitas').textContent = formatCurrency(dados.receitasMes);
    document.getElementById('dash-despesas').textContent = formatCurrency(dados.despesasMes);
    document.getElementById('dash-economia').textContent = formatCurrency(dados.economiaMes);
    document.getElementById('dash-economia').className = `value ${dados.economiaMes >= 0 ? 'positive' : 'negative'}`;

    const container = document.getElementById('dash-transacoes-body');
    const transacoes = dados.ultimasTransacoes;

    if (transacoes === null || transacoes === undefined || transacoes.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="pi pi-inbox"></i><p>Nenhuma transação recente</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead><tr><th>Descrição</th><th>Valor</th><th>Tipo</th><th>Data</th></tr></thead>
                <tbody>
                    ${transacoes.map(t => `
                        <tr>
                            <td>${t.descricao}</td>
                            <td style="font-weight:600;color:${t.tipo === 'RECEITA' ? 'var(--success)' : 'var(--danger)'}">
                                ${t.tipo === 'RECEITA' ? '+' : '-'} ${formatCurrency(t.valor)}
                            </td>
                            <td><span class="badge ${t.tipo === 'RECEITA' ? 'badge-success' : 'badge-danger'}">${t.tipo}</span></td>
                            <td>${t.data ?? ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

export { initDashboard };
