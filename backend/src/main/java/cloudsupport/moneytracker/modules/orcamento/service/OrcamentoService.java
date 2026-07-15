package cloudsupport.moneytracker.modules.orcamento.service;

import cloudsupport.moneytracker.modules.orcamento.model.Orcamento;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import cloudsupport.moneytracker.modules.categoria.service.CategoriaService;
import cloudsupport.moneytracker.modules.orcamento.dto.OrcamentoDTO;
import cloudsupport.moneytracker.modules.orcamento.repository.OrcamentoRepository;
import cloudsupport.moneytracker.modules.transacao.repository.TransacaoRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrcamentoService {

    private final OrcamentoRepository   orcamentoRepository;
    private final CategoriaService      categoriaService;
    private final TransacaoRepository   transacaoRepository;

    // --- LISTAR ORÇAMENTOS DO USUÁRIO POR MÊS/ANO ---
    @Transactional(readOnly = true)
    public List<OrcamentoDTO> listarPorMes(Long usuarioId, Integer mes, Integer ano) {
        return orcamentoRepository.findByUsuarioIdAndMesAndAno(usuarioId, mes, ano)
                .stream().map(o -> toDTO(o, usuarioId)).toList();
    }

    // --- LISTAR TODOS OS ORÇAMENTOS DO USUÁRIO ---
    @Transactional(readOnly = true)
    public List<OrcamentoDTO> listarPorUsuario(Long usuarioId) {
        return orcamentoRepository.findByUsuarioId(usuarioId)
                .stream().map(o -> toDTO(o, usuarioId)).toList();
    }

    // --- CRIAR NOVO ORÇAMENTO ---
    public OrcamentoDTO criar(OrcamentoDTO dto, Usuario usuario) {
        var categoria = categoriaService.buscarPorIdEUsuario(dto.getCategoriaId(), usuario.getId());
        var orcamento = Orcamento.builder()
                .valorLimite(dto.getValorLimite()).mes(dto.getMes()).ano(dto.getAno())
                .usuario(usuario).categoria(categoria).build();
        return toDTO(orcamentoRepository.save(orcamento), usuario.getId());
    }

    // --- ATUALIZAR ORÇAMENTO EXISTENTE ---
    public OrcamentoDTO atualizar(Long id, OrcamentoDTO dto, Long usuarioId) {
        var orcamento = buscarPorIdEUsuario(id, usuarioId);
        orcamento.setValorLimite(dto.getValorLimite());
        return toDTO(orcamentoRepository.save(orcamento), usuarioId);
    }

    // --- DELETAR ORÇAMENTO ---
    public void deletar(Long id, Long usuarioId) {
        var orcamento = buscarPorIdEUsuario(id, usuarioId);
        orcamentoRepository.delete(orcamento);
    }

    // --- BUSCA ORÇAMENTO POR ID VALIDANDO O DONO ---
    private Orcamento buscarPorIdEUsuario(Long id, Long usuarioId) {
        return orcamentoRepository.findById(id)
                .filter(o -> o.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Orçamento não encontrado"));
    }

    // --- CONVERSÃO DE ENTIDADE PARA DTO ---
    private OrcamentoDTO toDTO(Orcamento o, Long usuarioId) {
        var inicio = LocalDate.of(o.getAno(), o.getMes(), 1);
        var fim = inicio.withDayOfMonth(inicio.lengthOfMonth());
        var gasto = transacaoRepository.somarDespesaPorCategoriaEPeriodo(usuarioId, o.getCategoria().getId(), inicio, fim);

        // --- MONTA E RETORNA O DTO ---
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

