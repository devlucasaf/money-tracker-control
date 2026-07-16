package cloudsupport.moneytracker.modules.contapagar.repository;

import cloudsupport.moneytracker.modules.contapagar.model.ContaPagar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ContaPagarRepository extends JpaRepository<ContaPagar, Long> {
    // --- PENDENTES PRIMEIRO, ORDENADAS POR VENCIMENTO ---
    List<ContaPagar> findByUsuarioIdOrderByPagoAscDataVencimentoAsc(Long usuarioId);

    // --- PENDENTES COM VENCIMENTO ATÉ UMA DATA ---
    List<ContaPagar> findByUsuarioIdAndPagoFalseAndDataVencimentoLessThanEqual(Long usuarioId, LocalDate ate);
}

