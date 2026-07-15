package cloudsupport.moneytracker.modules.autenticacao.service;

import cloudsupport.moneytracker.dto.auth.LoginRequestDTO;
import cloudsupport.moneytracker.dto.auth.LoginResponseDTO;
import cloudsupport.moneytracker.dto.auth.RegisterRequestDTO;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import cloudsupport.moneytracker.infra.security.TokenService;
import cloudsupport.moneytracker.modules.usuario.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AutenticacaoService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    // --- LOGIN ---
    public LoginResponseDTO login(LoginRequestDTO dto) {
        var usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        var token = tokenService.generateToken(usuario.getEmail());
        return new LoginResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getMoeda(), token);
    }

    // --- CADASTRO ---
    public LoginResponseDTO register(RegisterRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        var usuario = Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .senha(passwordEncoder.encode(dto.getSenha()))
                .moeda(dto.getMoeda() != null && !dto.getMoeda().isBlank() ? dto.getMoeda() : "BRL")
                .ativo(true)
                .build();

        usuarioRepository.save(usuario);

        // --- GERA O TOKEN E RETORNA OS DADOS DO USUÁRIO ---
        var token = tokenService.generateToken(usuario.getEmail());
        return new LoginResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getMoeda(), token);
    }
}
