package com.tracker.control.modules.categoria.repository;

import com.tracker.control.modules.categoria.model.Categoria;
import com.tracker.control.modules.transacao.model.TipoTransacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByUsuarioId(Long usuarioId);
    List<Categoria> findByUsuarioIdAndTipo(Long usuarioId, TipoTransacao tipo);
}

