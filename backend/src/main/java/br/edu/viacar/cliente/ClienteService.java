package br.edu.viacar.cliente;
import br.edu.viacar.auth.*;
import br.edu.viacar.pedido.*;
import br.edu.viacar.shared.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class ClienteService {
    private final ClienteRepository clientes;
    private final VinculoEmpregoRepository empregos;
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final Acesso acesso;
    private final PedidoRepository pedidos;
    private final Clock clock;

    @Transactional
    public ClienteDto.Perfil cadastrar(ClienteDto.Cadastro dto) {
        Validacao.senha(dto.senha());
        Usuario usuario = new Usuario(); usuario.setUsuario(Validacao.usuario(dto.usuario()));
        usuario.setSenhaHash(encoder.encode(dto.senha())); usuario.setPapel(Papel.CLIENTE);
        usuarios.saveAndFlush(usuario);
        Cliente cliente = new Cliente(); cliente.setUsuarioId(usuario.getId());
        preencher(cliente,dto.nome(),dto.cpf(),dto.rg(),dto.endereco(),dto.profissao());
        clientes.saveAndFlush(cliente); salvarEmpregos(cliente,dto.empregos());
        return perfil(cliente);
    }
    @Transactional(readOnly=true)
    public ClienteDto.Perfil meuPerfil() { return perfil(porUsuario(acesso.cliente().getId())); }
    public Cliente porUsuario(UUID id) { return clientes.findByUsuarioId(id).orElseThrow(RegraException::naoEncontrado); }
    public ClienteDto.Perfil perfil(Cliente cliente) {
        return new ClienteDto.Perfil(cliente.getId(),cliente.getUsuarioId(),cliente.getNome(),cliente.getCpf(),cliente.getRg(),cliente.getEndereco(),cliente.getProfissao(),
            empregos.findByClienteIdOrderByPosicao(cliente.getId()).stream().map(e -> new ClienteDto.Renda(e.getEmpregador(),e.getRendaMensal().toPlainString())).toList(),cliente.getVersao());
    }
    @Transactional
    public ClienteDto.Perfil editar(ClienteDto.Edicao dto) {
        UUID id = acesso.cliente().getId(); acesso.bloquearCliente(id);
        Cliente cliente = porUsuario(id); Validacao.versao(cliente.getVersao(),dto.versao());
        preencher(cliente,dto.nome(),dto.cpf(),dto.rg(),dto.endereco(),dto.profissao());
        // A versão também muda quando somente os vínculos são alterados.
        cliente.setVersao(cliente.getVersao()+1);
        empregos.excluirDoCliente(cliente.getId()); salvarEmpregos(cliente,dto.empregos());
        clientes.flush(); return perfil(cliente);
    }
    @Transactional
    public void inativar(long versao) {
        UUID id = acesso.cliente().getId(); Usuario usuario = acesso.bloquearCliente(id);
        Cliente cliente = porUsuario(id); Validacao.versao(cliente.getVersao(),versao);
        if (pedidos.existsByClienteIdAndStatusIn(cliente.getId(),List.of(StatusPedido.PENDENTE,StatusPedido.APROVADO))
                || pedidos.clienteTemContratoFuturo(cliente.getId(),LocalDate.now(clock))) throw RegraException.conflito("Cancele pedidos ativos e aguarde o fim dos contratos.");
        usuario.setAtivo(false);
    }
    private void preencher(Cliente cliente, String nome, String cpf, String rg, String endereco, String profissao) {
        cliente.setNome(nome.strip()); cliente.setCpf(Validacao.cpf(cpf)); cliente.setRg(rg.strip());
        cliente.setEndereco(endereco.strip()); cliente.setProfissao(profissao.strip());
    }
    private void salvarEmpregos(Cliente cliente, List<ClienteDto.Emprego> lista) {
        if (lista.size()>3) throw RegraException.invalido("O limite é de três vínculos de emprego.");
        for (int i=0; i<lista.size(); i++) {
            var dto=lista.get(i); var emprego=new VinculoEmprego(); emprego.setClienteId(cliente.getId());
            emprego.setPosicao(i+1); emprego.setEmpregador(dto.empregador().strip()); emprego.setRendaMensal(Validacao.dinheiro(dto.rendaMensal()));
            empregos.save(emprego);
        }
        empregos.flush();
    }
}
