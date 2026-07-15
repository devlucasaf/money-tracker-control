package cloudsupport.moneytracker.modules.usuario.rest;

import cloudsupport.moneytracker.modules.usuario.dto.AtualizarPerfilDTO;
import cloudsupport.moneytracker.modules.usuario.dto.PerfilDTO;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import cloudsupport.moneytracker.modules.usuario.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // --- OBTER O PERFIL DO USUÁRIO AUTENTICADO ---
    @GetMapping("/me")
    public ResponseEntity<PerfilDTO> obterPerfil(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(usuarioService.obterPerfil(usuario));
    }

    // --- ATUALIZAR OS DADOS PESSOAIS DO USUÁRIO AUTENTICADO ---
    @PutMapping("/me")
    public ResponseEntity<PerfilDTO> atualizarPerfil(@AuthenticationPrincipal Usuario usuario,
                                                     @RequestBody @Valid AtualizarPerfilDTO dto) {
        return ResponseEntity.ok(usuarioService.atualizarPerfil(usuario.getId(), dto));
    }
}

