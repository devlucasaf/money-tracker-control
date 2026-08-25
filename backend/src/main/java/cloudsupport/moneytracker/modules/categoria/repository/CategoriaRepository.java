package cloudsupport.moneytracker.modules.categoria.repository;

import cloudsupport.moneytracker.modules.categoria.model.Categoria;
import cloudsupport.moneytracker.modules.transacao.model.TipoTransacao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByUsuarioId(Long usuarioId);
    List<Categoria> findByUsuarioIdAndTipo(Long usuarioId, TipoTransacao tipo);
}

