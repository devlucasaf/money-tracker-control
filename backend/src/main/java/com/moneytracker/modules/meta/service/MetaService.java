package com.moneytracker.modules.meta.service;

import com.moneytracker.modules.meta.model.Meta;
import com.moneytracker.modules.usuario.model.Usuario;
import com.moneytracker.modules.meta.dto.MetaDTO;
import com.moneytracker.modules.meta.repository.MetaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MetaService {

    private final MetaRepository metaRepository;

    public List<MetaDTO> listarPorUsuario(Long usuarioId) {
        return metaRepository.findByUsuarioId(usuarioId).stream().map(this::toDTO).toList();
    }

    public MetaDTO criar(MetaDTO dto, Usuario usuario) {
        var meta = Meta.builder()
                .titulo(dto.getTitulo()).descricao(dto.getDescricao())
                .valorAlvo(dto.getValorAlvo()).dataLimite(dto.getDataLimite())
                .usuario(usuario).build();
        return toDTO(metaRepository.save(meta));
    }

    public MetaDTO atualizar(Long id, MetaDTO dto, Long usuarioId) {
        var meta = buscarPorIdEUsuario(id, usuarioId);

        meta.setTitulo(dto.getTitulo());
        meta.setDescricao(dto.getDescricao());
        meta.setValorAlvo(dto.getValorAlvo());
        meta.setValorAtual(dto.getValorAtual() != null ? dto.getValorAtual() : meta.getValorAtual());
        meta.setDataLimite(dto.getDataLimite());

        if (meta.getValorAtual().compareTo(meta.getValorAlvo()) >= 0) {
            meta.setConcluida(true);
        }
        return toDTO(metaRepository.save(meta));
    }

    public void deletar(Long id, Long usuarioId) {
        var meta = buscarPorIdEUsuario(id, usuarioId);
        metaRepository.delete(meta);
    }

    private Meta buscarPorIdEUsuario(Long id, Long usuarioId) {
        return metaRepository.findById(id)
                .filter(m -> m.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Meta não encontrada"));
    }

    private MetaDTO toDTO(Meta m) {
        return new MetaDTO(
                m.getId(),
                m.getTitulo(),
                m.getDescricao(),
                m.getValorAlvo(),
                m.getValorAtual(),
                m.getDataLimite(),
                m.getConcluida()
        );
    }
}

