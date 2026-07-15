package cloudsupport.moneytracker.modules.transacao.model;

import cloudsupport.moneytracker.modules.categoria.model.Categoria;
import cloudsupport.moneytracker.modules.conta.model.Conta;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "transacoes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transacao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descricao;
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    private TipoTransacao tipo;

    private LocalDate data;
    private String observacao;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "transacao_tags", joinColumns = @JoinColumn(name = "transacao_id"))
    @Column(name = "tag")
    @Builder.Default
    private Set<String> tags = new HashSet<>();

    @Column(name = "recorrente")
    private Boolean recorrente;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequencia")
    private FrequenciaRecorrencia frequencia;

    @Column(name = "proxima_data")
    private LocalDate proximaData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conta_id")
    private Conta conta;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (recorrente == null) {
            recorrente = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

