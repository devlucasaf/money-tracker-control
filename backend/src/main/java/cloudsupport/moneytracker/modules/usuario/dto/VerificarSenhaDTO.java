package cloudsupport.moneytracker.modules.usuario.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificarSenhaDTO {
    @NotBlank
    private String senha;
}

