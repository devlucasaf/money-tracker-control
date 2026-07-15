package cloudsupport.moneytracker.modules.orcamento.rest;

import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import cloudsupport.moneytracker.modules.orcamento.dto.OrcamentoDTO;
import cloudsupport.moneytracker.modules.orcamento.service.OrcamentoService;

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

    // --- LISTAR ORÇAMENTOS DO USUÁRIO ---
    @GetMapping
    public ResponseEntity<List<OrcamentoDTO>> listar(@AuthenticationPrincipal Usuario usuario,
                                                     @RequestParam(required = false) Integer mes,
                                                     @RequestParam(required = false) Integer ano) {
        if (mes != null && ano != null) {
            return ResponseEntity.ok(orcamentoService.listarPorMes(usuario.getId(), mes, ano));
        }
        return ResponseEntity.ok(orcamentoService.listarPorUsuario(usuario.getId()));
    }

    // --- CRIAR NOVO ORÇAMENTO ---
    @PostMapping
    public ResponseEntity<OrcamentoDTO> criar(@RequestBody @Valid OrcamentoDTO dto,
                                              @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(orcamentoService.criar(dto, usuario));
    }

    // --- ATUALIZAR ORÇAMENTO EXISTENTE ---
    @PutMapping("/{id}")
    public ResponseEntity<OrcamentoDTO> atualizar(@PathVariable Long id, @RequestBody @Valid OrcamentoDTO dto,
                                                  @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(orcamentoService.atualizar(id, dto, usuario.getId()));
    }

    // --- DELETAR ORÇAMENTO ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        orcamentoService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

