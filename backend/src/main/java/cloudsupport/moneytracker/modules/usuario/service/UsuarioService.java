package cloudsupport.moneytracker.modules.usuario.service;

import cloudsupport.moneytracker.modules.usuario.dto.AtualizarPerfilDTO;
import cloudsupport.moneytracker.modules.usuario.dto.PerfilDTO;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import cloudsupport.moneytracker.modules.usuario.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // --- BUSCAR USUÁRIO POR ID ---
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }

    // --- BUSCAR USUÁRIO POR E-MAIL ---
    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }

    // --- MONTA O DTO DO PERFIL A PARTIR DE UM USUÁRIO ---
    public PerfilDTO obterPerfil(Usuario usuario) {
        return new PerfilDTO(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getMoeda());
    }

    // --- VALIDA A SENHA ATUAL DO USUÁRIO ---
    public void verificarSenha(Long usuarioId, String senha) {
        var usuario = buscarPorId(usuarioId);
        if (senha == null || !passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new IllegalArgumentException("Senha incorreta");
        }
    }

    // --- ATUALIZAR OS DADOS PESSOAIS DO USUÁRIO ---
    @Transactional
    public PerfilDTO atualizarPerfil(Long usuarioId, AtualizarPerfilDTO dto) {
        var usuario = buscarPorId(usuarioId);

        if (!usuario.getEmail().equalsIgnoreCase(dto.getEmail())
                && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setMoeda(dto.getMoeda());

        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        return obterPerfil(usuarioRepository.save(usuario));
    }
}

