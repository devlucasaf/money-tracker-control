import { showSuccess, showError } from '../util.js';
import { login } from '../remotes/auth/loginRemote.js';

const initLogin = () => {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;

        login({ email, senha })
            .then(data => {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.nome);
                showSuccess('Login realizado com sucesso!');
                window.location.hash = '#/dashboard';
            })
            .catch(showError);
    });
};

export { initLogin };
