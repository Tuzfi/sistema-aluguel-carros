package br.edu.viacar.auth;
import br.edu.viacar.shared.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor
public class AgenteService {
    private final UsuarioRepository usuarios;
    private final AgenteRepository agentes;
    private final PasswordEncoder encoder;
    @Transactional
    public Agente provisionar(String login, String senha, Papel papel, String razaoSocial, String documento) {
        if(papel==null || papel==Papel.CLIENTE) throw RegraException.invalido("Informe EMPRESA ou BANCO.");
        if(razaoSocial==null || razaoSocial.isBlank() || razaoSocial.length()>150 || documento==null || !documento.matches("[0-9]{8,30}")) throw RegraException.invalido("Razão social ou documento inválido.");
        Validacao.senha(senha);
        Usuario usuario=new Usuario(); usuario.setUsuario(Validacao.usuario(login)); usuario.setSenhaHash(encoder.encode(senha)); usuario.setPapel(papel);
        usuarios.saveAndFlush(usuario);
        Agente agente=new Agente(); agente.setUsuarioId(usuario.getId()); agente.setRazaoSocial(razaoSocial.strip()); agente.setDocumento(documento);
        return agentes.saveAndFlush(agente);
    }
}
