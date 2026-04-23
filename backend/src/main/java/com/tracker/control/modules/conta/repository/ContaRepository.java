package com.tracker.control.modules.conta.repository;

import com.tracker.control.modules.conta.model.Conta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContaRepository extends JpaRepository<Conta, Long> {
    List<Conta> findByUsuarioIdAndAtivoTrue(Long usuarioId);
    List<Conta> findByUsuarioId(Long usuarioId);
}

