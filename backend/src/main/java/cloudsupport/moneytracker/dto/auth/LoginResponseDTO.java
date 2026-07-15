package cloudsupport.moneytracker.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private Long    usuarioId;
    private String  nome;
    private String  email;
    private String  moeda;
    private String  token;
}
