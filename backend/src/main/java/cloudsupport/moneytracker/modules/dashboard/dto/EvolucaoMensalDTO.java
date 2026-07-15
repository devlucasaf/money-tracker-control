package cloudsupport.moneytracker.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvolucaoMensalDTO {
    private Integer     mes;
    private Integer     ano;
    private BigDecimal  receitas;
    private BigDecimal  despesas;
}

