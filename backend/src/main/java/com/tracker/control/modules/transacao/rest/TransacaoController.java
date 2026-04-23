package com.tracker.control.modules.transacao.rest;

import com.tracker.control.modules.usuario.model.Usuario;
import com.tracker.control.modules.transacao.dto.TransacaoDTO;
import com.tracker.control.modules.transacao.service.TransacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transacoes")
@RequiredArgsConstructor
public class TransacaoController {

    private final TransacaoService transacaoService;

    @GetMapping
    public ResponseEntity<Page<TransacaoDTO>> listar(@AuthenticationPrincipal Usuario usuario,
                                                      @PageableDefault(size = 20, sort = "data") Pageable pageable) {
        return ResponseEntity.ok(transacaoService.listarPorUsuario(usuario.getId(), pageable));
    }

    @PostMapping
    public ResponseEntity<TransacaoDTO> criar(@RequestBody @Valid TransacaoDTO dto,
                                               @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(transacaoService.criar(dto, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransacaoDTO> atualizar(@PathVariable Long id, @RequestBody @Valid TransacaoDTO dto,
                                                   @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(transacaoService.atualizar(id, dto, usuario.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        transacaoService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

