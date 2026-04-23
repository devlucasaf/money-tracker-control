package com.tracker.control.modules.transacao.service;

import com.tracker.control.modules.categoria.service.CategoriaService;
import com.tracker.control.modules.conta.model.Conta;
import com.tracker.control.modules.conta.service.ContaService;
import com.tracker.control.modules.transacao.dto.TransacaoDTO;
import com.tracker.control.modules.transacao.model.TipoTransacao;
import com.tracker.control.modules.transacao.model.Transacao;
import com.tracker.control.modules.transacao.repository.TransacaoRepository;
import com.tracker.control.modules.usuario.model.Usuario;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class TransacaoService {

    private final TransacaoRepository   transacaoRepository;
    private final CategoriaService      categoriaService;
    private final ContaService          contaService;

    public Page<TransacaoDTO> listarPorUsuario(Long usuarioId, Pageable pageable) {
        return transacaoRepository.findByUsuarioId(usuarioId, pageable).map(this::toDTO);
    }

    @Transactional
    public TransacaoDTO criar(TransacaoDTO dto, Usuario usuario) {
        var categoria = categoriaService.buscarPorIdEUsuario(dto.getCategoriaId(), usuario.getId());
        var conta = contaService.buscarPorIdEUsuario(dto.getContaId(), usuario.getId());

        atualizarSaldoConta(conta, dto.getTipo(), dto.getValor(), true);

        var transacao = Transacao.builder()
                .descricao(dto.getDescricao()).valor(dto.getValor()).tipo(dto.getTipo())
                .data(dto.getData()).observacao(dto.getObservacao())
                .usuario(usuario).categoria(categoria).conta(conta).build();

        return toDTO(transacaoRepository.save(transacao));
    }

    @Transactional
    public TransacaoDTO atualizar(Long id, TransacaoDTO dto, Long usuarioId) {
        var transacao = buscarPorIdEUsuario(id, usuarioId);

        // Reverter saldo antigo
        atualizarSaldoConta(transacao.getConta(), transacao.getTipo(), transacao.getValor(), false);

        var categoria = categoriaService.buscarPorIdEUsuario(dto.getCategoriaId(), usuarioId);
        var conta = contaService.buscarPorIdEUsuario(dto.getContaId(), usuarioId);

        // Aplicar novo saldo
        atualizarSaldoConta(conta, dto.getTipo(), dto.getValor(), true);

        transacao.setDescricao(dto.getDescricao());
        transacao.setValor(dto.getValor());
        transacao.setTipo(dto.getTipo());
        transacao.setData(dto.getData());
        transacao.setObservacao(dto.getObservacao());
        transacao.setCategoria(categoria);
        transacao.setConta(conta);

        return toDTO(transacaoRepository.save(transacao));
    }

    @Transactional
    public void deletar(Long id, Long usuarioId) {
        var transacao = buscarPorIdEUsuario(id, usuarioId);
        atualizarSaldoConta(transacao.getConta(), transacao.getTipo(), transacao.getValor(), false);
        transacaoRepository.delete(transacao);
    }

    private Transacao buscarPorIdEUsuario(Long id, Long usuarioId) {
        return transacaoRepository.findById(id)
                .filter(t -> t.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Transação não encontrada"));
    }

    private void atualizarSaldoConta(Conta conta, TipoTransacao tipo, BigDecimal valor, boolean adicionar) {
        if (adicionar) {
            if (tipo == TipoTransacao.RECEITA) {
                conta.setSaldo(conta.getSaldo().add(valor));
            } else {
                conta.setSaldo(conta.getSaldo().subtract(valor));
            }
        } else {
            if (tipo == TipoTransacao.RECEITA) {
                conta.setSaldo(conta.getSaldo().subtract(valor));
            } else {
                conta.setSaldo(conta.getSaldo().add(valor));
            }
        }
    }

    private TransacaoDTO toDTO(Transacao t) {
        return new TransacaoDTO(t.getId(), t.getDescricao(), t.getValor(), t.getTipo(), t.getData(),
                t.getObservacao(), t.getCategoria().getId(), t.getCategoria().getNome(),
                t.getConta().getId(), t.getConta().getNome());
    }
}
