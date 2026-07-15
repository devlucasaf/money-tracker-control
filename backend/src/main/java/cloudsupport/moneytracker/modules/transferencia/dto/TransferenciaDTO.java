package cloudsupport.moneytracker.modules.transferencia.dto;

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
public class TransferenciaDTO {

    private Long        id;
    @NotNull
    @Positive
    private BigDecimal  valor;
    @NotNull
    private LocalDate   data;
    private String      descricao;
    @NotNull
    private Long        contaOrigemId;
    private String      contaOrigemNome;
    @NotNull
    private Long        contaDestinoId;
    private String      contaDestinoNome;
}

