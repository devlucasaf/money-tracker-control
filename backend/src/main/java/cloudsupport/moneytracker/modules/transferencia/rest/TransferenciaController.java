package cloudsupport.moneytracker.modules.transferencia.rest;

import cloudsupport.moneytracker.modules.transferencia.dto.TransferenciaDTO;
import cloudsupport.moneytracker.modules.transferencia.service.TransferenciaService;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transferencias")
@RequiredArgsConstructor
public class TransferenciaController {

    private final TransferenciaService transferenciaService;

    // --- LISTAR TRANSFERÊNCIAS DO USUÁRIO ---
    @GetMapping
    public ResponseEntity<List<TransferenciaDTO>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(transferenciaService.listarPorUsuario(usuario.getId()));
    }

    // --- CRIAR NOVA TRANSFERÊNCIA ---
    @PostMapping
    public ResponseEntity<TransferenciaDTO> criar(@RequestBody @Valid TransferenciaDTO dto,
                                                  @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(transferenciaService.criar(dto, usuario));
    }

    // --- DELETAR TRANSFERÊNCIA ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        transferenciaService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

