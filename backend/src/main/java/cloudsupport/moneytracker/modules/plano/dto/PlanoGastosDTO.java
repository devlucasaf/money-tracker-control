package cloudsupport.moneytracker.modules.plano.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanoGastosDTO {

    private Long        id;

    @NotNull
    @PositiveOrZero
    private BigDecimal  rendaMensal;

    @NotNull
    @PositiveOrZero
    private BigDecimal  valorGastar;

    @NotNull
    @PositiveOrZero
    private BigDecimal  valorEmergencia;

    @NotNull
    @PositiveOrZero
    private BigDecimal  valorGuardar;

    private BigDecimal  gastoAtualMes;
}

