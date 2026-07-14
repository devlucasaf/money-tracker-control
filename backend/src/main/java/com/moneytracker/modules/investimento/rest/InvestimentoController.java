package com.moneytracker.modules.investimento.rest;

import com.moneytracker.modules.investimento.dto.InvestimentoDTO;
import com.moneytracker.modules.investimento.service.InvestimentoService;
import com.moneytracker.modules.usuario.model.Usuario;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investimentos")
@RequiredArgsConstructor
public class InvestimentoController {

    private final InvestimentoService investimentoService;

    @GetMapping
    public ResponseEntity<List<InvestimentoDTO>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(investimentoService.listarPorUsuario(usuario.getId()));
    }

    @PostMapping
    public ResponseEntity<InvestimentoDTO> criar(@RequestBody @Valid InvestimentoDTO dto,
                                                 @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(investimentoService.criar(dto, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvestimentoDTO> atualizar(@PathVariable Long id, @RequestBody @Valid InvestimentoDTO dto,
                                                     @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(investimentoService.atualizar(id, dto, usuario.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        investimentoService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

