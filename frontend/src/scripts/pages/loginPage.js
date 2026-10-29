import { exibirSucesso, exibirErro, configurarToggleSenha } from "../util.js";
import { irPara }                                           from "../router.js";
import { logar }                                            from "../remotes/auth/loginRemote.js";

const iniciarLogin = () => {
    configurarToggleSenha();
    const formulario = document.getElementById("login-form");
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const senha = document.getElementById("login-senha").value;

        logar({ email, senha })
            .then(dados => {
                localStorage.setItem("token", dados.token);
                localStorage.setItem("userName", dados.nome);
                localStorage.setItem("userEmail", dados.email ?? email);
                localStorage.setItem("userCurrency", dados.moeda ?? "BRL");
                exibirSucesso("Login realizado com sucesso!");
                irPara("/transacoes");
            })
            .catch(exibirErro);
    });
};

export { iniciarLogin };
