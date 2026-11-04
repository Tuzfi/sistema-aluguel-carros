package br.edu.viacar.contrato;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import lombok.RequiredArgsConstructor;
import java.net.URI;
import java.util.UUID;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class ContratoController {
    private final ContratoService contratos;
    @PostMapping("/pedidos/{id}/ofertas-credito") @ResponseStatus(HttpStatus.CREATED)
    ContratoDto.Oferta oferecer(@PathVariable UUID id, @Valid @RequestBody ContratoDto.Credito dto) { return contratos.oferecer(id,dto); }
    @PutMapping("/ofertas-credito/{id}")
    ContratoDto.Oferta editar(@PathVariable UUID id, @Valid @RequestBody ContratoDto.Credito dto) { return contratos.editarOferta(id,dto); }
    @PostMapping("/pedidos/{id}/contrato")
    ResponseEntity<ContratoDto.Resumo> emitir(@PathVariable UUID id, @Valid @RequestBody ContratoDto.Emissao dto) {
        var contrato=contratos.emitir(id,dto); return ResponseEntity.created(URI.create("/api/contratos/"+contrato.id())).body(contrato);
    }
    @GetMapping("/contratos/{id}") ContratoDto.Resumo consultar(@PathVariable UUID id) { return contratos.consultar(id); }
}
