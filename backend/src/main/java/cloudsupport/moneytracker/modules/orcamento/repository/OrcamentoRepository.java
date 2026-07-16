package cloudsupport.moneytracker.modules.orcamento.repository;

import cloudsupport.moneytracker.modules.orcamento.model.Orcamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {
    List<Orcamento> findByUsuarioIdAndMesAndAno(Long usuarioId, Integer mes, Integer ano);
    List<Orcamento> findByUsuarioId(Long usuarioId);

    Optional<Orcamento> findByUsuarioIdAndCategoriaIdAndMesAndAno(Long usuarioId, Long categoriaId, Integer mes, Integer ano);
}

