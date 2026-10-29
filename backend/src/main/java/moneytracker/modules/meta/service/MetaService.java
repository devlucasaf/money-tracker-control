package moneytracker.modules.meta.service;

import moneytracker.modules.conta.model.Conta;
import moneytracker.modules.conta.service.ContaService;
import moneytracker.modules.meta.model.Meta;
import moneytracker.modules.meta.model.TipoMovimentacaoMeta;
import moneytracker.modules.usuario.model.Usuario;
import moneytracker.modules.meta.dto.MetaDTO;
import moneytracker.modules.meta.repository.MetaRepository;
import moneytracker.modules.meta.repository.MovimentacaoMetaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MetaService {

    private final MetaRepository metaRepository;
    private final MovimentacaoMetaRepository movimentacaoMetaRepository;
    private final ContaService contaService;

    // --- LISTAR METAS DO USUÁRIO ---
    @Transactional(readOnly = true)
    public List<MetaDTO> listarPorUsuario(Long usuarioId) {
        return metaRepository.findByUsuarioId(usuarioId).stream().map(this::toDTO).toList();
    }

    // --- CRIAR NOVA META ---
    @Transactional
    public MetaDTO criar(MetaDTO metaDTO, Usuario usuario) {
        var meta = Meta.builder()
                .titulo(metaDTO.getTitulo())
                .descricao(metaDTO.getDescricao())
                .valorAlvo(metaDTO.getValorAlvo())
                .dataLimite(metaDTO.getDataLimite())
                .contaVinculada(resolverConta(metaDTO.getContaVinculadaId(), usuario.getId()))
                .usuario(usuario)
                .build();
        return toDTO(metaRepository.save(meta));
    }

    // --- ATUALIZAR META EXISTENTE ---
    @Transactional
    public MetaDTO atualizar(Long id, MetaDTO metaDTO, Long usuarioId) {
        var meta = buscarPorIdEUsuario(id, usuarioId);

        meta.setTitulo(metaDTO.getTitulo());
        meta.setDescricao(metaDTO.getDescricao());
        meta.setValorAlvo(metaDTO.getValorAlvo());
        meta.setValorAtual(metaDTO.getValorAtual() != null ? metaDTO.getValorAtual() : meta.getValorAtual());
        meta.setDataLimite(metaDTO.getDataLimite());
        meta.setContaVinculada(resolverConta(metaDTO.getContaVinculadaId(), usuarioId));

        if (meta.getValorAtual().compareTo(meta.getValorAlvo()) >= 0) {
            meta.setConcluida(true);
        }
        return toDTO(metaRepository.save(meta));
    }

    // --- DELETAR META ---
    @Transactional
    public void deletar(Long id, Long usuarioId) {
        var meta = buscarPorIdEUsuario(id, usuarioId);
        metaRepository.delete(meta);
    }

    // --- BUSCA META POR ID VALIDANDO O DONO ---
    public Meta buscarPorIdEUsuario(Long id, Long usuarioId) {
        return metaRepository.findById(id)
                .filter(m -> m.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Meta não encontrada"));
    }

    // --- RESOLVE A CONTA VINCULADA (OU NULL) ---
    private Conta resolverConta(Long contaId, Long usuarioId) {
        if (contaId == null) {
            return null;
        }
        return contaService.buscarPorIdEUsuario(contaId, usuarioId);
    }

    // --- CONVERSÃO DE ENTIDADE PARA DTO ---
    private MetaDTO toDTO(Meta meta) {
        var conta = meta.getContaVinculada();

        var dto = new MetaDTO(
                meta.getId(),
                meta.getTitulo(),
                meta.getDescricao(),
                meta.getValorAlvo(),
                meta.getValorAtual(),
                meta.getDataLimite(),
                meta.getConcluida(),
                conta != null ? conta.getId() : null,
                conta != null ? conta.getNome() : null,
                null,
                null
        );

        aplicarPrevisao(meta, dto);
        return dto;
    }

    // --- ESTIMA O RITMO DE APORTES E A DATA PREVISTA DE CONCLUSÃO ---
    private void aplicarPrevisao(Meta meta, MetaDTO metaDTO) {
        var valorAtual = meta.getValorAtual() != null ? meta.getValorAtual() : BigDecimal.ZERO;
        var restante = meta.getValorAlvo().subtract(valorAtual);

        if (Boolean.TRUE.equals(meta.getConcluida()) || restante.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        var movs = movimentacaoMetaRepository.findByMetaIdOrderByDataAscIdAsc(meta.getId());
        if (movs.isEmpty()) {
            return;
        }

        var aportadoLiquido = BigDecimal.ZERO;
        for (var mov : movs) {
            aportadoLiquido = mov.getTipo() == TipoMovimentacaoMeta.APORTE
                    ? aportadoLiquido.add(mov.getValor())
                    : aportadoLiquido.subtract(mov.getValor());
        }

        if (aportadoLiquido.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        var hoje = LocalDate.now();
        var dias = ChronoUnit.DAYS.between(movs.get(0).getData(), hoje);
        if (dias < 1) {
            dias = 1;
        }

        var ritmoDiario = aportadoLiquido.divide(BigDecimal.valueOf(dias), 6, RoundingMode.HALF_UP);
        metaDTO.setRitmoMensal(ritmoDiario.multiply(BigDecimal.valueOf(30)).setScale(2, RoundingMode.HALF_UP));

        var diasRestantes = restante.divide(ritmoDiario, 0, RoundingMode.CEILING).longValueExact();
        if (diasRestantes > 0 && diasRestantes < 36_500) {
            metaDTO.setDataPrevisao(hoje.plusDays(diasRestantes));
        }
    }
}

