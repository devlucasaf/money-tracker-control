package cloudsupport.moneytracker.modules.dashboard.rest;

import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import cloudsupport.moneytracker.modules.dashboard.dto.DashboardDTO;
import cloudsupport.moneytracker.modules.dashboard.service.DashboardService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // --- RESUMO MENSAL DO USUÁRIO ---
    @GetMapping
    public ResponseEntity<DashboardDTO> resumo(@AuthenticationPrincipal Usuario usuario, @RequestParam(required = false) Integer mes,
                                               @RequestParam(required = false) Integer ano) {
        var hoje = LocalDate.now();
        var mesFinal = mes != null ? mes : hoje.getMonthValue();
        var anoFinal = ano != null ? ano : hoje.getYear();

        return ResponseEntity.ok(dashboardService.resumoMensal(usuario.getId(), mesFinal, anoFinal));
    }
}

