package com.moneytracker.modules.categoria.model;

import com.moneytracker.modules.transacao.model.TipoTransacao;
import com.moneytracker.modules.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categorias")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Categoria {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Enumerated(EnumType.STRING)
    private TipoTransacao tipo;

    private String icone;
    private String cor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
