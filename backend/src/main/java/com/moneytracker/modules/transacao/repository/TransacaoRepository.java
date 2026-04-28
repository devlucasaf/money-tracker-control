package com.moneytracker.modules.transacao.repository;

import com.moneytracker.modules.transacao.model.Transacao;
import com.moneytracker.modules.transacao.model.TipoTransacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    Page<Transacao> findByUsuarioId(Long usuarioId, Pageable pageable);

    List<Transacao> findByUsuarioIdAndDataBetween(Long usuarioId, LocalDate inicio, LocalDate fim);

    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.usuario.id = :uid AND t.tipo = :tipo AND t.data BETWEEN :inicio AND :fim")
    BigDecimal somarPorTipoEPeriodo(@Param("uid") Long usuarioId, @Param("tipo") TipoTransacao tipo,
                                    @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.usuario.id = :uid AND t.tipo = 'DESPESA' AND t.categoria.id = :catId AND t.data BETWEEN :inicio AND :fim")
    BigDecimal somarDespesaPorCategoriaEPeriodo(@Param("uid") Long usuarioId, @Param("catId") Long categoriaId,
                                                @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}

