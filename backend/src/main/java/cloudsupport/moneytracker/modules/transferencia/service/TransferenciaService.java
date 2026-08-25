package cloudsupport.moneytracker.modules.transferencia.service;

import cloudsupport.moneytracker.modules.conta.service.ContaService;
import cloudsupport.moneytracker.modules.transferencia.dto.TransferenciaDTO;
import cloudsupport.moneytracker.modules.transferencia.model.Transferencia;
import cloudsupport.moneytracker.modules.transferencia.repository.TransferenciaRepository;
import cloudsupport.moneytracker.modules.usuario.model.Usuario;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransferenciaService {

    private final TransferenciaRepository transferenciaRepository;
    private final ContaService contaService;

    // --- LISTAR TRANSFERÊNCIAS DO USUÁRIO ---
    @Transactional(readOnly = true)
    public List<TransferenciaDTO> listarTransferenciPorUsuario(Long usuarioId) {
        return transferenciaRepository.findByUsuarioIdOrderByDataDescIdDesc(usuarioId)
                .stream().map(this::toDTO).toList();
    }

    // --- CRIAR NOVA TRANSFERÊNCIA ---
    @Transactional
    public TransferenciaDTO criarTransferencia(TransferenciaDTO dto, Usuario usuario) {
        if (dto.getContaOrigemId().equals(dto.getContaDestinoId())) {
            throw new IllegalArgumentException("A conta de origem e destino devem ser diferentes");
        }

        var origem = contaService.buscarPorIdEUsuario(dto.getContaOrigemId(), usuario.getId());
        var destino = contaService.buscarPorIdEUsuario(dto.getContaDestinoId(), usuario.getId());

        // --- MOVE O SALDO ---
        origem.setSaldo(origem.getSaldo().subtract(dto.getValor()));
        destino.setSaldo(destino.getSaldo().add(dto.getValor()));

        var transferencia = Transferencia.builder()
                .valor(dto.getValor())
                .data(dto.getData())
                .descricao(dto.getDescricao())
                .contaOrigem(origem)
                .contaDestino(destino)
                .usuario(usuario)
                .build();

        return toDTO(transferenciaRepository.save(transferencia));
    }

    // --- DELETAR TRANSFERÊNCIA ---
    @Transactional
    public void deletarTransferencia(Long id, Long usuarioId) {
        var transferencia = transferenciaRepository.findById(id)
                .filter(t -> t.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Transferência não encontrada"));

        transferencia.getContaOrigem().setSaldo(transferencia
                .getContaOrigem()
                .getSaldo()
                .add(transferencia
                        .getValor())
        );
        transferencia.getContaDestino().setSaldo(transferencia
                .getContaDestino()
                .getSaldo()
                .subtract(transferencia.getValor())
        );

        transferenciaRepository.delete(transferencia);
    }

    // --- CONVERSÃO DE ENTIDADE PARA DTO ---
    private TransferenciaDTO toDTO(Transferencia t) {
        return new TransferenciaDTO(
                t.getId(),
                t.getValor(),
                t.getData(),
                t.getDescricao(),
                t.getContaOrigem().getId(),
                t.getContaOrigem().getNome(),
                t.getContaDestino().getId(),
                t.getContaDestino().getNome()
        );
    }
}

