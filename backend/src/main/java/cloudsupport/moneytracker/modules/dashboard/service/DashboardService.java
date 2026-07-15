package cloudsupport.moneytracker.modules.dashboard.service;

import cloudsupport.moneytracker.modules.transacao.model.TipoTransacao;
import cloudsupport.moneytracker.modules.conta.repository.ContaRepository;
import cloudsupport.moneytracker.modules.dashboard.dto.DashboardDTO;
import cloudsupport.moneytracker.modules.dashboard.dto.EvolucaoMensalDTO;
import cloudsupport.moneytracker.modules.transacao.repository.TransacaoRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransacaoRepository transacaoRepository;
    private final ContaRepository contaRepository;

    // --- QUANTIDADE DE MESES EXIBIDOS NO GRÁFICO DE BARRAS ---
    private static final int MESES_EVOLUCAO = 6;

    // --- RESUMO COMPLETO DO MÊS ---
    @Transactional(readOnly = true)
    public DashboardDTO resumoMensal(Long usuarioId, Integer mes, Integer ano) {
        var inicio = LocalDate.of(ano, mes, 1);
        var fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        var receitas = transacaoRepository.somarPorTipoEPeriodo(usuarioId, TipoTransacao.RECEITA, inicio, fim);
        var despesas = transacaoRepository.somarPorTipoEPeriodo(usuarioId, TipoTransacao.DESPESA, inicio, fim);
        var saldo = receitas.subtract(despesas);

        var saldoContas = contaRepository.findByUsuarioIdAndAtivoTrue(usuarioId).stream()
                .map(c -> c.getSaldo())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        var despesasPorCategoria = transacaoRepository.somarDespesasPorCategoria(usuarioId, inicio, fim);

        var evolucao = montarEvolucao(usuarioId, mes, ano);

        return new DashboardDTO(receitas, despesas, saldo, saldoContas, despesasPorCategoria, evolucao);
    }

    // --- MONTA RECEITAS E DESPESAS DOS ÚLTIMOS MESES ---
    private List<EvolucaoMensalDTO> montarEvolucao(Long usuarioId, Integer mes, Integer ano) {
        List<EvolucaoMensalDTO> evolucao = new ArrayList<>();
        var referencia = LocalDate.of(ano, mes, 1);

        for (int i = MESES_EVOLUCAO - 1; i >= 0; i--) {
            var mesRef = referencia.minusMonths(i);
            var inicio = mesRef.withDayOfMonth(1);
            var fim = mesRef.withDayOfMonth(mesRef.lengthOfMonth());

            var receitas = transacaoRepository.somarPorTipoEPeriodo(usuarioId, TipoTransacao.RECEITA, inicio, fim);
            var despesas = transacaoRepository.somarPorTipoEPeriodo(usuarioId, TipoTransacao.DESPESA, inicio, fim);

            evolucao.add(new EvolucaoMensalDTO(mesRef.getMonthValue(), mesRef.getYear(), receitas, despesas));
        }

        return evolucao;
    }
}

