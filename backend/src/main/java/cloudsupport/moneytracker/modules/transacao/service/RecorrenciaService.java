package cloudsupport.moneytracker.modules.transacao.service;

import cloudsupport.moneytracker.modules.conta.model.Conta;
import cloudsupport.moneytracker.modules.transacao.model.TipoTransacao;
import cloudsupport.moneytracker.modules.transacao.model.Transacao;
import cloudsupport.moneytracker.modules.transacao.repository.TransacaoRepository;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

// --- GERAÇÃO AUTOMÁTICA DE TRANSAÇÕES RECORRENTES ---
@Service
@RequiredArgsConstructor
public class RecorrenciaService {

    private static final Logger log = LoggerFactory.getLogger(RecorrenciaService.class);

    // --- LIMITE DE SEGURANÇA PARA EVITAR LOOPS EXCESSIVOS ---
    private static final int MAX_OCORRENCIAS = 60;

    private final TransacaoRepository transacaoRepository;

    // --- EXECUTA TODO DIA ---
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void gerarOcorrenciasPendentes() {
        var hoje = LocalDate.now();
        var modelos = transacaoRepository.findByRecorrenteTrueAndProximaDataLessThanEqual(hoje);

        if (modelos.isEmpty()) {
            return;
        }

        log.info("Gerando ocorrências recorrentes para {} modelo(s)", modelos.size());
        modelos.forEach(modelo -> gerarParaModelo(modelo, hoje));
    }

    // --- GERA TODAS AS OCORRÊNCIAS PENDENTES DE UM MODELO ---
    private void gerarParaModelo(Transacao modelo, LocalDate hoje) {
        var proxima = modelo.getProximaData();
        var frequencia = modelo.getFrequencia();

        if (proxima == null || frequencia == null) {
            return;
        }

        int contador = 0;
        while (!proxima.isAfter(hoje) && contador < MAX_OCORRENCIAS) {
            var ocorrencia = Transacao.builder()
                    .descricao(modelo.getDescricao())
                    .valor(modelo.getValor())
                    .tipo(modelo.getTipo())
                    .data(proxima)
                    .observacao(modelo.getObservacao())
                    .recorrente(false)
                    .usuario(modelo.getUsuario())
                    .categoria(modelo.getCategoria())
                    .conta(modelo.getConta())
                    .build();
            transacaoRepository.save(ocorrencia);

            aplicarSaldo(modelo.getConta(), modelo.getTipo(), modelo.getValor());

            proxima = frequencia.proximaData(proxima);
            contador++;
        }

        modelo.setProximaData(proxima);
        transacaoRepository.save(modelo);
    }

    // --- SOMA OU SUBTRAI O VALOR NO SALDO DA CONTA ---
    private void aplicarSaldo(Conta conta, TipoTransacao tipo, BigDecimal valor) {
        if (tipo == TipoTransacao.RECEITA) {
            conta.setSaldo(conta.getSaldo().add(valor));
        } else {
            conta.setSaldo(conta.getSaldo().subtract(valor));
        }
    }
}

