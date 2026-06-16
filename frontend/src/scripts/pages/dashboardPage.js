import { formatarMoeda, exibirErro } from "../util.js";
import { obterDashboard } from "../remotes/dashboard/getDashboardRemote.js";

const CORES_GRAFICO = [
    "#7c3aed", 
    "#ec4899", 
    "#6366f1", 
    "#f59e0b", 
    "#10b981",
    "#3b82f6", 
    "#f472b6", 
    "#8b5cf6", 
    "#ef4444", 
    "#14b8a6"
];

const iniciarDashboard = () => {
    obterDashboard()
        .then(renderizarDashboard)
        .catch(exibirErro);
};

const renderizarDashboard = (dados) => {
    document.getElementById("dash-saldo").textContent = formatarMoeda(dados.saldoTotal);
    document.getElementById("dash-saldo").className = `value ${dados.saldoTotal >= 0 ? "positive" : "negative"}`;
    document.getElementById("dash-receitas").textContent = formatarMoeda(dados.receitasMes);
    document.getElementById("dash-despesas").textContent = formatarMoeda(dados.despesasMes);
    document.getElementById("dash-economia").textContent = formatarMoeda(dados.economiaMes);
    document.getElementById("dash-economia").className = `value ${dados.economiaMes >= 0 ? "positive" : "negative"}`;

    // --- GRÁFICO DE PIZZA ---
    renderizarGraficoPizza(dados.despesasPorCategoria || []);

    // --- TRANSAÇÕES RECENTES ---
    const container = document.getElementById("dash-transacoes-body");
    const transacoes = dados.ultimasTransacoes;

    if (transacoes === null || transacoes === undefined || transacoes.length === 0) {
        container.innerHTML = "<div class='empty-state'><i class='pi pi-inbox'></i><p>Nenhuma transação recente</p></div>";
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead><tr><th>Descrição</th><th>Valor</th><th>Tipo</th><th>Data</th></tr></thead>
                <tbody>
                    ${transacoes.map(t => `
                        <tr>
                            <td>
                                ${t.descricao}
                            </td>

                            <td style="font-weight:600;color:${t.tipo === "RECEITA" ? "var(--success)" : "var(--danger)"}">
                                ${t.tipo === "RECEITA" ? "+" : "-"} ${formatarMoeda(t.valor)}
                            </td>

                            <td>
                                <span class="badge ${t.tipo === "RECEITA" ? "badge-success" : "badge-danger"}">
                                    ${t.tipo}
                                </span>
                            </td>

                            <td>
                                ${t.data ?? ""}
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
};

const renderizarGraficoPizza = (despesas) => {
    const canvas = document.getElementById("dash-pie-chart");
    const legenda = document.getElementById("dash-chart-legend");

    if (!canvas || !legenda) {
        return;
    }

    if (!despesas || despesas.length === 0) {
        const container = document.getElementById("dash-chart-container");
        container.innerHTML = "<div class='empty-state'><i class='pi pi-chart-pie'></i><p>Sem despesas este mês</p></div>";
        return;
    }

    const ctx = canvas.getContext("2d");
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

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-primary").trim();
    ctx.font = "bold 16px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formatarMoeda(total), centroX, centroY - 8);
    ctx.font = "11px Inter";
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-secondary").trim();
    ctx.fillText("Total", centroX, centroY + 12);

    legenda.innerHTML = despesas.map((item, i) => {
        const pct = ((item.valor / total) * 100).toFixed(1);
        return `
            <div class="chart-legend-item">
                <span class="chart-legend-dot" style="background:${CORES_GRAFICO[i % CORES_GRAFICO.length]}"></span>
                ${item.categoriaNome || "Sem categoria"} (${pct}%)
            </div>
        `;
    }).join("");
};

export { iniciarDashboard };
