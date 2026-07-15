package cloudsupport.moneytracker.modules.contapagar.dto;

import cloudsupport.moneytracker.modules.contapagar.model.TipoContaPagar;

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
public class ContaPagarDTO {

    private Long            id;

    @NotBlank
    private String          descricao;

    @NotNull
    @Positive
    private BigDecimal      valor;

    @NotNull
    private TipoContaPagar  tipo;

    @NotNull
    private LocalDate       dataVencimento;

    private Boolean         pago;
    private LocalDate       dataPagamento;

    // --- CONTA OPCIONAL ---
    private Long            contaId;
    private String          contaNome;
}

