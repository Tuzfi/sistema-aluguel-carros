package br.edu.viacar.pedido;
import br.edu.viacar.cliente.ClienteDto;
import br.edu.viacar.shared.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import lombok.RequiredArgsConstructor;
import java.net.URI;
import java.util.UUID;

@RestController @RequestMapping("/api/pedidos") @RequiredArgsConstructor
public class PedidoController {
    private final PedidoService pedidos;
    @GetMapping Pagina<PedidoDto.Resumo> listar(@RequestParam(required=false) StatusPedido status,
        @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) { return pedidos.listar(status,page,size); }
    @PostMapping ResponseEntity<PedidoDto.Resumo> criar(@Valid @RequestBody PedidoDto.Dados dto) {
        var pedido=pedidos.criar(dto); return ResponseEntity.created(URI.create("/api/pedidos/"+pedido.id())).body(pedido);
    }
    @GetMapping("/{id}") PedidoDto.Detalhe consultar(@PathVariable UUID id) { return pedidos.detalhe(id); }
    @PutMapping("/{id}") PedidoDto.Resumo editar(@PathVariable UUID id, @Valid @RequestBody PedidoDto.Dados dto) { return pedidos.editar(id,dto); }
    @PostMapping("/{id}/cancelamento") PedidoDto.Resumo cancelar(@PathVariable UUID id, @Valid @RequestBody VersaoDto dto) { return pedidos.cancelar(id,dto.versao()); }
    @GetMapping("/{id}/dados-financeiros") ClienteDto.Perfil dadosFinanceiros(@PathVariable UUID id) { return pedidos.dadosFinanceiros(id); }
    @PostMapping("/{id}/avaliacoes") @ResponseStatus(HttpStatus.CREATED)
    PedidoDto.Resumo avaliar(@PathVariable UUID id, @Valid @RequestBody PedidoDto.Parecer dto) { return pedidos.avaliar(id,dto); }
}
