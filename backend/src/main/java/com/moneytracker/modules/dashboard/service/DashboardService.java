package com.moneytracker.modules.dashboard.service;

import com.moneytracker.modules.transacao.model.TipoTransacao;
import com.moneytracker.modules.conta.repository.ContaRepository;
import com.moneytracker.modules.dashboard.dto.DashboardDTO;
import com.moneytracker.modules.transacao.repository.TransacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransacaoRepository   transacaoRepository;
    private final ContaRepository       contaRepository;

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

