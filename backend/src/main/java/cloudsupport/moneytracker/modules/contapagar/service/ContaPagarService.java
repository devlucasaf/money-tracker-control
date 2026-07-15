package cloudsupport.moneytracker.modules.contapagar.service;

import cloudsupport.moneytracker.modules.conta.model.Conta;
import cloudsupport.moneytracker.modules.conta.service.ContaService;
import cloudsupport.moneytracker.modules.contapagar.dto.ContaPagarDTO;
import cloudsupport.moneytracker.modules.contapagar.model.ContaPagar;
import cloudsupport.moneytracker.modules.contapagar.model.TipoContaPagar;
import cloudsupport.moneytracker.modules.contapagar.repository.ContaPagarRepository;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContaPagarService {

    private final ContaPagarRepository contaPagarRepository;
    private final ContaService contaService;

    // --- LISTAR COMPROMISSOS DO USUÁRIO ---
    @Transactional(readOnly = true)
    public List<ContaPagarDTO> listarPorUsuario(Long usuarioId) {
        return contaPagarRepository.findByUsuarioIdOrderByPagoAscDataVencimentoAsc(usuarioId)
                .stream().map(this::toDTO).toList();
    }

    // --- CRIAR NOVO COMPROMISSO ---
    @Transactional
    public ContaPagarDTO criar(ContaPagarDTO dto, Usuario usuario) {
        var conta = resolverConta(dto.getContaId(), usuario.getId());

        var item = ContaPagar.builder()
                .descricao(dto.getDescricao())
                .valor(dto.getValor())
                .tipo(dto.getTipo())
                .dataVencimento(dto.getDataVencimento())
                .pago(false)
                .conta(conta)
                .usuario(usuario)
                .build();

        return toDTO(contaPagarRepository.save(item));
    }

    // --- ATUALIZAR ---
    @Transactional
    public ContaPagarDTO atualizar(Long id, ContaPagarDTO dto, Long usuarioId) {
        var item = buscar(id, usuarioId);

        if (Boolean.TRUE.equals(item.getPago())) {
            throw new IllegalArgumentException("Desmarque como pago antes de editar este compromisso");
        }

        item.setDescricao(dto.getDescricao());
        item.setValor(dto.getValor());
        item.setTipo(dto.getTipo());
        item.setDataVencimento(dto.getDataVencimento());
        item.setConta(resolverConta(dto.getContaId(), usuarioId));

        return toDTO(contaPagarRepository.save(item));
    }

    // --- MARCAR COMO PAGO/RECEBIDO ---
    @Transactional
    public ContaPagarDTO marcarComoPago(Long id, Long usuarioId) {
        var item = buscar(id, usuarioId);
        if (Boolean.TRUE.equals(item.getPago())) {
            return toDTO(item);
        }

        aplicarSaldo(item, true);
        item.setPago(true);
        item.setDataPagamento(LocalDate.now());
        return toDTO(contaPagarRepository.save(item));
    }

    // --- DESMARCAR ---
    @Transactional
    public ContaPagarDTO desmarcar(Long id, Long usuarioId) {
        var item = buscar(id, usuarioId);
        if (!Boolean.TRUE.equals(item.getPago())) {
            return toDTO(item);
        }

        aplicarSaldo(item, false);
        item.setPago(false);
        item.setDataPagamento(null);
        return toDTO(contaPagarRepository.save(item));
    }

    // --- DELETAR ---
    @Transactional
    public void deletar(Long id, Long usuarioId) {
        var item = buscar(id, usuarioId);
        if (Boolean.TRUE.equals(item.getPago())) {
            aplicarSaldo(item, false);
        }
        contaPagarRepository.delete(item);
    }

    // --- APLICA OU REVERTE O EFEITO NO SALDO DA CONTA VINCULADA ---
    private void aplicarSaldo(ContaPagar item, boolean aplicar) {
        var conta = item.getConta();
        if (conta == null) {
            return;
        }

        var valor = item.getValor();
        var saida = item.getTipo() == TipoContaPagar.PAGAR;

        // --- PAGAR REDUZ O SALDO; RECEBER AUMENTA ---
        boolean reduzir = aplicar == saida;
        conta.setSaldo(reduzir ? conta.getSaldo().subtract(valor) : conta.getSaldo().add(valor));
    }

    // --- BUSCA VALIDANDO O DONO ---
    private ContaPagar buscar(Long id, Long usuarioId) {
        return contaPagarRepository.findById(id)
                .filter(c -> c.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Compromisso não encontrado"));
    }

    // --- RESOLVE A CONTA VINCULADA ---
    private Conta resolverConta(Long contaId, Long usuarioId) {
        if (contaId == null) {
            return null;
        }
        return contaService.buscarPorIdEUsuario(contaId, usuarioId);
    }

    // --- CONVERSÃO DE ENTIDADE PARA DTO ---
    private ContaPagarDTO toDTO(ContaPagar c) {
        var conta = c.getConta();
        return new ContaPagarDTO(
                c.getId(),
                c.getDescricao(),
                c.getValor(),
                c.getTipo(),
                c.getDataVencimento(),
                c.getPago(),
                c.getDataPagamento(),
                conta != null ? conta.getId() : null,
                conta != null ? conta.getNome() : null
        );
    }
}

