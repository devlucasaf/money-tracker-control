package cloudsupport.moneytracker.modules.plano.service;

import cloudsupport.moneytracker.modules.plano.dto.PlanoGastosDTO;
import cloudsupport.moneytracker.modules.plano.model.PlanoGastos;
import cloudsupport.moneytracker.modules.plano.repository.PlanoGastosRepository;
import cloudsupport.moneytracker.modules.transacao.model.TipoTransacao;
import cloudsupport.moneytracker.modules.transacao.repository.TransacaoRepository;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PlanoGastosService {

    private final PlanoGastosRepository planoRepository;
    private final TransacaoRepository transacaoRepository;

    // --- OBTER O PLANO DO USUÁRIO ---
    @Transactional(readOnly = true)
    public PlanoGastosDTO obter(Long usuarioId) {
        var gastoMes = calcularGastoMes(usuarioId);
        var plano = planoRepository.findByUsuarioId(usuarioId).orElse(null);

        if (plano == null) {
            var dto = new PlanoGastosDTO();
            dto.setGastoAtualMes(gastoMes);
            return dto;
        }
        return toDTO(plano, gastoMes);
    }

    // --- CRIAR OU ATUALIZAR O PLANO DO USUÁRIO ---
    @Transactional
    public PlanoGastosDTO salvar(PlanoGastosDTO dto, Usuario usuario) {
        var plano = planoRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> PlanoGastos.builder().usuario(usuario).build());

        plano.setRendaMensal(dto.getRendaMensal());
        plano.setValorGastar(dto.getValorGastar());
        plano.setValorEmergencia(dto.getValorEmergencia());
        plano.setValorGuardar(dto.getValorGuardar());

        planoRepository.save(plano);
        return toDTO(plano, calcularGastoMes(usuario.getId()));
    }

    // --- SOMA AS DESPESAS DO MÊS ATUAL ---
    private java.math.BigDecimal calcularGastoMes(Long usuarioId) {
        var hoje = LocalDate.now();
        var inicio = hoje.withDayOfMonth(1);
        var fim = inicio.withDayOfMonth(inicio.lengthOfMonth());
        return transacaoRepository.somarPorTipoEPeriodo(usuarioId, TipoTransacao.DESPESA, inicio, fim);
    }

    // --- CONVERSÃO DE ENTIDADE PARA DTO ---
    private PlanoGastosDTO toDTO(PlanoGastos p, java.math.BigDecimal gastoMes) {
        return new PlanoGastosDTO(
                p.getId(),
                p.getRendaMensal(),
                p.getValorGastar(),
                p.getValorEmergencia(),
                p.getValorGuardar(),
                gastoMes
        );
    }
}

