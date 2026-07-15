import { formatarMoeda, exibirSucesso, exibirErro } from "../util.js";
import { obterPlano, salvarPlano } from "../remotes/plano/planoRemote.js";

// --- INICIALIZAÇÃO DA PÁGINA ---
const iniciarPlano = () => {
    carregar();
    document.getElementById("form-plano").addEventListener("submit", salvar);

    ["plano-renda", "plano-gastar", "plano-emergencia", "plano-guardar"].forEach(id => {
        document.getElementById(id).addEventListener("input", atualizarAlertaSoma);
    });
};

// --- CARREGAMENTO DO PLANO ---
const carregar = () => {
    obterPlano()
        .then(preencher)
        .catch(exibirErro);
};

// --- PREENCHE O FORMULÁRIO E O RESUMO ---
const preencher = (plano) => {
    document.getElementById("plano-renda").value = plano.rendaMensal ?? "";
    document.getElementById("plano-gastar").value = plano.valorGastar ?? "";
    document.getElementById("plano-emergencia").value = plano.valorEmergencia ?? "";
    document.getElementById("plano-guardar").value = plano.valorGuardar ?? "";

    renderizarResumo(plano);
    atualizarAlertaSoma();
};

// --- RENDERIZA O RESUMO DO MÊS ---
const renderizarResumo = (plano) => {
    const container = document.getElementById("plano-resumo");
    container.innerHTML = "";

    if (plano.rendaMensal === null || plano.rendaMensal === undefined) {
        const tpl = document.getElementById("tpl-plano-sem-plano");
        container.appendChild(tpl.content.cloneNode(true));
        return;
    }

    const renda = Number(plano.rendaMensal) || 0;
    const gastar = Number(plano.valorGastar) || 0;
    const emergencia = Number(plano.valorEmergencia) || 0;
    const guardar = Number(plano.valorGuardar) || 0;
    const gasto = Number(plano.gastoAtualMes) || 0;

    const restante = gastar - gasto;
    const pct = gastar > 0 ? Math.min((gasto / gastar) * 100, 100) : 0;
    const pctReal = gastar > 0 ? (gasto / gastar) * 100 : 0;
    const cor = pctReal >= 100 ? "var(--color-red)" : pctReal >= 80 ? "var(--color-yellow)" : "var(--color-green)";
    const pctDaRenda = (v) => renda > 0 ? ((v / renda) * 100).toFixed(0) : "0";

    const fragmento = document.getElementById("tpl-plano-resumo").content.cloneNode(true);
    const buscar = (campo) => fragmento.querySelector(`[data-campo='${campo}']`);

    const elGasto = buscar("gasto");

    elGasto.textContent = formatarMoeda(gasto);
    elGasto.style.color = cor;

    buscar("limite").textContent = formatarMoeda(gastar);
    buscar("pct").textContent = pctReal.toFixed(0);

    const fill = buscar("fill");
    fill.style.width = `${pct}%`;
    fill.style.background = cor;

    // --- MENSAGEM DE RESTANTE ---
    const elValor = buscar("restante-valor");
    if (restante >= 0) {
        buscar("restante-texto").textContent = "Ainda posso gastar ";
        elValor.textContent = formatarMoeda(restante);
        elValor.style.color = "var(--color-green)";
        buscar("restante-sufixo").textContent = " este mês.";
    } else {
        buscar("restante-texto").textContent = "Estourei o limite em ";
        elValor.textContent = formatarMoeda(Math.abs(restante));
        elValor.style.color = "var(--color-red)";
        buscar("restante-sufixo").textContent = ".";
    }

    // --- CARDS DE ALOCAÇÃO ---
    buscar("label-gastar").textContent = `Gastar (${pctDaRenda(gastar)}% da renda)`;
    buscar("valor-gastar").textContent = formatarMoeda(gastar);
    buscar("label-emergencia").textContent = `Emergência (${pctDaRenda(emergencia)}% da renda)`;
    buscar("valor-emergencia").textContent = formatarMoeda(emergencia);
    buscar("label-guardar").textContent = `Guardar (${pctDaRenda(guardar)}% da renda)`;
    buscar("valor-guardar").textContent = formatarMoeda(guardar);

    container.appendChild(fragmento);
};

// --- ALERTA DE SOMA DAS ALOCAÇÕES VS RENDA ---
const atualizarAlertaSoma = () => {
    const container = document.getElementById("plano-alerta-soma");
    if (!container) {
        return;
    }
    container.innerHTML = "";

    const renda = parseFloat(document.getElementById("plano-renda").value) || 0;
    const gastar = parseFloat(document.getElementById("plano-gastar").value) || 0;
    const emergencia = parseFloat(document.getElementById("plano-emergencia").value) || 0;
    const guardar = parseFloat(document.getElementById("plano-guardar").value) || 0;

    if (renda <= 0) {
        return;
    }

    const soma = gastar + emergencia + guardar;
    const diferenca = renda - soma;

    // --- DEFINE NÍVEL, ÍCONE E TEXTO ---
    let nivel;
    let icone;
    let texto;
    if (Math.abs(diferenca) < 0.005) {
        nivel = "alerta-ok";
        icone = "pi pi-check-circle";
        texto = "Alocação equilibrada: você distribuiu toda a renda.";
    } else if (diferenca > 0) {
        nivel = "alerta-warning";
        icone = "pi pi-info-circle";
        texto = `Sobra ${formatarMoeda(diferenca)} da renda sem alocar.`;
    } else {
        nivel = "alerta-danger";
        icone = "pi pi-exclamation-triangle";
        texto = `As alocações ultrapassam a renda em ${formatarMoeda(Math.abs(diferenca))}.`;
    }

    const fragmento = document.getElementById("tpl-plano-alerta").content.cloneNode(true);

    fragmento.querySelector(".alerta").classList.add(nivel);
    fragmento.querySelector("[data-campo='icone']").className = icone;
    fragmento.querySelector("[data-campo='texto']").textContent = texto;
    container.appendChild(fragmento);
};

// --- SALVAR O PLANO ---
const salvar = (e) => {
    e.preventDefault();

    const payload = {
        rendaMensal: parseFloat(document.getElementById("plano-renda").value) || 0,
        valorGastar: parseFloat(document.getElementById("plano-gastar").value) || 0,
        valorEmergencia: parseFloat(document.getElementById("plano-emergencia").value) || 0,
        valorGuardar: parseFloat(document.getElementById("plano-guardar").value) || 0,
    };

    salvarPlano(payload)
        .then((plano) => {
            exibirSucesso("Plano salvo com sucesso");
            renderizarResumo(plano);
        })
        .catch(exibirErro);
};

export { iniciarPlano };

