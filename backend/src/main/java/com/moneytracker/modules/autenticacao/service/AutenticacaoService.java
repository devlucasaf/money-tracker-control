package com.moneytracker.modules.autenticacao.service;

import com.moneytracker.dto.auth.LoginRequestDTO;
import com.moneytracker.dto.auth.LoginResponseDTO;
import com.moneytracker.dto.auth.RegisterRequestDTO;
import com.moneytracker.modules.usuario.model.Usuario;
import com.moneytracker.infra.security.TokenService;
import com.moneytracker.modules.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AutenticacaoService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder   passwordEncoder;
    private final TokenService      tokenService;

    public LoginResponseDTO login(LoginRequestDTO dto) {
        var usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        var token = tokenService.generateToken(usuario.getEmail());
        return new LoginResponseDTO(token, usuario.getId(), usuario.getNome());
    }

    public LoginResponseDTO register(RegisterRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        var usuario = Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .senha(passwordEncoder.encode(dto.getSenha()))
                .ativo(true)
                .build();

        usuarioRepository.save(usuario);

        var token = tokenService.generateToken(usuario.getEmail());
        return new LoginResponseDTO(token, usuario.getId(), usuario.getNome());
    }
}
