package cloudsupport.moneytracker.modules.transacao.rest;

import cloudsupport.moneytracker.modules.usuario.model.Usuario;
import cloudsupport.moneytracker.modules.transacao.dto.TransacaoDTO;
import cloudsupport.moneytracker.modules.transacao.model.TipoTransacao;
import cloudsupport.moneytracker.modules.transacao.service.TransacaoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transacoes")
@RequiredArgsConstructor
public class TransacaoController {

    private final TransacaoService transacaoService;

    // --- LISTAR TRANSAÇÕES DO USUÁRIO ---
    @GetMapping
    public ResponseEntity<Page<TransacaoDTO>> listar(
            @AuthenticationPrincipal
            Usuario usuario,

            @RequestParam(required = false)
            String busca,

            @RequestParam(required = false)
            Long categoriaId,

            @RequestParam(required = false)
            Long contaId,

            @RequestParam(required = false)
            TipoTransacao tipo,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataInicio,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataFim,

            @RequestParam(required = false)
            String tag,

            @PageableDefault(size = 20, sort = "data")
            Pageable pageable) {
        return ResponseEntity.ok(transacaoService.listarComFiltros(
                usuario.getId(), busca, categoriaId, contaId, tipo, dataInicio, dataFim, tag, pageable));
    }

    // --- CRIAR NOVA TRANSAÇÃO ---
    @PostMapping
    public ResponseEntity<TransacaoDTO> criarTransacao(@RequestBody @Valid TransacaoDTO dto,
                                                       @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(transacaoService.criar(dto, usuario));
    }

    // --- ATUALIZAR TRANSAÇÃO EXISTENTE ---
    @PutMapping("/{id}")
    public ResponseEntity<TransacaoDTO> atualizarTransacaoExistente(@PathVariable Long id, @RequestBody @Valid TransacaoDTO dto,
                                                                    @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(transacaoService.atualizar(id, dto, usuario.getId()));
    }

    // --- DELETAR TRANSAÇÃO ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarTransacao(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        transacaoService.deletar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}

