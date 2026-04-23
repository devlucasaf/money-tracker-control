package com.tracker.control.modules.conta.rest;

import com.tracker.control.modules.usuario.model.Usuario;
import com.tracker.control.modules.conta.dto.ContaDTO;
import com.tracker.control.modules.conta.service.ContaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contas")
@RequiredArgsConstructor
public class ContaController {

    private final ContaService contaService;

    @GetMapping
    public ResponseEntity<List<ContaDTO>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(contaService.listarPorUsuario(usuario.getId()));
    }

    @PostMapping
    public ResponseEntity<ContaDTO> criar(@RequestBody @Valid ContaDTO dto, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(contaService.criar(dto, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContaDTO> atualizar(@PathVariable Long id, @RequestBody @Valid ContaDTO dto,
                                               @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(contaService.atualizar(id, dto, usuario.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        contaService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

