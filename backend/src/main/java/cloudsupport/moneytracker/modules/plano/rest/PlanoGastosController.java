package cloudsupport.moneytracker.modules.plano.rest;

import cloudsupport.moneytracker.modules.plano.dto.PlanoGastosDTO;
import cloudsupport.moneytracker.modules.plano.service.PlanoGastosService;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plano-gastos")
@RequiredArgsConstructor
public class PlanoGastosController {

    private final PlanoGastosService planoService;

    // --- OBTER O PLANO DO USUÁRIO ---
    @GetMapping
    public ResponseEntity<PlanoGastosDTO> obterPlanoUsuario(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(planoService.obter(usuario.getId()));
    }

    // --- CRIAR OU ATUALIZAR O PLANO ---
    @PutMapping
    public ResponseEntity<PlanoGastosDTO> salvarPlano(@RequestBody @Valid PlanoGastosDTO dto, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(planoService.salvar(dto, usuario));
    }
}

