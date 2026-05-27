import { exibirSucesso, exibirErro } from '../util.js';
import { logar } from '../remotes/auth/loginRemote.js';

const iniciarLogin = () => {
    const formulario = document.getElementById('login-form');
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        logar({ email, senha })
            .then(dados => {
                localStorage.setItem('token', dados.token);
                localStorage.setItem('userName', dados.nome);
                exibirSucesso('Login realizado com sucesso!');
                window.location.hash = '#/dashboard';
            })
            .catch(exibirErro);
    });
};

export { iniciarLogin };
