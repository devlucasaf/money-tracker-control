import { formatarMoeda, exibirErro }    from "../util.js";
import { obterDashboard }               from "../remotes/dashboard/getDashboardRemote.js";

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

// --- MESES ABREVIADOS ---
const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// --- MESES POR EXTENSO ---
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// --- ESTADO DO MÊS EXIBIDO ---
let dashMes, dashAno;

// --- INICIALIZAÇÃO DA PÁGINA ---
const iniciarDashboard = () => {
    const hoje = new Date();
    dashMes = hoje.getMonth() + 1;
    dashAno = hoje.getFullYear();

    document.getElementById("dash-mes-prev").addEventListener("click", () => mudarMes(-1));
    document.getElementById("dash-mes-next").addEventListener("click", () => mudarMes(1));

    carregar();
};

// --- AVANÇA/RETROCEDE O MÊS EXIBIDO ---
const mudarMes = (delta) => {
    dashMes += delta;
    if (dashMes < 1) {
        dashMes = 12;
        dashAno--;
    } else if (dashMes > 12) {
        dashMes = 1;
        dashAno++;
    }
    carregar();
};

// --- CARREGA OS DADOS DO MÊS SELECIONADO ---
const carregar = () => {
    document.getElementById("dash-mes-label").textContent = `${MESES[dashMes - 1]} ${dashAno}`;
    obterDashboard({ mes: dashMes, ano: dashAno })
        .then(renderizar)
        .catch(exibirErro);
};

// --- RENDERIZAÇÃO GERAL ---
const renderizar = (dados) => {
    definirValor("dash-saldo-contas", dados.saldoContas, false);
    definirValor("dash-receitas", dados.totalReceitas, false);
    definirValor("dash-despesas", dados.totalDespesas, false);
    definirValor("dash-saldo-mes", dados.saldo, true);

    renderizarPizza(dados.despesasPorCategoria || []);
    renderizarBarras(dados.evolucaoMensal || []);
    renderizarLinha(dados.evolucaoMensal || []);
};

// --- PREENCHE UM CARD DE RESUMO ---
const definirValor = (id, valor, colorir) => {
    const el = document.getElementById(id);
    if (!el) {
        return;
    }

    el.textContent = formatarMoeda(valor);
    if (colorir) {
        el.style.color = valor >= 0 ? "var(--color-green)" : "var(--color-red)";
    }
};

// --- CONVERTE ÂNGULO POLAR EM COORDENADAS ---
const polar = (cx, cy, raio, angulo) => ({
    x: cx + raio * Math.cos(angulo - Math.PI / 2),
    y: cy + raio * Math.sin(angulo - Math.PI / 2),
});

// --- GERA O PATH DE UMA FATIA DE ROSCA ---
const fatiaDonut = (cx, cy, raio, raioInterno, aIni, aFim, cor) => {
    const p1 = polar(cx, cy, raio, aIni);
    const p2 = polar(cx, cy, raio, aFim);
    const p3 = polar(cx, cy, raioInterno, aFim);
    const p4 = polar(cx, cy, raioInterno, aIni);
    const largo = (aFim - aIni) > Math.PI ? 1 : 0;

    const d = `M ${p1.x} ${p1.y} A ${raio} ${raio} 0 ${largo} 1 ${p2.x} ${p2.y} `
        + `L ${p3.x} ${p3.y} A ${raioInterno} ${raioInterno} 0 ${largo} 0 ${p4.x} ${p4.y} Z`;
    return `<path d="${d}" fill="${cor}" />`;
};

