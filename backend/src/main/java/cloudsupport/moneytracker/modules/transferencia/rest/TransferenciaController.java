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
    public ResponseEntity<List<TransferenciaDTO>> listarTransferencias(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(transferenciaService.listarTransferenciPorUsuario(usuario.getId()));
    }

    // --- CRIAR NOVA TRANSFERÊNCIA ---
    @PostMapping
    public ResponseEntity<TransferenciaDTO> criarNovaTransferencia(@RequestBody @Valid TransferenciaDTO dto,
                                                                   @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(transferenciaService.criarTransferencia(dto, usuario));
    }

    // --- DELETAR TRANSFERÊNCIA ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTransferencia(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        transferenciaService.deletarTransferencia(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

