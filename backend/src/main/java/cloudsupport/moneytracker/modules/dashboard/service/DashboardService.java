package cloudsupport.moneytracker.modules.dashboard.service;

import cloudsupport.moneytracker.modules.transacao.model.TipoTransacao;
import cloudsupport.moneytracker.modules.conta.repository.ContaRepository;
import cloudsupport.moneytracker.modules.contapagar.model.TipoContaPagar;
import cloudsupport.moneytracker.modules.contapagar.repository.ContaPagarRepository;
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
    private final ContaPagarRepository contaPagarRepository;

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

        var mesAnterior = inicio.minusMonths(1);
        var inicioAnt = mesAnterior.withDayOfMonth(1);
        var fimAnt = mesAnterior.withDayOfMonth(mesAnterior.lengthOfMonth());
        var receitasAnt = transacaoRepository.somarPorTipoEPeriodo(usuarioId, TipoTransacao.RECEITA, inicioAnt, fimAnt);
        var despesasAnt = transacaoRepository.somarPorTipoEPeriodo(usuarioId, TipoTransacao.DESPESA, inicioAnt, fimAnt);

        var saldoContas = contaRepository.findByUsuarioIdAndAtivoTrue(usuarioId).stream()
                .map(c -> c.getSaldo())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // --- SALDO PROJETADO PARA O FIM DO MÊS ---
        var saldoProjetado = calcularSaldoProjetado(usuarioId, saldoContas, fim);

        var despesasPorCategoria = transacaoRepository.somarDespesasPorCategoria(usuarioId, inicio, fim);

        var evolucao = montarEvolucao(usuarioId, mes, ano);

        return new DashboardDTO(receitas, despesas, saldo, saldoContas, saldoProjetado,
                receitasAnt, despesasAnt, despesasPorCategoria, evolucao);
    }

    // --- SALDO ATUAL +/- PENDÊNCIAS E RECORRENTES ATÉ O FIM DO MÊS ---
    private BigDecimal calcularSaldoProjetado(Long usuarioId, BigDecimal saldoContas, LocalDate fim) {
        var hoje = LocalDate.now();

        if (fim.isBefore(hoje)) {
            return saldoContas;
        }

        var ajuste = BigDecimal.ZERO;

        var pendentes = contaPagarRepository
                .findByUsuarioIdAndPagoFalseAndDataVencimentoLessThanEqual(usuarioId, fim);
        for (var p : pendentes) {
            ajuste = p.getTipo() == TipoContaPagar.PAGAR
                    ? ajuste.subtract(p.getValor())
                    : ajuste.add(p.getValor());
        }

        var recorrentes = transacaoRepository
                .findByUsuarioIdAndRecorrenteTrueAndProximaDataBetween(usuarioId, hoje, fim);
        for (var t : recorrentes) {
            ajuste = t.getTipo() == TipoTransacao.RECEITA
                    ? ajuste.add(t.getValor())
                    : ajuste.subtract(t.getValor());
        }

        return saldoContas.add(ajuste);
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

