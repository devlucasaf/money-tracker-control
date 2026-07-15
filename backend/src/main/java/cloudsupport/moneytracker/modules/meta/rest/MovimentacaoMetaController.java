package cloudsupport.moneytracker.modules.meta.rest;

import cloudsupport.moneytracker.modules.meta.dto.MovimentacaoMetaDTO;
import cloudsupport.moneytracker.modules.meta.service.MovimentacaoMetaService;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metas/{metaId}/movimentacoes")
@RequiredArgsConstructor
public class MovimentacaoMetaController {

    private final MovimentacaoMetaService movimentacaoService;

    // --- LISTAR MOVIMENTAÇÕES DA META ---
    @GetMapping
    public ResponseEntity<List<MovimentacaoMetaDTO>> listar(@PathVariable Long metaId,
                                                            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(movimentacaoService.listar(metaId, usuario.getId()));
    }

    // --- REGISTRAR APORTE OU RESGATE ---
    @PostMapping
    public ResponseEntity<MovimentacaoMetaDTO> registrar(@PathVariable Long metaId,
                                                         @RequestBody @Valid MovimentacaoMetaDTO dto,
                                                         @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(movimentacaoService.registrar(metaId, dto, usuario));
    }

    // --- DELETAR MOVIMENTAÇÃO ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long metaId, @PathVariable Long id,
                                        @AuthenticationPrincipal Usuario usuario) {
        movimentacaoService.deletar(metaId, id, usuario);
        return ResponseEntity.noContent().build();
    }
}

