package com.tracker.control.modules.categoria.rest;

import com.tracker.control.modules.usuario.model.Usuario;
import com.tracker.control.modules.categoria.dto.CategoriaDTO;
import com.tracker.control.modules.categoria.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<List<CategoriaDTO>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(categoriaService.listarPorUsuario(usuario.getId()));
    }

    @PostMapping
    public ResponseEntity<CategoriaDTO> criar(@RequestBody @Valid CategoriaDTO dto,
                                               @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(categoriaService.criar(dto, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaDTO> atualizar(@PathVariable Long id,
                                                   @RequestBody @Valid CategoriaDTO dto,
                                                   @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(categoriaService.atualizar(id, dto, usuario.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id,
                                         @AuthenticationPrincipal Usuario usuario) {
        categoriaService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

