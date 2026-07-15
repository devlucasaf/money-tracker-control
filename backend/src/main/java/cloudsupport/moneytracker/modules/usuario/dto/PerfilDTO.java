package cloudsupport.moneytracker.modules.usuario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerfilDTO {
    private Long    id;
    private String  nome;
    private String  email;
    private String  moeda;
}

