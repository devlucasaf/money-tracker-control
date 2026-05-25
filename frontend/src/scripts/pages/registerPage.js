import { showSuccess, showError } from '../util.js';
import { register } from '../remotes/auth/registerRemote.js';

const initRegister = () => {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome  = document.getElementById('register-nome').value;
        const email = document.getElementById('register-email').value;
        const senha = document.getElementById('register-senha').value;

        register({ nome, email, senha })
            .then(data => {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.nome);
                showSuccess('Conta criada com sucesso!');
                window.location.hash = '#/dashboard';
            })
            .catch(showError);
    });
};

export { initRegister };
