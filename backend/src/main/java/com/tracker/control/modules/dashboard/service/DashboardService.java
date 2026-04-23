package com.tracker.control.modules.dashboard.service;

import com.tracker.control.modules.transacao.model.TipoTransacao;
import com.tracker.control.modules.conta.repository.ContaRepository;
import com.tracker.control.modules.dashboard.dto.DashboardDTO;
import com.tracker.control.modules.transacao.repository.TransacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransacaoRepository transacaoRepository;
    private final ContaRepository contaRepository;

    public DashboardDTO resumoMensal(Long usuarioId, Integer mes, Integer ano) {
        var inicio = LocalDate.of(ano, mes, 1);
        var fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        var receitas = transacaoRepository.somarPorTipoEPeriodo(usuarioId, TipoTransacao.RECEITA, inicio, fim);
        var despesas = transacaoRepository.somarPorTipoEPeriodo(usuarioId, TipoTransacao.DESPESA, inicio, fim);
        var saldo = receitas.subtract(despesas);

        var saldoContas = contaRepository.findByUsuarioIdAndAtivoTrue(usuarioId).stream()
                .map(c -> c.getSaldo())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardDTO(receitas, despesas, saldo, saldoContas);
    }
}

