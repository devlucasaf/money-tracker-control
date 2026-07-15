package cloudsupport.moneytracker.modules.transacao.dto;

import cloudsupport.moneytracker.modules.transacao.model.FrequenciaRecorrencia;
import cloudsupport.moneytracker.modules.transacao.model.TipoTransacao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransacaoDTO {

    private Long                    id;
    @NotBlank
    private String                  descricao;
    @NotNull
    @Positive
    private BigDecimal              valor;
    @NotNull
    private TipoTransacao           tipo;
    @NotNull
    private LocalDate               data;
    private String                  observacao;
    @NotNull
    private Long                    categoriaId;
    private String                  categoriaNome;
    @NotNull
    private Long                    contaId;
    private String                  contaNome;
    private Boolean                 recorrente;
    private FrequenciaRecorrencia   frequencia;
    private LocalDate               proximaData;
    private Set<String>             tags;
    private Integer                 parcelas;
}
