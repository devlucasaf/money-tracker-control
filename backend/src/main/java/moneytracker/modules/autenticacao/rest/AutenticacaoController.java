package moneytracker.modules.autenticacao.rest;

import moneytracker.dto.auth.LoginRequestDTO;
import moneytracker.dto.auth.LoginResponseDTO;
import moneytracker.dto.auth.RegisterRequestDTO;
import moneytracker.modules.autenticacao.service.AutenticacaoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AutenticacaoController {

    private final AutenticacaoService autenticacaoService;

    // --- LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        return ResponseEntity.ok(autenticacaoService.login(dto));
    }

    // --- CADASTRO ---
    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(@RequestBody @Valid RegisterRequestDTO dto) {
        return ResponseEntity.ok(autenticacaoService.register(dto));
    }
}

