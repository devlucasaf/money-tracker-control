package cloudsupport.moneytracker.modules.categoria.service;

import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import cloudsupport.moneytracker.modules.categoria.model.Categoria;
import cloudsupport.moneytracker.modules.categoria.dto.CategoriaDTO;
import cloudsupport.moneytracker.modules.categoria.repository.CategoriaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    // --- LISTAR CATEGORIAS DO USUÁRIO ---
    public List<CategoriaDTO> listarPorUsuario(Long usuarioId) {
        return categoriaRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toDTO).toList();
    }

    // --- CRIAR NOVA CATEGORIA ---
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

    // --- ATUALIZAR CATEGORIA EXISTENTE ---
    public CategoriaDTO atualizar(Long id, CategoriaDTO dto, Long usuarioId) {
        var categoria = buscarPorIdEUsuario(id, usuarioId);

        categoria.setNome(dto.getNome());
        categoria.setTipo(dto.getTipo());
        categoria.setIcone(dto.getIcone());
        categoria.setCor(dto.getCor());

        return toDTO(categoriaRepository.save(categoria));
    }

    // --- DELETAR CATEGORIA ---
    public void deletar(Long id, Long usuarioId) {
        var categoria = buscarPorIdEUsuario(id, usuarioId);
        categoriaRepository.delete(categoria);
    }

    // --- BUSCA CATEGORIA POR ID VALIDANDO O DONO ---
    public Categoria buscarPorIdEUsuario(Long id, Long usuarioId) {
        return categoriaRepository.findById(id)
                .filter(c -> c.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada"));
    }

    // --- CONVERSÃO DE ENTIDADE PARA DTO ---
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

