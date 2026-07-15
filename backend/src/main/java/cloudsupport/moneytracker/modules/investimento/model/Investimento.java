package cloudsupport.moneytracker.modules.investimento.model;

import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "investimentos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Investimento {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoInvestimento tipo;

    @Column(name = "valor_aplicado", nullable = false)
    private BigDecimal valorAplicado;

    @Column(name = "valor_atual")
    private BigDecimal valorAtual;

    private String instituicao;

    private BigDecimal taxa;

    @Column(name = "data_aplicacao", nullable = false)
    private LocalDate dataAplicacao;

    @Column(name = "data_vencimento")
    private LocalDate dataVencimento;

    @Enumerated(EnumType.STRING)
    private StatusInvestimento status;

    @Enumerated(EnumType.STRING)
    @Column(name = "resultado_aposta")
    private ResultadoAposta resultadoAposta;

    private String observacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = StatusInvestimento.ATIVO;
        }
        if (valorAtual == null) {
            valorAtual = valorAplicado;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

