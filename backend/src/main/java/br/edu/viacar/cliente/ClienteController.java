package br.edu.viacar.cliente;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;

@RestController @RequestMapping("/api/clientes/me") @RequiredArgsConstructor
public class ClienteController {
    private final ClienteService clientes;
    @GetMapping ClienteDto.Perfil consultar() { return clientes.meuPerfil(); }
    @PutMapping ClienteDto.Perfil editar(@Valid @RequestBody ClienteDto.Edicao dto) { return clientes.editar(dto); }
    @DeleteMapping @ResponseStatus(HttpStatus.NO_CONTENT)
    void excluir(@RequestParam long versao, HttpServletRequest req) {
        clientes.inativar(versao);
        if(req.getSession(false)!=null) req.getSession(false).invalidate();
        SecurityContextHolder.clearContext();
    }
}
