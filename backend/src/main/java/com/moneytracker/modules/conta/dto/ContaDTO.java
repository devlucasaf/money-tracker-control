package com.moneytracker.modules.conta.dto;

import com.moneytracker.modules.conta.model.TipoConta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContaDTO {
    private Long        id;

    @NotBlank
    private String      nome;

    @NotNull
    private TipoConta   tipo;

    private BigDecimal  saldo;
    private String      cor;
    private String      icone;
    private Boolean     ativo;
}
