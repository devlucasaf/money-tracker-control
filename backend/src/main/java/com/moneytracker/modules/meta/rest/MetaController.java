package com.moneytracker.modules.meta.rest;

import com.moneytracker.modules.usuario.model.Usuario;
import com.moneytracker.modules.meta.dto.MetaDTO;
import com.moneytracker.modules.meta.service.MetaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metas")
@RequiredArgsConstructor
public class MetaController {

    private final MetaService metaService;

    @GetMapping
    public ResponseEntity<List<MetaDTO>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(metaService.listarPorUsuario(usuario.getId()));
    }

    @PostMapping
    public ResponseEntity<MetaDTO> criar(@RequestBody @Valid MetaDTO dto, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(metaService.criar(dto, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MetaDTO> atualizar(@PathVariable Long id, @RequestBody @Valid MetaDTO dto,
                                             @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(metaService.atualizar(id, dto, usuario.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        metaService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

