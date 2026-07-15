package cloudsupport.moneytracker.modules.contapagar.rest;

import cloudsupport.moneytracker.modules.contapagar.dto.ContaPagarDTO;
import cloudsupport.moneytracker.modules.contapagar.service.ContaPagarService;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contas-pagar")
@RequiredArgsConstructor
public class ContaPagarController {

    private final ContaPagarService contaPagarService;

    // --- LISTAR COMPROMISSOS ---
    @GetMapping
    public ResponseEntity<List<ContaPagarDTO>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(contaPagarService.listarPorUsuario(usuario.getId()));
    }

    // --- CRIAR ---
    @PostMapping
    public ResponseEntity<ContaPagarDTO> criar(@RequestBody @Valid ContaPagarDTO dto,
                                               @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(contaPagarService.criar(dto, usuario));
    }

    // --- ATUALIZAR ---
    @PutMapping("/{id}")
    public ResponseEntity<ContaPagarDTO> atualizar(@PathVariable Long id, @RequestBody @Valid ContaPagarDTO dto,
                                                   @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(contaPagarService.atualizar(id, dto, usuario.getId()));
    }

    // --- MARCAR COMO PAGO/RECEBIDO ---
    @PostMapping("/{id}/pagar")
    public ResponseEntity<ContaPagarDTO> pagar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(contaPagarService.marcarComoPago(id, usuario.getId()));
    }

    // --- DESMARCAR ---
    @PostMapping("/{id}/desmarcar")
    public ResponseEntity<ContaPagarDTO> desmarcar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(contaPagarService.desmarcar(id, usuario.getId()));
    }

    // --- DELETAR ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        contaPagarService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

