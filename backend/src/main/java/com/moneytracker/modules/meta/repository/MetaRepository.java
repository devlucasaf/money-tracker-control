package com.moneytracker.modules.meta.repository;

import com.moneytracker.modules.meta.model.Meta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MetaRepository extends JpaRepository<Meta, Long> {
    List<Meta> findByUsuarioId(Long usuarioId);
    List<Meta> findByUsuarioIdAndConcluidaFalse(Long usuarioId);
}

