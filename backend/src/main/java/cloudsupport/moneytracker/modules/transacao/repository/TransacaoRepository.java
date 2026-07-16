package cloudsupport.moneytracker.modules.transacao.repository;

import cloudsupport.moneytracker.modules.dashboard.dto.CategoriaValorDTO;
import cloudsupport.moneytracker.modules.transacao.model.Transacao;
import cloudsupport.moneytracker.modules.transacao.model.TipoTransacao;

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

    List<Transacao> findByRecorrenteTrueAndProximaDataLessThanEqual(LocalDate data);

    // --- RECORRENTES DO USUÁRIO COM PRÓXIMA OCORRÊNCIA NUM INTERVALO ---
    List<Transacao> findByUsuarioIdAndRecorrenteTrueAndProximaDataBetween(Long usuarioId, LocalDate inicio, LocalDate fim);

    // --- LISTAGEM COM FILTROS OPCIONAIS ---
    @Query("SELECT t FROM Transacao t WHERE t.usuario.id = :uid " +
            "AND (:busca IS NULL OR LOWER(t.descricao) LIKE LOWER(CONCAT('%', :busca, '%'))) " +
            "AND (:categoriaId IS NULL OR t.categoria.id = :categoriaId) " +
            "AND (:contaId IS NULL OR t.conta.id = :contaId) " +
            "AND (:tipo IS NULL OR t.tipo = :tipo) " +
            "AND (:inicio IS NULL OR t.data >= :inicio) " +
            "AND (:fim IS NULL OR t.data <= :fim) " +
            "AND (:tag IS NULL OR :tag MEMBER OF t.tags)")
    Page<Transacao> filtrar(@Param("uid") Long usuarioId,
                            @Param("busca") String busca,
                            @Param("categoriaId") Long categoriaId,
                            @Param("contaId") Long contaId,
                            @Param("tipo") TipoTransacao tipo,
                            @Param("inicio") LocalDate inicio,
                            @Param("fim") LocalDate fim,
                            @Param("tag") String tag,
                            Pageable pageable);

    // --- DESPESAS AGRUPADAS POR CATEGORIA NO PERÍODO ---
    @Query("SELECT new cloudsupport.moneytracker.modules.dashboard.dto.CategoriaValorDTO(" +
            "c.nome, c.cor, COALESCE(SUM(t.valor), 0)) " +
            "FROM Transacao t JOIN t.categoria c " +
            "WHERE t.usuario.id = :uid AND t.tipo = 'DESPESA' AND t.data BETWEEN :inicio AND :fim " +
            "GROUP BY c.nome, c.cor ORDER BY SUM(t.valor) DESC")
    List<CategoriaValorDTO> somarDespesasPorCategoria(@Param("uid") Long usuarioId,
                                                      @Param("inicio") LocalDate inicio,
                                                      @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.usuario.id = :uid AND t.tipo = :tipo AND t.data BETWEEN :inicio AND :fim")
    BigDecimal somarPorTipoEPeriodo(@Param("uid") Long usuarioId, @Param("tipo") TipoTransacao tipo,
                                    @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.usuario.id = :uid AND t.tipo = 'DESPESA' AND t.categoria.id = :catId AND t.data BETWEEN :inicio AND :fim")
    BigDecimal somarDespesaPorCategoriaEPeriodo(@Param("uid") Long usuarioId, @Param("catId") Long categoriaId,
                                                @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}

