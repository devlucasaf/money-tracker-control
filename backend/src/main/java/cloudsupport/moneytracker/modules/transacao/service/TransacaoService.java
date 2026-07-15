package cloudsupport.moneytracker.modules.transacao.service;

import cloudsupport.moneytracker.modules.categoria.model.Categoria;
import cloudsupport.moneytracker.modules.categoria.service.CategoriaService;
import cloudsupport.moneytracker.modules.conta.model.Conta;
import cloudsupport.moneytracker.modules.conta.service.ContaService;
import cloudsupport.moneytracker.modules.transacao.dto.TransacaoDTO;
import cloudsupport.moneytracker.modules.transacao.model.TipoTransacao;
import cloudsupport.moneytracker.modules.transacao.model.Transacao;
import cloudsupport.moneytracker.modules.transacao.repository.TransacaoRepository;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TransacaoService {

    private final TransacaoRepository transacaoRepository;
    private final CategoriaService categoriaService;
    private final ContaService contaService;

    // --- LISTAR TRANSAÇÕES DO USUÁRIO ---
    @Transactional(readOnly = true)
    public Page<TransacaoDTO> listarPorUsuario(Long usuarioId, Pageable pageable) {
        return transacaoRepository.findByUsuarioId(usuarioId, pageable).map(this::toDTO);
    }

    // --- LISTAR TRANSAÇÕES COM FILTROS OPCIONAIS ---
    @Transactional(readOnly = true)
    public Page<TransacaoDTO> listarComFiltros(Long usuarioId, String busca, Long categoriaId, Long contaId,
                                               TipoTransacao tipo, LocalDate inicio, LocalDate fim,
                                               String tag, Pageable pageable) {
        var buscaFinal = (busca != null && !busca.isBlank()) ? busca.trim() : null;
        var tagFinal = (tag != null && !tag.isBlank()) ? tag.trim() : null;
        return transacaoRepository
                .filtrar(
                        usuarioId,
                        buscaFinal,
                        categoriaId,
                        contaId,
                        tipo,
                        inicio,
                        fim,
                        tagFinal,
                        pageable
                ).map(this::toDTO);
    }

    // --- CRIAR NOVA TRANSAÇÃO ---
    @Transactional
    public TransacaoDTO criar(TransacaoDTO dto, Usuario usuario) {
        var categoria = categoriaService.buscarPorIdEUsuario(dto.getCategoriaId(), usuario.getId());
        var conta = contaService.buscarPorIdEUsuario(dto.getContaId(), usuario.getId());

        var tags = dto.getTags() != null ? new HashSet<>(dto.getTags()) : new HashSet<String>();
        var parcelas = dto.getParcelas() != null ? dto.getParcelas() : 1;

        if (parcelas > 1) {
            return criarParceladas(dto, usuario, categoria, conta, tags, parcelas);
        }

        atualizarSaldoConta(conta, dto.getTipo(), dto.getValor(), true);

        var recorrente = Boolean.TRUE.equals(dto.getRecorrente()) && dto.getFrequencia() != null;
        var proximaData = recorrente ? dto.getFrequencia().proximaData(dto.getData()) : null;

        var transacao = Transacao.builder()
                .descricao(dto.getDescricao()).valor(dto.getValor()).tipo(dto.getTipo())
                .data(dto.getData()).observacao(dto.getObservacao())
                .tags(tags)
                .recorrente(recorrente)
                .frequencia(recorrente ? dto.getFrequencia() : null)
                .proximaData(proximaData)
                .usuario(usuario).categoria(categoria).conta(conta).build();

        return toDTO(transacaoRepository.save(transacao));
    }

    // --- CRIA UMA TRANSAÇÃO EM VÁRIAS PARCELAS MENSAIS ---
    private TransacaoDTO criarParceladas(TransacaoDTO dto, Usuario usuario, Categoria categoria,
                                         Conta conta, Set<String> tags, int parcelas) {
        var total = dto.getValor();
        var base = total.divide(BigDecimal.valueOf(parcelas), 2, RoundingMode.HALF_UP);
        TransacaoDTO primeira = null;

        for (int i = 1; i <= parcelas; i++) {
            var valorParcela = (i < parcelas)
                    ? base
                    : total.subtract(base.multiply(BigDecimal.valueOf(parcelas - 1L)));
            var dataParcela = dto.getData().plusMonths(i - 1L);

            atualizarSaldoConta(conta, dto.getTipo(), valorParcela, true);

            var transacao = Transacao.builder()
                    .descricao(dto.getDescricao() + " (" + i + "/" + parcelas + ")")
                    .valor(valorParcela).tipo(dto.getTipo())
                    .data(dataParcela).observacao(dto.getObservacao())
                    .tags(new HashSet<>(tags))
                    .recorrente(false)
                    .usuario(usuario).categoria(categoria).conta(conta).build();

            var salva = transacaoRepository.save(transacao);
            if (primeira == null) {
                primeira = toDTO(salva);
            }
        }
        return primeira;
    }

    // --- ATUALIZAR TRANSAÇÃO EXISTENTE ---
    @Transactional
    public TransacaoDTO atualizar(Long id, TransacaoDTO dto, Long usuarioId) {
        var transacao = buscarPorIdEUsuario(id, usuarioId);

        atualizarSaldoConta(transacao.getConta(), transacao.getTipo(), transacao.getValor(), false);

        var categoria = categoriaService.buscarPorIdEUsuario(dto.getCategoriaId(), usuarioId);
        var conta = contaService.buscarPorIdEUsuario(dto.getContaId(), usuarioId);

        atualizarSaldoConta(conta, dto.getTipo(), dto.getValor(), true);

        transacao.setDescricao(dto.getDescricao());
        transacao.setValor(dto.getValor());
        transacao.setTipo(dto.getTipo());
        transacao.setData(dto.getData());
        transacao.setObservacao(dto.getObservacao());
        transacao.setCategoria(categoria);
        transacao.setConta(conta);

        transacao.getTags().clear();
        if (dto.getTags() != null) {
            transacao.getTags().addAll(dto.getTags());
        }

        return toDTO(transacaoRepository.save(transacao));
    }

    // --- DELETAR TRANSAÇÃO ---
    @Transactional
    public void deletar(Long id, Long usuarioId) {
        var transacao = buscarPorIdEUsuario(id, usuarioId);
        atualizarSaldoConta(transacao.getConta(), transacao.getTipo(), transacao.getValor(), false);
        transacaoRepository.delete(transacao);
    }

    // --- BUSCA TRANSAÇÃO POR ID VALIDANDO O DONO ---
    private Transacao buscarPorIdEUsuario(Long id, Long usuarioId) {
        return transacaoRepository.findById(id)
                .filter(t -> t.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Transação não encontrada"));
    }

    // --- ATUALIZA O SALDO DA CONTA CONFORME O TIPO E A OPERAÇÃO ---
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

    // --- CONVERSÃO DE ENTIDADE PARA DTO ---
    private TransacaoDTO toDTO(Transacao t) {
        return new TransacaoDTO(
                t.getId(),
                t.getDescricao(),
                t.getValor(),
                t.getTipo(),
                t.getData(),
                t.getObservacao(),
                t.getCategoria().getId(),
                t.getCategoria().getNome(),
                t.getConta().getId(),
                t.getConta().getNome(),
                t.getRecorrente(),
                t.getFrequencia(),
                t.getProximaData(),
                t.getTags() != null ? new HashSet<>(t.getTags()) : new HashSet<>(),
                null
        );
    }
}
