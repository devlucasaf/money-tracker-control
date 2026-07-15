package cloudsupport.moneytracker.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaValorDTO {
    private String      categoriaNome;
    private String      cor;
    private BigDecimal  valor;
}

