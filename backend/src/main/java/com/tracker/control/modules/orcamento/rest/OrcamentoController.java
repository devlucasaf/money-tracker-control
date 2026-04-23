package com.tracker.control.modules.orcamento.rest;

import com.tracker.control.modules.usuario.model.Usuario;
import com.tracker.control.modules.orcamento.dto.OrcamentoDTO;
import com.tracker.control.modules.orcamento.service.OrcamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orcamentos")
@RequiredArgsConstructor
public class OrcamentoController {

    private final OrcamentoService orcamentoService;

    @GetMapping
    public ResponseEntity<List<OrcamentoDTO>> listar(@AuthenticationPrincipal Usuario usuario,
                                                      @RequestParam Integer mes, @RequestParam Integer ano) {
        return ResponseEntity.ok(orcamentoService.listarPorMes(usuario.getId(), mes, ano));
    }

    @PostMapping
    public ResponseEntity<OrcamentoDTO> criar(@RequestBody @Valid OrcamentoDTO dto,
                                               @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(orcamentoService.criar(dto, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrcamentoDTO> atualizar(@PathVariable Long id, @RequestBody @Valid OrcamentoDTO dto,
                                                   @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(orcamentoService.atualizar(id, dto, usuario.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        orcamentoService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

