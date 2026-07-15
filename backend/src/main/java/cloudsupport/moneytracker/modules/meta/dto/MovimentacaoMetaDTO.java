package cloudsupport.moneytracker.modules.meta.dto;

import cloudsupport.moneytracker.modules.meta.model.TipoMovimentacaoMeta;
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
public class MovimentacaoMetaDTO {

    private Long                    id;
    private Long                    metaId;
    @NotNull
    private TipoMovimentacaoMeta    tipo;
    @NotNull
    @Positive
    private BigDecimal              valor;
    @NotNull
    private LocalDate               data;
    private Long                    contaId;
    private String                  contaNome;
    private BigDecimal              acumulado;
}

