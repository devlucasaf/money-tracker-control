import { exibirSucesso, exibirErro } from "../util.js";
import { registrar } from "../remotes/auth/registerRemote.js";

const iniciarRegistro = () => {
    const formulario = document.getElementById("register-form");
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome  = document.getElementById("register-nome").value;
        const email = document.getElementById("register-email").value;
        const senha = document.getElementById("register-senha").value;
        const moeda = document.getElementById("register-moeda").value;

        registrar({ nome, email, senha })
            .then(dados => {
                localStorage.setItem("token", dados.token);
                localStorage.setItem("userName", dados.nome);
                localStorage.setItem("userCurrency", moeda);
                exibirSucesso("Conta criada com sucesso!");
                window.location.hash = "#/dashboard";
            })
            .catch(exibirErro);
    });
};

export { iniciarRegistro };
