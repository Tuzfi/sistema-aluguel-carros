package br.edu.viacar.auth;
import br.edu.viacar.cliente.*;
import br.edu.viacar.shared.*;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.*;
import java.util.*;

@org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication
@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final ClienteService clientes;
    private final Acesso acesso;
    private final LimiteLogin limite;
    private final SecurityContextRepository context;
    private final CsrfTokenRepository csrf;
    private final String hashInexistente;
    public AuthController(UsuarioRepository usuarios, PasswordEncoder encoder, ClienteService clientes,
            Acesso acesso, LimiteLogin limite, SecurityContextRepository context, CsrfTokenRepository csrf) {
        this.usuarios=usuarios; this.encoder=encoder; this.clientes=clientes; this.acesso=acesso;
        this.limite=limite; this.context=context; this.csrf=csrf;
        this.hashInexistente=encoder.encode(UUID.randomUUID().toString());
    }
    public record Login(@NotBlank @Size(max=50) String usuario, @NotBlank @Size(max=72) String senha) {}
    public record Sessao(UUID id, String usuario, Papel papel) {
        static Sessao de(Usuario u) { return new Sessao(u.getId(),u.getUsuario(),u.getPapel()); }
    }
    @GetMapping("/csrf") Map<String,String> csrf(CsrfToken token) { return Map.of("token",token.getToken(),"headerName",token.getHeaderName()); }
    @PostMapping("/cadastro") @ResponseStatus(HttpStatus.CREATED)
    ClienteDto.Perfil cadastrar(@Valid @RequestBody ClienteDto.Cadastro dto) { return clientes.cadastrar(dto); }
    @PostMapping("/login")
    Sessao login(@Valid @RequestBody Login dto, HttpServletRequest req, HttpServletResponse res) {
        limite.verificar(req.getRemoteAddr(), dto.usuario());
        Usuario usuario = usuarios.findByUsuario(dto.usuario().toLowerCase(Locale.ROOT)).orElse(null);
        boolean senhaCorreta = encoder.matches(dto.senha(), usuario == null ? hashInexistente : usuario.getSenhaHash());
        if (!senhaCorreta || usuario == null || !usuario.isAtivo()) throw new RegraException(HttpStatus.UNAUTHORIZED,"CREDENCIAIS_INVALIDAS","Usuário ou senha inválidos.");
        var autenticacao = UsernamePasswordAuthenticationToken.authenticated(usuario.getUsuario(), null,
            List.of(new SimpleGrantedAuthority("ROLE_"+usuario.getPapel())));
        new ChangeSessionIdAuthenticationStrategy().onAuthentication(autenticacao,req,res);
        csrf.saveToken(null,req,res);
        var contexto = SecurityContextHolder.createEmptyContext(); contexto.setAuthentication(autenticacao);
        SecurityContextHolder.setContext(contexto); context.saveContext(contexto,req,res);
        return Sessao.de(usuario);
    }
    @GetMapping("/me") Sessao me() { return Sessao.de(acesso.atual()); }
    @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT)
    void logout(HttpServletRequest req, HttpServletResponse res) {
        csrf.saveToken(null,req,res);
        if (req.getSession(false)!=null) req.getSession(false).invalidate();
        SecurityContextHolder.clearContext();
    }
}