// --- GRÁFICO DE PIZZA DE DESPESAS POR CATEGORIA ---
const renderizarPizza = (despesas) => {
    const container = document.getElementById("dash-pizza");
    const legenda = document.getElementById("dash-pizza-legend");
    if (!container || !legenda) {
        return;
    }

    legenda.innerHTML = "";

    const total = despesas.reduce((soma, d) => soma + Number(d.valor), 0);
    if (despesas.length === 0 || total <= 0) {
        exibirVazio("dash-pizza-area");
        return;
    }

    const cx = 100, cy = 100, raio = 80, raioInterno = 50;
    let svg = `<svg viewBox="0 0 200 200" class="chart-svg-pizza">`;

    if (despesas.length === 1) {
        const cor = despesas[0].cor || CORES_GRAFICO[0];
        svg += `<circle cx="${cx}" cy="${cy}" r="${raio}" fill="${cor}" />`;
        svg += `<circle cx="${cx}" cy="${cy}" r="${raioInterno}" fill="var(--bg-card)" />`;
    } else {
        let angulo = 0;
        despesas.forEach((item, i) => {
            const fatia = (Number(item.valor) / total) * 2 * Math.PI;
            const cor = item.cor || CORES_GRAFICO[i % CORES_GRAFICO.length];
            svg += fatiaDonut(cx, cy, raio, raioInterno, angulo, angulo + fatia, cor);
            angulo += fatia;
        });
    }

    // --- TEXTO CENTRAL COM O TOTAL ---
    svg += `<text x="100" y="96" text-anchor="middle" class="chart-donut-total">${formatarMoeda(total)}</text>`;
    svg += `<text x="100" y="114" text-anchor="middle" class="chart-donut-label">Total</text>`;
    svg += `</svg>`;
    container.innerHTML = svg;

    // --- LEGENDA ---
    despesas.forEach((item, i) => {
        const pct = ((Number(item.valor) / total) * 100).toFixed(1);
        const cor = item.cor || CORES_GRAFICO[i % CORES_GRAFICO.length];
        const el = document.createElement("div");
        el.className = "chart-legend-item";
        el.innerHTML = `<span class="chart-legend-dot" style="background:${cor}"></span>`
            + `<span>${item.categoriaNome || "Sem categoria"} — ${formatarMoeda(item.valor)} (${pct}%)</span>`;
        legenda.appendChild(el);
    });
};

