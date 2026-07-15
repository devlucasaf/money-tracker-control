const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// --- CRIA UMA INSTÂNCIA DE DATEPICKER E RETORNA O CONTROLADOR ---
const criarDatepicker = ({ placeholder = "Selecione a data", classeInput = "", aoSelecionar } = {}) => {
    let mesAtual = new Date().getMonth();
    let anoAtual = new Date().getFullYear();
    let dataSelecionada = null;

    // --- ESTRUTURA BASE ---
    const wrapper = document.createElement("div");
    wrapper.className = "custom-datepicker";

    const input = document.createElement("input");
    input.type = "text";
    input.className = `datepicker-input ${classeInput}`.trim();
    input.readOnly = true;
    input.placeholder = placeholder;

    const valorIso = document.createElement("input");
    valorIso.type = "hidden";

    const dropdown = document.createElement("div");
    dropdown.className = "datepicker-dropdown";

    // --- CABEÇALHO ---
    const header = document.createElement("div");
    header.className = "datepicker-header";

    const btnPrev = document.createElement("button");
    btnPrev.type = "button";
    btnPrev.innerHTML = '<i class="pi pi-chevron-left"></i>';

    const btnTitulo = document.createElement("button");
    btnTitulo.type = "button";
    btnTitulo.className = "datepicker-title";
    const spanMesAno = document.createElement("span");
    btnTitulo.appendChild(spanMesAno);
    btnTitulo.insertAdjacentHTML("beforeend", '<i class="pi pi-chevron-down"></i>');

    const btnNext = document.createElement("button");
    btnNext.type = "button";
    btnNext.innerHTML = '<i class="pi pi-chevron-right"></i>';

    header.appendChild(btnPrev);
    header.appendChild(btnTitulo);
    header.appendChild(btnNext);

    // --- DIAS DA SEMANA ---
    const semana = document.createElement("div");
    semana.className = "datepicker-weekdays";
    DIAS_SEMANA.forEach(d => {
        const s = document.createElement("span");
        s.textContent = d;
        semana.appendChild(s);
    });

    // --- GRADES DE DIAS E ANOS ---
    const grDias = document.createElement("div");
    grDias.className = "datepicker-days";

    const grAnos = document.createElement("div");
    grAnos.className = "datepicker-years";

    dropdown.appendChild(header);
    dropdown.appendChild(semana);
    dropdown.appendChild(grDias);
    dropdown.appendChild(grAnos);

    wrapper.appendChild(input);
    wrapper.appendChild(valorIso);
    wrapper.appendChild(dropdown);

    // --- RENDERIZA A GRADE DE DIAS ---
    const renderizarDias = () => {
        spanMesAno.textContent = `${MESES[mesAtual]} ${anoAtual}`;
        grDias.innerHTML = "";

        const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
        const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
        const hoje = new Date();

        // --- ESPAÇOS ANTES DO PRIMEIRO DIA ---
        for (let i = 0; i < primeiroDia; i++) {
            const el = document.createElement("button");
            el.type = "button";
            el.className = "datepicker-day other-month";
            grDias.appendChild(el);
        }

        // --- DIAS DO MÊS ---
        for (let d = 1; d <= diasNoMes; d++) {
            const el = document.createElement("button");
            el.type = "button";
            el.className = "datepicker-day";
            el.textContent = d;

            if (d === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear()) {
                el.classList.add("today");
            }

            if (dataSelecionada && d === dataSelecionada.getDate()
                && mesAtual === dataSelecionada.getMonth() && anoAtual === dataSelecionada.getFullYear()) {
                el.classList.add("selected");
            }

            el.addEventListener("click", () => selecionar(d));
            grDias.appendChild(el);
        }
    };

    // --- RENDERIZA A LISTA DE ANOS ---
    const renderizarAnos = () => {
        grAnos.innerHTML = "";
        const anoRef = new Date().getFullYear();
        const inicio = anoRef - 100;
        const fim = anoRef + 20;

        for (let ano = fim; ano >= inicio; ano--) {
            const el = document.createElement("button");
            el.type = "button";
            el.className = "datepicker-year-item";
            el.textContent = ano;

            if (ano === anoRef) {
                el.classList.add("today");
            }
            if (ano === anoAtual) {
                el.classList.add("selected");
            }

            el.addEventListener("click", () => {
                anoAtual = ano;
                dropdown.classList.remove("showing-years");
                renderizarDias();
            });
            grAnos.appendChild(el);
        }

        const selecionado = grAnos.querySelector(".selected");
        if (selecionado) {
            selecionado.scrollIntoView({ block: "center" });
        }
    };

    // --- SELECIONA UMA DATA ---
    const selecionar = (dia) => {
        dataSelecionada = new Date(anoAtual, mesAtual, dia);
        const iso = `${anoAtual}-${String(mesAtual + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
        valorIso.value = iso;
        input.value = new Intl.DateTimeFormat("pt-BR").format(dataSelecionada);
        dropdown.classList.remove("open");
        if (typeof aoSelecionar === "function") {
            aoSelecionar(iso);
        }
    };

    // --- EVENTOS DE NAVEGAÇÃO ---
    input.addEventListener("click", () => {
        dropdown.classList.toggle("open");
        dropdown.classList.remove("showing-years");
        renderizarDias();
    });

    btnPrev.addEventListener("click", () => {
        mesAtual--;
        if (mesAtual < 0) {
            mesAtual = 11;
            anoAtual--;
        }
        renderizarDias();
    });

    btnNext.addEventListener("click", () => {
        mesAtual++;
        if (mesAtual > 11) {
            mesAtual = 0;
            anoAtual++;
        }
        renderizarDias();
    });

    btnTitulo.addEventListener("click", () => {
        const aberto = dropdown.classList.toggle("showing-years");
        if (aberto) {
            renderizarAnos();
        }
    });

    // --- FECHA AO CLICAR FORA ---
    document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.classList.remove("open");
            dropdown.classList.remove("showing-years");
        }
    });

    // --- CONTROLADOR PÚBLICO ---
    return {
        element: wrapper,
        getValor: () => valorIso.value,
        setValor: (iso) => {
            if (!iso) {
                dataSelecionada = null;
                valorIso.value = "";
                input.value = "";
                return;
            }
            const [ano, mes, dia] = iso.split("-").map(Number);
            dataSelecionada = new Date(ano, mes - 1, dia);
            mesAtual = mes - 1;
            anoAtual = ano;
            valorIso.value = iso;
            input.value = new Intl.DateTimeFormat("pt-BR").format(dataSelecionada);
        },
        limpar: () => {
            dataSelecionada = null;
            valorIso.value = "";
            input.value = "";
            mesAtual = new Date().getMonth();
            anoAtual = new Date().getFullYear();
        },
    };
};

export { criarDatepicker };

