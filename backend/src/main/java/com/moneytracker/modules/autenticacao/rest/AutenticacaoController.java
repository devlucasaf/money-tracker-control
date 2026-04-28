package com.moneytracker.modules.autenticacao.rest;

import com.moneytracker.dto.auth.LoginRequestDTO;
import com.moneytracker.dto.auth.LoginResponseDTO;
import com.moneytracker.dto.auth.RegisterRequestDTO;
import com.moneytracker.modules.autenticacao.service.AutenticacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AutenticacaoController {

    private final AutenticacaoService autenticacaoService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        return ResponseEntity.ok(autenticacaoService.login(dto));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(@RequestBody @Valid RegisterRequestDTO dto) {
        return ResponseEntity.ok(autenticacaoService.register(dto));
    }
}

