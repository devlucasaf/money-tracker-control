package com.moneytracker.modules.investimento.service;

import com.moneytracker.modules.investimento.dto.InvestimentoDTO;
import com.moneytracker.modules.investimento.model.Investimento;
import com.moneytracker.modules.investimento.model.ResultadoAposta;
import com.moneytracker.modules.investimento.model.StatusInvestimento;
import com.moneytracker.modules.investimento.model.TipoInvestimento;
import com.moneytracker.modules.investimento.repository.InvestimentoRepository;
import com.moneytracker.modules.usuario.model.Usuario;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvestimentoService {

    private final InvestimentoRepository investimentoRepository;

    public List<InvestimentoDTO> listarPorUsuario(Long usuarioId) {
        return investimentoRepository.findByUsuarioId(usuarioId).stream().map(this::toDTO).toList();
    }

    public InvestimentoDTO criar(InvestimentoDTO dto, Usuario usuario) {
        var investimento = Investimento.builder()
                .nome(dto.getNome())
                .tipo(dto.getTipo())
                .valorAplicado(dto.getValorAplicado())
                .valorAtual(dto.getValorAtual() != null ? dto.getValorAtual() : dto.getValorAplicado())
                .instituicao(dto.getInstituicao())
                .taxa(dto.getTaxa())
                .dataAplicacao(dto.getDataAplicacao())
                .dataVencimento(dto.getDataVencimento())
                .status(dto.getStatus() != null ? dto.getStatus() : StatusInvestimento.ATIVO)
                .resultadoAposta(dto.getResultadoAposta())
                .observacao(dto.getObservacao())
                .usuario(usuario)
                .build();

        aplicarRegrasAposta(investimento);

        return toDTO(investimentoRepository.save(investimento));
    }

    public InvestimentoDTO atualizar(Long id, InvestimentoDTO dto, Long usuarioId) {
        var investimento = buscarPorIdEUsuario(id, usuarioId);

        investimento.setNome(dto.getNome());
        investimento.setTipo(dto.getTipo());
        investimento.setValorAplicado(dto.getValorAplicado());
        investimento.setValorAtual(dto.getValorAtual() != null ? dto.getValorAtual() : investimento.getValorAtual());
        investimento.setInstituicao(dto.getInstituicao());
        investimento.setTaxa(dto.getTaxa());
        investimento.setDataAplicacao(dto.getDataAplicacao());
        investimento.setDataVencimento(dto.getDataVencimento());
        investimento.setStatus(dto.getStatus() != null ? dto.getStatus() : investimento.getStatus());
        investimento.setResultadoAposta(dto.getResultadoAposta());
        investimento.setObservacao(dto.getObservacao());

        aplicarRegrasAposta(investimento);

        return toDTO(investimentoRepository.save(investimento));
    }

    public void deletar(Long id, Long usuarioId) {
        var investimento = buscarPorIdEUsuario(id, usuarioId);
        investimentoRepository.delete(investimento);
    }

    private Investimento buscarPorIdEUsuario(Long id, Long usuarioId) {
        return investimentoRepository.findById(id)
                .filter(i -> i.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Investimento não encontrado"));
    }

    // --- REGRA ESPECIAL PARA APOSTAS (BET) ---
    private void aplicarRegrasAposta(Investimento investimento) {
        if (investimento.getTipo() != TipoInvestimento.BET) {
            return;
        }

        var resultado = investimento.getResultadoAposta() != null
                ? investimento.getResultadoAposta()
                : ResultadoAposta.PENDENTE;
        investimento.setResultadoAposta(resultado);

        if (resultado == ResultadoAposta.PERDEU) {
            // Aposta perdida: o dinheiro aplicado foi perdido.
            investimento.setStatus(StatusInvestimento.PERDIDO);
            investimento.setValorAtual(BigDecimal.ZERO);
        } else if (resultado == ResultadoAposta.GANHOU) {
            investimento.setStatus(StatusInvestimento.ATIVO);
        } else {
            investimento.setStatus(StatusInvestimento.ATIVO);
        }
    }

    private InvestimentoDTO toDTO(Investimento i) {
        var aplicado = i.getValorAplicado() != null ? i.getValorAplicado() : BigDecimal.ZERO;
        var atual = i.getValorAtual() != null ? i.getValorAtual() : aplicado;

        var rendimento = atual.subtract(aplicado);

        var percentual = BigDecimal.ZERO;
        if (aplicado.compareTo(BigDecimal.ZERO) > 0) {
            percentual = rendimento
                    .divide(aplicado, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return new InvestimentoDTO(
                i.getId(),
                i.getNome(),
                i.getTipo(),
                aplicado,
                atual,
                i.getInstituicao(),
                i.getTaxa(),
                i.getDataAplicacao(),
                i.getDataVencimento(),
                i.getStatus(),
                i.getResultadoAposta(),
                i.getObservacao(),
                rendimento,
                percentual
        );
    }
}

