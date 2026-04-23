package com.tracker.control.modules.orcamento.repository;

import com.tracker.control.modules.orcamento.model.Orcamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {
    List<Orcamento> findByUsuarioIdAndMesAndAno(Long usuarioId, Integer mes, Integer ano);
    List<Orcamento> findByUsuarioId(Long usuarioId);
}

