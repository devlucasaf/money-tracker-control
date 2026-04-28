package com.moneytracker.modules.orcamento.model;

import com.moneytracker.modules.categoria.model.Categoria;
import com.moneytracker.modules.usuario.model.Usuario;
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

