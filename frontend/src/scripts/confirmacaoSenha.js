import { verificarSenha } from "./remotes/usuario/usuarioRemote.js";

// --- MODAL DE CONFIRMAÇÃO POR SENHA PARA AÇÕES CRÍTICAS ---
const confirmarComSenha = (opcoes = {}) => {
    const {
        titulo = "Confirme sua senha",
        mensagem = "Digite sua senha para continuar.",
        textoConfirmar = "Confirmar",
    } = typeof opcoes === "string" ? { mensagem: opcoes } : opcoes;

    return new Promise((resolve) => {
        const overlay = document.getElementById("modal-senha");

        if (!overlay) {
            resolve(true);
            return;
        }

        const input = document.getElementById("senha-input");
        const erro = document.getElementById("senha-erro");
        const btnConfirmar = document.getElementById("senha-confirmar");
        const btnCancelar = document.getElementById("senha-cancelar");

        document.getElementById("senha-titulo").textContent = titulo;
        document.getElementById("senha-mensagem").textContent = mensagem;
        btnConfirmar.textContent = textoConfirmar;

        input.value = "";
        erro.textContent = "";
        btnConfirmar.disabled = false;

        overlay.classList.remove("hidden");
        input.focus();

        // --- LIMPA OS EVENTOS E FECHA ---
        const fechar = (resultado) => {
            overlay.classList.add("hidden");
            btnConfirmar.removeEventListener("click", aoConfirmar);
            btnCancelar.removeEventListener("click", aoCancelar);
            overlay.removeEventListener("click", aoClicarFora);
            input.removeEventListener("keydown", aoTeclar);
            resolve(resultado);
        };

        // --- VALIDA A SENHA NO BACKEND ---
        const aoConfirmar = () => {
            const senha = input.value;
            if (!senha) {
                erro.textContent = "Informe sua senha.";
                return;
            }

            btnConfirmar.disabled = true;
            erro.textContent = "";

            verificarSenha(senha)
                .then(() => fechar(true))
                .catch((e) => {
                    btnConfirmar.disabled = false;
                    erro.textContent = e instanceof Error ? e.message : "Senha incorreta.";
                    input.select();
                });
        };

        const aoCancelar = () => fechar(false);

        const aoClicarFora = (e) => {
            if (e.target === overlay) {
                fechar(false);
            }
        };

        const aoTeclar = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                aoConfirmar();
            } else if (e.key === "Escape") {
                fechar(false);
            }
        };

        btnConfirmar.addEventListener("click", aoConfirmar);
        btnCancelar.addEventListener("click", aoCancelar);
        overlay.addEventListener("click", aoClicarFora);
        input.addEventListener("keydown", aoTeclar);
    });
};

export { confirmarComSenha };

