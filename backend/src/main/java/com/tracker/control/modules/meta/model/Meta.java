package com.tracker.control.modules.meta.model;

import com.tracker.control.modules.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "metas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Meta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descricao;

    @Column(name = "valor_alvo")
    private BigDecimal valorAlvo;

    @Column(name = "valor_atual")
    private BigDecimal valorAtual;

    @Column(name = "data_limite")
    private LocalDate dataLimite;

    private Boolean concluida;

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
        if (concluida == null) {
            concluida = false;
        }

        if (valorAtual == null) {
            valorAtual = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

