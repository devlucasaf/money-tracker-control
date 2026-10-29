package moneytracker.modules.plano.repository;

import moneytracker.modules.plano.model.PlanoGastos;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlanoGastosRepository extends JpaRepository<PlanoGastos, Long> {
    Optional<PlanoGastos> findByUsuarioId(Long usuarioId);
}

