package br.edu.viacar.auth;
import br.edu.viacar.shared.RegraException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class Acesso {
    private final UsuarioRepository usuarios;
    private final jakarta.persistence.EntityManager entityManager;
    private final AgenteRepository agentes;
    public Usuario atual() {
        var autenticacao = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacao == null) throw new RegraException(HttpStatus.UNAUTHORIZED, "NAO_AUTENTICADO", "Entre para continuar.");
        return usuarios.findByUsuario(autenticacao.getName()).filter(Usuario::isAtivo)
            .orElseThrow(() -> new RegraException(HttpStatus.UNAUTHORIZED, "NAO_AUTENTICADO", "Entre para continuar."));
    }
    public Usuario cliente() {
        Usuario usuario = atual();
        if (usuario.getPapel() != Papel.CLIENTE) throw new AccessDeniedException("Apenas clientes.");
        return usuario;
    }
    public Agente agente() {
        Usuario usuario = atual();
        if (usuario.getPapel() == Papel.CLIENTE) throw new AccessDeniedException("Apenas agentes.");
        return agentes.findByUsuarioId(usuario.getId()).orElseThrow(RegraException::naoEncontrado);
    }
    public Agente banco() {
        if (atual().getPapel() != Papel.BANCO) throw new AccessDeniedException("Apenas bancos.");
        return agente();
    }
    public Usuario bloquearCliente(UUID usuarioId) {
        Usuario usuario = usuarios.bloquear(usuarioId).orElseThrow(RegraException::naoEncontrado);
        entityManager.refresh(usuario);
        if (!usuario.isAtivo()) throw RegraException.conflito("O cadastro do cliente está inativo.");
        return usuario;
    }
}
