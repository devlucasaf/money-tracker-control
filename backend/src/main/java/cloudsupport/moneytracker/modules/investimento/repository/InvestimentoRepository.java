package cloudsupport.moneytracker.modules.investimento.repository;

import cloudsupport.moneytracker.modules.investimento.model.Investimento;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvestimentoRepository extends JpaRepository<Investimento, Long> {
    List<Investimento> findByUsuarioId(Long usuarioId);
}

