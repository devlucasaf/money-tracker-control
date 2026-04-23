package com.tracker.control.modules.dashboard.rest;

import com.tracker.control.modules.usuario.model.Usuario;
import com.tracker.control.modules.dashboard.dto.DashboardDTO;
import com.tracker.control.modules.dashboard.service.DashboardService;
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

