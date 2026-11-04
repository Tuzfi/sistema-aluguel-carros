package br.edu.viacar.veiculo;
import br.edu.viacar.shared.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import java.time.LocalDate;
import java.util.UUID;

@RestController @RequestMapping("/api/veiculos") @RequiredArgsConstructor
public class VeiculoController {
    private final VeiculoService veiculos;
    @GetMapping Pagina<VeiculoDto.Resumo> listar(@RequestParam(required=false) String marca, @RequestParam(required=false) String modelo,
        @RequestParam(required=false) LocalDate inicio, @RequestParam(required=false) LocalDate fim,
        @RequestParam(defaultValue="false") boolean meus, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        return veiculos.listar(marca,modelo,inicio,fim,meus,page,size);
    }
    @GetMapping("/{id}") VeiculoDto.Resumo consultar(@PathVariable UUID id) { return veiculos.consultar(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) VeiculoDto.Resumo criar(@Valid @RequestBody VeiculoDto.Dados dto) { return veiculos.criar(dto); }
    @PutMapping("/{id}") VeiculoDto.Resumo editar(@PathVariable UUID id, @Valid @RequestBody VeiculoDto.Dados dto) { return veiculos.editar(id,dto); }
    @PostMapping("/{id}/inativacao") VeiculoDto.Resumo inativar(@PathVariable UUID id, @Valid @RequestBody VersaoDto dto) { return veiculos.inativar(id,dto.versao()); }
}
