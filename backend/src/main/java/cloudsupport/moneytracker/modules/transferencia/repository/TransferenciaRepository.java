package cloudsupport.moneytracker.modules.transferencia.repository;

import cloudsupport.moneytracker.modules.transferencia.model.Transferencia;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransferenciaRepository extends JpaRepository<Transferencia, Long> {
    List<Transferencia> findByUsuarioIdOrderByDataDescIdDesc(Long usuarioId);
}