// --- GRÁFICO DE BARRAS ---
const renderizarBarras = (evolucao) => {
    const container = document.getElementById("dash-barras");
    if (!container) {
        return;
    }

    const temDados = evolucao.some(m => Number(m.receitas) > 0 || Number(m.despesas) > 0);
    if (evolucao.length === 0 || !temDados) {
        exibirVazio("dash-barras-area");
        return;
    }

    // --- GEOMETRIA DO SVG ---
    const largura = 340, altura = 200;
    const padTopo = 12, padBase = 26, padLat = 6;
    const areaAltura = altura - padTopo - padBase;
    const grupos = evolucao.length;
    const larguraGrupo = (largura - padLat * 2) / grupos;
    const larguraBarra = larguraGrupo * 0.28;

    const maximo = Math.max(...evolucao.map(m => Math.max(Number(m.receitas), Number(m.despesas))), 1);

    let svg = `<svg viewBox="0 0 ${largura} ${altura}" class="chart-svg-barras" preserveAspectRatio="none">`;

    // --- LINHA DE BASE ---
    svg += `<line x1="${padLat}" y1="${padTopo + areaAltura}" x2="${largura - padLat}" y2="${padTopo + areaAltura}" class="chart-base-line" />`;

    evolucao.forEach((m, i) => {
        const centroGrupo = padLat + larguraGrupo * i + larguraGrupo / 2;
        const alturaRec = (Number(m.receitas) / maximo) * areaAltura;
        const alturaDes = (Number(m.despesas) / maximo) * areaAltura;

        const xRec = centroGrupo - larguraBarra - 2;
        const xDes = centroGrupo + 2;
        const baseY = padTopo + areaAltura;

        // --- BARRA DE RECEITA ---
        svg += `<rect x="${xRec}" y="${baseY - alturaRec}" width="${larguraBarra}" height="${alturaRec}" rx="2" fill="var(--color-green)">`
            + `<title>Receitas: ${formatarMoeda(m.receitas)}</title></rect>`;

        // --- BARRA DE DESPESA ---
        svg += `<rect x="${xDes}" y="${baseY - alturaDes}" width="${larguraBarra}" height="${alturaDes}" rx="2" fill="var(--color-red)">`
            + `<title>Despesas: ${formatarMoeda(m.despesas)}</title></rect>`;

        // --- RÓTULO DO MÊS ---
        svg += `<text x="${centroGrupo}" y="${altura - 8}" text-anchor="middle" class="chart-bar-label">${MESES_ABREV[m.mes - 1]}</text>`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
};

// --- EVOLUÇÃO DO SALDO EM GRÁFICO DE LINHA ---
const renderizarLinha = (evolucao) => {
    const container = document.getElementById("dash-linha");
    if (!container) {
        return;
    }

    const temDados = evolucao.some(m => Number(m.receitas) > 0 || Number(m.despesas) > 0);
    if (evolucao.length === 0 || !temDados) {
        exibirVazio("dash-linha-area");
        return;
    }

    // --- ACUMULA O FLUXO MÊS A MÊS ---
    let acumulado = 0;
    const pontos = evolucao.map(m => {
        acumulado += Number(m.receitas) - Number(m.despesas);
        return { mes: m.mes, valor: acumulado };
    });

    // --- GEOMETRIA ---
    const largura = 680, altura = 220;
    const padTopo = 20, padBase = 28, padLat = 12;
    const areaAltura = altura - padTopo - padBase;
    const valores = pontos.map(p => p.valor);
    const maximo = Math.max(...valores, 0);
    const minimo = Math.min(...valores, 0);
    const amplitude = (maximo - minimo) || 1;
    const passoX = (largura - padLat * 2) / (pontos.length - 1 || 1);

    const coordX = (i) => padLat + passoX * i;
    const coordY = (v) => padTopo + areaAltura - ((v - minimo) / amplitude) * areaAltura;

    let svg = `<svg viewBox="0 0 ${largura} ${altura}" class="chart-svg-linha" preserveAspectRatio="none">`;

    // --- LINHA DO ZERO ---
    if (minimo < 0 && maximo > 0) {
        const yZero = coordY(0);
        svg += `<line x1="${padLat}" y1="${yZero}" x2="${largura - padLat}" y2="${yZero}" class="chart-base-line" stroke-dasharray="4 4" />`;
    }

    // --- ÁREA SOB A LINHA ---
    const pontosLinha = pontos.map((p, i) => `${coordX(i)},${coordY(p.valor)}`).join(" ");
    const baseY = padTopo + areaAltura;
    svg += `<polygon points="${coordX(0)},${baseY} ${pontosLinha} ${coordX(pontos.length - 1)},${baseY}" class="chart-linha-area" />`;

    // --- LINHA PRINCIPAL ---
    svg += `<polyline points="${pontosLinha}" class="chart-linha-traco" />`;

    // --- PONTOS E RÓTULOS ---
    pontos.forEach((p, i) => {
        svg += `<circle cx="${coordX(i)}" cy="${coordY(p.valor)}" r="3.5" class="chart-linha-ponto">`
            + `<title>${MESES_ABREV[p.mes - 1]}: ${formatarMoeda(p.valor)}</title></circle>`;
        svg += `<text x="${coordX(i)}" y="${altura - 8}" text-anchor="middle" class="chart-bar-label">${MESES_ABREV[p.mes - 1]}</text>`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
};

// --- EXIBE O ESTADO VAZIO DENTRO DE UMA ÁREA DE GRÁFICO ---
const exibirVazio = (areaId) => {
    const area = document.getElementById(areaId);
    const tpl = document.getElementById("tpl-dash-vazio-grafico");
    if (!area || !tpl) {
        return;
    }
    area.innerHTML = "";
    area.appendChild(tpl.content.cloneNode(true));
};

export { iniciarDashboard };
