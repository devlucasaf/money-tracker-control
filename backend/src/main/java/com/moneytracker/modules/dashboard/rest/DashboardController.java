package com.moneytracker.modules.dashboard.rest;

import com.moneytracker.modules.usuario.model.Usuario;
import com.moneytracker.modules.dashboard.dto.DashboardDTO;
import com.moneytracker.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDTO> resumo(@AuthenticationPrincipal Usuario usuario,
                                               @RequestParam Integer mes, @RequestParam Integer ano) {
        return ResponseEntity.ok(dashboardService.resumoMensal(usuario.getId(), mes, ano));
    }
}

