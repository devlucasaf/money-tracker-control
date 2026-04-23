package com.tracker.control.modules.conta.service;

import com.tracker.control.modules.usuario.model.Usuario;

import com.tracker.control.modules.conta.model.Conta;
import com.tracker.control.modules.conta.dto.ContaDTO;
import com.tracker.control.modules.conta.repository.ContaRepository;

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

    private ContaDTO toDTO(Conta c) {
        return new ContaDTO(c.getId(), c.getNome(), c.getTipo(), c.getSaldo(), c.getCor(), c.getIcone(), c.getAtivo());
    }
}

