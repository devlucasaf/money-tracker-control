package com.moneytracker.modules.conta.service;

import com.moneytracker.modules.usuario.model.Usuario;

import com.moneytracker.modules.conta.model.Conta;
import com.moneytracker.modules.conta.dto.ContaDTO;
import com.moneytracker.modules.conta.repository.ContaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContaService {

    private final ContaRepository contaRepository;

    public List<ContaDTO> listarPorUsuario(Long usuarioId) {
        return contaRepository.findByUsuarioId(usuarioId).stream().map(this::toDTO).toList();
    }

    public ContaDTO criar(ContaDTO dto, Usuario usuario) {
        var conta = Conta.builder()
                .nome(dto.getNome()).tipo(dto.getTipo()).saldo(dto.getSaldo())
                .cor(dto.getCor()).icone(dto.getIcone()).usuario(usuario).build();
        return toDTO(contaRepository.save(conta));
    }

    public ContaDTO atualizar(Long id, ContaDTO dto, Long usuarioId) {
        var conta = buscarPorIdEUsuario(id, usuarioId);

        conta.setNome(dto.getNome());
        conta.setTipo(dto.getTipo());
        conta.setCor(dto.getCor());
        conta.setIcone(dto.getIcone());

        return toDTO(contaRepository.save(conta));
    }

    public void deletar(Long id, Long usuarioId) {
        var conta = buscarPorIdEUsuario(id, usuarioId);
        conta.setAtivo(false);
        contaRepository.save(conta);
    }

    public Conta buscarPorIdEUsuario(Long id, Long usuarioId) {
        return contaRepository.findById(id)
                .filter(c -> c.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Conta não encontrada"));
    }

    private ContaDTO toDTO(Conta conta) {
        return new ContaDTO(
                conta.getId(),
                conta.getNome(),
                conta.getTipo(),
                conta.getSaldo(),
                conta.getCor(),
                conta.getIcone(),
                conta.getAtivo()
        );
    }
}

