package com.tracker.control.modules.orcamento.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrcamentoDTO {
    private Long id;

    @NotNull
    @Positive
    private BigDecimal valorLimite;

    @NotNull
    private Integer mes;

    @NotNull
    private Integer ano;

    @NotNull
    private Long categoriaId;

    private String categoriaNome;
    private BigDecimal valorGasto;
}
