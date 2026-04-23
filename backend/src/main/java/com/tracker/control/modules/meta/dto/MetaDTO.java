package com.tracker.control.modules.meta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetaDTO {
    private Long id;

    @NotBlank
    private String titulo;

    private String descricao;

    @NotNull
    @Positive
    private BigDecimal valorAlvo;

    private BigDecimal valorAtual;
    private LocalDate dataLimite;
    private Boolean concluida;
}
