package cloudsupport.moneytracker.modules.orcamento.model;

import cloudsupport.moneytracker.modules.categoria.model.Categoria;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orcamentos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Orcamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "valor_limite")
    private BigDecimal valorLimite;

    @Column(name = "rollover")
    private Boolean rollover;

    private Integer mes;
    private Integer ano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

