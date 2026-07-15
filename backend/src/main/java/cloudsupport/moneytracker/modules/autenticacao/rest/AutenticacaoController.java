package cloudsupport.moneytracker.modules.autenticacao.rest;

import cloudsupport.moneytracker.dto.auth.LoginRequestDTO;
import cloudsupport.moneytracker.dto.auth.LoginResponseDTO;
import cloudsupport.moneytracker.dto.auth.RegisterRequestDTO;
import cloudsupport.moneytracker.modules.autenticacao.service.AutenticacaoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AutenticacaoController {

    // --- SERVIÇO DE AUTENTICAÇÃO ---
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

