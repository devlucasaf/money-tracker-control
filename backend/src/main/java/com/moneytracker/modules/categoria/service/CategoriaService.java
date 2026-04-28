package com.moneytracker.modules.categoria.service;

import com.moneytracker.modules.usuario.model.Usuario;

import com.moneytracker.modules.categoria.model.Categoria;
import com.moneytracker.modules.categoria.dto.CategoriaDTO;
import com.moneytracker.modules.categoria.repository.CategoriaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<CategoriaDTO> listarPorUsuario(Long usuarioId) {
        return categoriaRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toDTO).toList();
    }

    public CategoriaDTO criar(CategoriaDTO dto, Usuario usuario) {
        var categoria = Categoria.builder()
                .nome(dto.getNome())
                .tipo(dto.getTipo())
                .icone(dto.getIcone())
                .cor(dto.getCor())
                .usuario(usuario)
                .build();
        return toDTO(categoriaRepository.save(categoria));
    }

    public CategoriaDTO atualizar(Long id, CategoriaDTO dto, Long usuarioId) {
        var categoria = buscarPorIdEUsuario(id, usuarioId);

        categoria.setNome(dto.getNome());
        categoria.setTipo(dto.getTipo());
        categoria.setIcone(dto.getIcone());
        categoria.setCor(dto.getCor());

        return toDTO(categoriaRepository.save(categoria));
    }

    public void deletar(Long id, Long usuarioId) {
        var categoria = buscarPorIdEUsuario(id, usuarioId);
        categoriaRepository.delete(categoria);
    }

    public Categoria buscarPorIdEUsuario(Long id, Long usuarioId) {
        return categoriaRepository.findById(id)
                .filter(c -> c.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada"));
    }

    private CategoriaDTO toDTO(Categoria categoria) {
        return new CategoriaDTO(
                categoria.getId(),
                categoria.getNome(),
                categoria.getTipo(),
                categoria.getIcone(),
                categoria.getCor()
        );
    }
}

