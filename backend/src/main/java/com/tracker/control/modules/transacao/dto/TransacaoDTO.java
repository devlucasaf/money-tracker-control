package com.tracker.control.modules.transacao.dto;

import com.tracker.control.modules.transacao.model.TipoTransacao;
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
public class TransacaoDTO {

    private Long id;

    @NotBlank
    private String descricao;

    @NotNull
    @Positive
    private BigDecimal valor;

    @NotNull
    private TipoTransacao tipo;

    @NotNull
    private LocalDate data;

    private String observacao;

    @NotNull
    private Long categoriaId;

    private String categoriaNome;

    @NotNull
    private Long contaId;

    private String contaNome;
}
