package com.tracker.control.modules.categoria.dto;

import com.tracker.control.modules.transacao.model.TipoTransacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaDTO {
    private Long id;

    @NotBlank
    private String nome;

    @NotNull
    private TipoTransacao tipo;

    private String icone;
    private String cor;
}
