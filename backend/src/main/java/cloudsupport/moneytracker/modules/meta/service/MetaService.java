package cloudsupport.moneytracker.modules.meta.service;

import cloudsupport.moneytracker.modules.conta.model.Conta;
import cloudsupport.moneytracker.modules.conta.service.ContaService;
import cloudsupport.moneytracker.modules.meta.model.Meta;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import cloudsupport.moneytracker.modules.meta.dto.MetaDTO;
import cloudsupport.moneytracker.modules.meta.repository.MetaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MetaService {

    private final MetaRepository metaRepository;
    private final ContaService contaService;

    // --- LISTAR METAS DO USUÁRIO ---
    @Transactional(readOnly = true)
    public List<MetaDTO> listarPorUsuario(Long usuarioId) {
        return metaRepository.findByUsuarioId(usuarioId).stream().map(this::toDTO).toList();
    }

    // --- CRIAR NOVA META ---
    @Transactional
    public MetaDTO criar(MetaDTO dto, Usuario usuario) {
        var meta = Meta.builder()
                .titulo(dto.getTitulo()).descricao(dto.getDescricao())
                .valorAlvo(dto.getValorAlvo()).dataLimite(dto.getDataLimite())
                .contaVinculada(resolverConta(dto.getContaVinculadaId(), usuario.getId()))
                .usuario(usuario).build();
        return toDTO(metaRepository.save(meta));
    }

    // --- ATUALIZAR META EXISTENTE ---
    @Transactional
    public MetaDTO atualizar(Long id, MetaDTO dto, Long usuarioId) {
        var meta = buscarPorIdEUsuario(id, usuarioId);

        meta.setTitulo(dto.getTitulo());
        meta.setDescricao(dto.getDescricao());
        meta.setValorAlvo(dto.getValorAlvo());
        meta.setValorAtual(dto.getValorAtual() != null ? dto.getValorAtual() : meta.getValorAtual());
        meta.setDataLimite(dto.getDataLimite());
        meta.setContaVinculada(resolverConta(dto.getContaVinculadaId(), usuarioId));

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
    private MetaDTO toDTO(Meta m) {
        var conta = m.getContaVinculada();
        return new MetaDTO(
                m.getId(),
                m.getTitulo(),
                m.getDescricao(),
                m.getValorAlvo(),
                m.getValorAtual(),
                m.getDataLimite(),
                m.getConcluida(),
                conta != null ? conta.getId() : null,
                conta != null ? conta.getNome() : null
        );
    }
}

