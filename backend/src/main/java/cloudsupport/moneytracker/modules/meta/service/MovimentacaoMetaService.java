package cloudsupport.moneytracker.modules.meta.service;

import cloudsupport.moneytracker.modules.conta.model.Conta;
import cloudsupport.moneytracker.modules.conta.service.ContaService;
import cloudsupport.moneytracker.modules.meta.dto.MovimentacaoMetaDTO;
import cloudsupport.moneytracker.modules.meta.model.MovimentacaoMeta;
import cloudsupport.moneytracker.modules.meta.model.TipoMovimentacaoMeta;
import cloudsupport.moneytracker.modules.meta.repository.MetaRepository;
import cloudsupport.moneytracker.modules.meta.repository.MovimentacaoMetaRepository;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimentacaoMetaService {

    private final MovimentacaoMetaRepository movimentacaoRepository;
    private final MetaRepository metaRepository;
    private final MetaService metaService;
    private final ContaService contaService;

    // --- LISTAR MOVIMENTAÇÕES DE UMA META ---
    @Transactional(readOnly = true)
    public List<MovimentacaoMetaDTO> listar(Long metaId, Long usuarioId) {
        metaService.buscarPorIdEUsuario(metaId, usuarioId); // valida o dono
        var lista = movimentacaoRepository.findByMetaIdOrderByDataAscIdAsc(metaId);

        var resultado = new ArrayList<MovimentacaoMetaDTO>();
        var acumulado = BigDecimal.ZERO;
        for (var m : lista) {
            acumulado = m.getTipo() == TipoMovimentacaoMeta.APORTE
                    ? acumulado.add(m.getValor())
                    : acumulado.subtract(m.getValor());
            resultado.add(toDTO(m, acumulado));
        }
        return resultado;
    }

    // --- REGISTRAR UM APORTE OU RESGATE ---
    @Transactional
    public MovimentacaoMetaDTO registrar(Long metaId, MovimentacaoMetaDTO dto, Usuario usuario) {
        var meta = metaService.buscarPorIdEUsuario(metaId, usuario.getId());

        Conta conta = null;
        if (dto.getContaId() != null) {
            conta = contaService.buscarPorIdEUsuario(dto.getContaId(), usuario.getId());
        }

        var valor = dto.getValor();
        if (dto.getTipo() == TipoMovimentacaoMeta.APORTE) {
            meta.setValorAtual(meta.getValorAtual().add(valor));
            if (conta != null) {
                conta.setSaldo(conta.getSaldo().subtract(valor));
            }
        } else {
            meta.setValorAtual(meta.getValorAtual().subtract(valor));
            if (conta != null) {
                conta.setSaldo(conta.getSaldo().add(valor));
            }
        }

        meta.setConcluida(meta.getValorAtual().compareTo(meta.getValorAlvo()) >= 0);
        metaRepository.save(meta);

        var movimentacao = MovimentacaoMeta.builder()
                .meta(meta).tipo(dto.getTipo()).valor(valor).data(dto.getData())
                .conta(conta).usuario(usuario).build();

        return toDTO(movimentacaoRepository.save(movimentacao), null);
    }

    // --- DELETAR UMA MOVIMENTAÇÃO ---
    @Transactional
    public void deletar(Long metaId, Long movimentacaoId, Usuario usuario) {
        var meta = metaService.buscarPorIdEUsuario(metaId, usuario.getId());

        var mov = movimentacaoRepository.findById(movimentacaoId)
                .filter(m -> m.getMeta().getId().equals(metaId)
                        && m.getUsuario().getId().equals(usuario.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Movimentação não encontrada"));

        if (mov.getTipo() == TipoMovimentacaoMeta.APORTE) {
            meta.setValorAtual(meta.getValorAtual().subtract(mov.getValor()));
            if (mov.getConta() != null) {
                mov.getConta().setSaldo(mov.getConta().getSaldo().add(mov.getValor()));
            }
        } else {
            meta.setValorAtual(meta.getValorAtual().add(mov.getValor()));
            if (mov.getConta() != null) {
                mov.getConta().setSaldo(mov.getConta().getSaldo().subtract(mov.getValor()));
            }
        }

        meta.setConcluida(meta.getValorAtual().compareTo(meta.getValorAlvo()) >= 0);
        metaRepository.save(meta);
        movimentacaoRepository.delete(mov);
    }

    // --- CONVERSÃO DE ENTIDADE PARA DTO ---
    private MovimentacaoMetaDTO toDTO(MovimentacaoMeta m, BigDecimal acumulado) {
        var conta = m.getConta();
        return new MovimentacaoMetaDTO(
                m.getId(),
                m.getMeta().getId(),
                m.getTipo(),
                m.getValor(),
                m.getData(),
                conta != null ? conta.getId() : null,
                conta != null ? conta.getNome() : null,
                acumulado
        );
    }
}

