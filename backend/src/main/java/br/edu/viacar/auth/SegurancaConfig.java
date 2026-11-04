package br.edu.viacar.auth;
import br.edu.viacar.shared.ErroApi;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.*;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.security.web.context.*;
import org.springframework.security.web.csrf.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.*;

@Configuration
@org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication
public class SegurancaConfig {
    @Bean SecurityContextRepository contextRepository() { return new HttpSessionSecurityContextRepository(); }
    @Bean CsrfTokenRepository csrfRepository() {
        var repository = new HttpSessionCsrfTokenRepository();
        repository.setHeaderName("X-CSRF-TOKEN");
        return repository;
    }
    @Bean SecurityFilterChain security(HttpSecurity http, SecurityContextRepository context,
            CsrfTokenRepository csrf, UsuarioRepository usuarios, ObjectMapper mapper) throws Exception {
        http.securityContext(c -> c.securityContextRepository(context))
            .csrf(c -> c.csrfTokenRepository(csrf))
            .authorizeHttpRequests(c -> c.requestMatchers("/api/auth/csrf", "/api/auth/cadastro", "/api/auth/login").permitAll().anyRequest().authenticated())
            .requestCache(c -> c.disable())
            .formLogin(c -> c.disable()).httpBasic(c -> c.disable()).logout(c -> c.disable())
            .exceptionHandling(c -> c
                .authenticationEntryPoint((req,res,e) -> erro(mapper,req,res,401,"NAO_AUTENTICADO","Entre para continuar."))
                .accessDeniedHandler((req,res,e) -> erro(mapper,req,res,403,"ACESSO_NEGADO","Acesso negado ou token CSRF inválido.")))
            .addFilterBefore(new OncePerRequestFilter() {
                @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
                    String correlacao = UUID.randomUUID().toString();
                    req.setAttribute("correlacaoId", correlacao);
                    res.setHeader("X-Correlation-ID", correlacao);
                    var auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && !(auth instanceof AnonymousAuthenticationToken)
                            && usuarios.findByUsuario(auth.getName()).filter(Usuario::isAtivo).isEmpty()) {
                        if (req.getSession(false) != null) req.getSession(false).invalidate();
                        SecurityContextHolder.clearContext();
                        erro(mapper,req,res,401,"NAO_AUTENTICADO","Entre para continuar.");
                        return;
                    }
                    chain.doFilter(req,res);
                }
            }, AuthorizationFilter.class);
        return http.build();
    }
    private static void erro(ObjectMapper mapper, HttpServletRequest req, HttpServletResponse res, int status, String codigo, String mensagem) throws IOException {
        res.setStatus(status); res.setContentType("application/json;charset=UTF-8");
        mapper.writeValue(res.getWriter(), ErroApi.de(codigo,mensagem,Map.of(),req));
    }
}
