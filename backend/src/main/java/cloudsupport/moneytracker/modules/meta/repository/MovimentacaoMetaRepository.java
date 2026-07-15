package cloudsupport.moneytracker.modules.meta.repository;

import cloudsupport.moneytracker.modules.meta.model.MovimentacaoMeta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimentacaoMetaRepository extends JpaRepository<MovimentacaoMeta, Long> {
    // --- ORDENADO CRONOLOGICAMENTE ---
    List<MovimentacaoMeta> findByMetaIdOrderByDataAscIdAsc(Long metaId);
}

