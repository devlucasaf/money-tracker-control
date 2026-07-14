package com.moneytracker.modules.investimento.dto;

import com.moneytracker.modules.investimento.model.ResultadoAposta;
import com.moneytracker.modules.investimento.model.StatusInvestimento;
import com.moneytracker.modules.investimento.model.TipoInvestimento;
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
public class InvestimentoDTO {

    private Long id;

    @NotBlank
    private String nome;

    @NotNull
    private TipoInvestimento tipo;

    @NotNull
    @Positive
    private BigDecimal valorAplicado;
    private BigDecimal valorAtual;
    private String instituicao;
    private BigDecimal taxa;

    @NotNull
    private LocalDate dataAplicacao;
    private LocalDate dataVencimento;
    private StatusInvestimento status;
    private ResultadoAposta resultadoAposta;
    private String observacao;
    private BigDecimal rendimento;
    private BigDecimal percentualRendimento;
}

