package cloudsupport.moneytracker.modules.categoria.rest;

import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import cloudsupport.moneytracker.modules.categoria.dto.CategoriaDTO;
import cloudsupport.moneytracker.modules.categoria.service.CategoriaService;

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

    // --- LISTAR CATEGORIAS DO USUÁRIO AUTENTICADO ---
    @GetMapping
    public ResponseEntity<List<CategoriaDTO>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(categoriaService.listarPorUsuario(usuario.getId()));
    }

    // --- CRIAR NOVA CATEGORIA ---
    @PostMapping
    public ResponseEntity<CategoriaDTO> criar(@RequestBody @Valid CategoriaDTO dto,
                                              @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(categoriaService.criar(dto, usuario));
    }

    // --- ATUALIZAR CATEGORIA EXISTENTE ---
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaDTO> atualizar(@PathVariable Long id,
                                                  @RequestBody @Valid CategoriaDTO dto,
                                                  @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(categoriaService.atualizar(id, dto, usuario.getId()));
    }

    // --- DELETAR CATEGORIA ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id,
                                        @AuthenticationPrincipal Usuario usuario) {
        categoriaService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

