package cloudsupport.moneytracker.modules.plano.model;

import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "planos_gastos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlanoGastos {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;

    @Column(name = "renda_mensal")
    private BigDecimal rendaMensal;

    @Column(name = "valor_gastar")
    private BigDecimal valorGastar;

    @Column(name = "valor_emergencia")
    private BigDecimal valorEmergencia;

    @Column(name = "valor_guardar")
    private BigDecimal valorGuardar;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

