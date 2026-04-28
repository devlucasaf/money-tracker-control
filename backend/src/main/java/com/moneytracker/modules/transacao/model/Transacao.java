package com.moneytracker.modules.transacao.model;

import com.moneytracker.modules.categoria.model.Categoria;
import com.moneytracker.modules.conta.model.Conta;
import com.moneytracker.modules.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

