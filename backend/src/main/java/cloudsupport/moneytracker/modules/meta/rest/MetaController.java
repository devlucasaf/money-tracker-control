package cloudsupport.moneytracker.modules.meta.rest;

import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import cloudsupport.moneytracker.modules.meta.dto.MetaDTO;
import cloudsupport.moneytracker.modules.meta.service.MetaService;

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

    // --- LISTAR METAS DO USUÁRIO AUTENTICADO ---
    @GetMapping
    public ResponseEntity<List<MetaDTO>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(metaService.listarPorUsuario(usuario.getId()));
    }

    // --- CRIAR NOVA META ---
    @PostMapping
    public ResponseEntity<MetaDTO> criar(@RequestBody @Valid MetaDTO dto, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(metaService.criar(dto, usuario));
    }

    // --- ATUALIZAR META EXISTENTE ---
    @PutMapping("/{id}")
    public ResponseEntity<MetaDTO> atualizar(@PathVariable Long id, @RequestBody @Valid MetaDTO dto,
                                             @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(metaService.atualizar(id, dto, usuario.getId()));
    }

    // --- DELETAR META ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        metaService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

