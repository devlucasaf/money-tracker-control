import { exibirSucesso, exibirErro, configurarToggleSenha } from "../util.js";
import { registrar } from "../remotes/auth/registerRemote.js";

const iniciarRegistro = () => {
    configurarToggleSenha();

    // Custom select para moeda
    const wrapperMoeda = document.getElementById("register-moeda-wrapper");
    const toggleMoeda = document.getElementById("register-moeda-toggle");
    const opcoesMoeda = document.getElementById("register-moeda-options");

    toggleMoeda.addEventListener("click", () => {
        wrapperMoeda.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest("#register-moeda-wrapper")) {
            wrapperMoeda.classList.remove("open");
        }
    });

    opcoesMoeda.querySelectorAll(".custom-select-option").forEach(opt => {
        opt.addEventListener("click", () => {
            opcoesMoeda.querySelectorAll(".custom-select-option").forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
            document.getElementById("register-moeda-label").textContent = opt.textContent;
            document.getElementById("register-moeda").value = opt.dataset.value;
            wrapperMoeda.classList.remove("open");
        });
    });

    // Form submit
    const formulario = document.getElementById("register-form");
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome  = document.getElementById("register-nome").value;
        const email = document.getElementById("register-email").value;
        const senha = document.getElementById("register-senha").value;
        const moeda = document.getElementById("register-moeda").value;

        registrar({ nome, email, senha, moeda })
            .then(dados => {
                localStorage.setItem("token", dados.token);
                localStorage.setItem("userName", dados.nome);
                localStorage.setItem("userEmail", dados.email ?? email);
                localStorage.setItem("userCurrency", dados.moeda ?? moeda);
                exibirSucesso("Conta criada com sucesso!");
                window.location.hash = "#/transacoes";
            })
            .catch(exibirErro);
    });
};

export { iniciarRegistro };
