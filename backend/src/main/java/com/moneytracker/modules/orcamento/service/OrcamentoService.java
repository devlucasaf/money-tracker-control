package com.moneytracker.modules.orcamento.service;

import com.moneytracker.modules.orcamento.model.Orcamento;
import com.moneytracker.modules.usuario.model.Usuario;
import com.moneytracker.modules.categoria.service.CategoriaService;
import com.moneytracker.modules.orcamento.dto.OrcamentoDTO;
import com.moneytracker.modules.orcamento.repository.OrcamentoRepository;
import com.moneytracker.modules.transacao.repository.TransacaoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrcamentoService {

    private final OrcamentoRepository   orcamentoRepository;
    private final CategoriaService      categoriaService;
    private final TransacaoRepository   transacaoRepository;

    public List<OrcamentoDTO> listarPorMes(Long usuarioId, Integer mes, Integer ano) {
        return orcamentoRepository.findByUsuarioIdAndMesAndAno(usuarioId, mes, ano)
                .stream().map(o -> toDTO(o, usuarioId)).toList();
    }

    public OrcamentoDTO criar(OrcamentoDTO dto, Usuario usuario) {
        var categoria = categoriaService.buscarPorIdEUsuario(dto.getCategoriaId(), usuario.getId());
        var orcamento = Orcamento.builder()
                .valorLimite(dto.getValorLimite()).mes(dto.getMes()).ano(dto.getAno())
                .usuario(usuario).categoria(categoria).build();
        return toDTO(orcamentoRepository.save(orcamento), usuario.getId());
    }

    public OrcamentoDTO atualizar(Long id, OrcamentoDTO dto, Long usuarioId) {
        var orcamento = buscarPorIdEUsuario(id, usuarioId);
        orcamento.setValorLimite(dto.getValorLimite());
        return toDTO(orcamentoRepository.save(orcamento), usuarioId);
    }

    public void deletar(Long id, Long usuarioId) {
        var orcamento = buscarPorIdEUsuario(id, usuarioId);
        orcamentoRepository.delete(orcamento);
    }

    private Orcamento buscarPorIdEUsuario(Long id, Long usuarioId) {
        return orcamentoRepository.findById(id)
                .filter(o -> o.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Orçamento não encontrado"));
    }

    private OrcamentoDTO toDTO(Orcamento o, Long usuarioId) {
        var inicio = LocalDate.of(o.getAno(), o.getMes(), 1);
        var fim = inicio.withDayOfMonth(inicio.lengthOfMonth());
        var gasto = transacaoRepository.somarDespesaPorCategoriaEPeriodo(usuarioId, o.getCategoria().getId(), inicio, fim);

        return new OrcamentoDTO(
                o.getId(),
                o.getValorLimite(),
                o.getMes(),
                o.getAno(),
                o.getCategoria().getId(),
                o.getCategoria().getNome(),
                gasto
        );
    }
}

