package br.edu.viacar.pedido;
import br.edu.viacar.auth.*;
import br.edu.viacar.cliente.*;
import br.edu.viacar.contrato.*;
import br.edu.viacar.veiculo.*;
import br.edu.viacar.shared.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import tools.jackson.databind.ObjectMapper;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.math.BigDecimal;
import java.util.*;

@Service @RequiredArgsConstructor
public class PedidoService {
    private final PedidoRepository pedidos;
    private final ClienteRepository clientes;
    private final ClienteService perfis;
    private final VeiculoService veiculos;
    private final AvaliacaoRepository avaliacoes;
    private final EventoPedidoRepository eventos;
    private final OfertaCreditoRepository ofertas;
    private final ContratoRepository contratos;
    private final Acesso acesso;
    private final ObjectMapper json;
    private final Clock clock;

    @Transactional(readOnly=true)
    public Pagina<PedidoDto.Resumo> listar(StatusPedido status, int page, int size) {
        Usuario usuario=acesso.atual();
        UUID clienteId=usuario.getPapel()==Papel.CLIENTE ? perfis.porUsuario(usuario.getId()).getId() : null;
        Specification<Pedido> spec=(root,q,cb) -> {
            var filtro=cb.conjunction();
            if(clienteId!=null) filtro=cb.and(filtro,cb.equal(root.get("clienteId"),clienteId));
            if(status!=null) filtro=cb.and(filtro,cb.equal(root.get("status"),status));
            return filtro;
        };
        return Pagina.de(pedidos.findAll(spec,Pagina.pedido(page,size,"criadoEm")),PedidoDto.Resumo::de);
    }
    @Transactional(readOnly=true)
    public PedidoDto.Detalhe detalhe(UUID id) {
        Pedido p=consultar(id);
        Usuario usuario = acesso.atual();
        boolean agente = usuario.getPapel() != Papel.CLIENTE;
        boolean podeContratar = agente && veiculos.buscar(p.getVeiculoId()).getProprietarioId().equals(usuario.getId());
        UUID agenteAtualId = agente ? acesso.agente().getId() : null;
        return new PedidoDto.Detalhe(PedidoDto.Resumo.de(p),avaliacoes.findByPedidoIdOrderByCriadoEmAsc(id).stream().map(PedidoDto.AvaliacaoResumo::de).toList(),
            eventos.findByPedidoIdOrderByCriadoEmAsc(id).stream().map(PedidoDto.Evento::de).toList(),ofertas.findByPedidoId(id).stream().map(ContratoDto.Oferta::de).toList(),contratos.findByPedidoId(id).map(Contrato::getId).orElse(null), podeContratar, agenteAtualId);
    }
    public Pedido consultar(UUID id) {
        Pedido p=pedidos.findById(id).orElseThrow(RegraException::naoEncontrado); conferirDono(p.getClienteId()); return p;
    }
    private void conferirDono(UUID clienteId) {
        Usuario usuario=acesso.atual();
        if(usuario.getPapel()==Papel.CLIENTE && !perfis.porUsuario(usuario.getId()).getId().equals(clienteId)) throw RegraException.naoEncontrado();
    }
    public Pedido bloquear(UUID id, Long versao) {
        // A projeção não carrega uma entidade que poderia ficar obsoleta antes do lock.
        UUID clienteId=pedidos.clienteId(id).orElseThrow(RegraException::naoEncontrado);
        conferirDono(clienteId);
        acesso.bloquearCliente(clientes.usuarioId(clienteId).orElseThrow(RegraException::naoEncontrado));
        Pedido p=pedidos.bloquear(id).orElseThrow(RegraException::naoEncontrado);
        Validacao.versao(p.getVersao(),versao);
        if(p.getStatus()==StatusPedido.CANCELADO || p.getStatus()==StatusPedido.CONTRATADO) throw RegraException.conflito("Pedido encerrado não pode ser alterado.");
        return p;
    }
    @Transactional
    public PedidoDto.Resumo criar(PedidoDto.Dados dto) {
        UUID usuarioId=acesso.cliente().getId(); acesso.bloquearCliente(usuarioId);
        Pedido p=new Pedido(); p.setClienteId(perfis.porUsuario(usuarioId).getId());
        preencher(p,dto); p.setStatus(StatusPedido.PENDENTE); p.setCriadoEm(clock.instant());
        pedidos.saveAndFlush(p); evento(p,null,"CRIACAO"); return PedidoDto.Resumo.de(p);
    }
    @Transactional
    public PedidoDto.Resumo editar(UUID id, PedidoDto.Dados dto) {
        Pedido p=bloquear(id,dto.versao()); StatusPedido anterior=p.getStatus();
        preencher(p,dto); p.setRevisao(p.getRevisao()+1); p.setStatus(StatusPedido.PENDENTE);
        invalidarOferta(p); evento(p,anterior,"EDICAO"); pedidos.flush(); return PedidoDto.Resumo.de(p);
    }
    @Transactional
    public PedidoDto.Resumo cancelar(UUID id, Long versao) {
        acesso.cliente(); Pedido p=bloquear(id,versao); StatusPedido anterior=p.getStatus();
        p.setStatus(StatusPedido.CANCELADO); invalidarOferta(p); evento(p,anterior,"CANCELAMENTO"); pedidos.flush(); return PedidoDto.Resumo.de(p);
    }
    @Transactional(readOnly=true)
    public ClienteDto.Perfil dadosFinanceiros(UUID id) {
        acesso.agente(); return perfis.perfil(clientes.findById(consultar(id).getClienteId()).orElseThrow(RegraException::naoEncontrado));
    }
    @Transactional
    public PedidoDto.Resumo avaliar(UUID id, PedidoDto.Parecer dto) {
        Agente agente=acesso.agente(); Pedido p=bloquear(id,dto.versao()); StatusPedido anterior=p.getStatus();
        Avaliacao a=new Avaliacao(); a.setPedidoId(id); a.setAgenteId(agente.getId()); a.setRevisaoPedido(p.getRevisao());
        a.setDecisao(dto.decisao()); a.setJustificativa(dto.justificativa().strip());
        a.setDadosFinanceiros(json.writeValueAsString(perfis.perfil(clientes.findById(p.getClienteId()).orElseThrow(RegraException::naoEncontrado))));
        a.setCriadoEm(clock.instant()); avaliacoes.save(a);
        p.setStatus(dto.decisao()==Decisao.APROVADO ? StatusPedido.APROVADO : StatusPedido.REPROVADO);
        // Reavaliações também precisam consumir a versão, mesmo mantendo o status.
        p.setAvaliacaoAtualId(a.getId());
        if(p.getStatus()==StatusPedido.REPROVADO) invalidarOferta(p);
        evento(p,anterior,"AVALIACAO"); pedidos.flush(); return PedidoDto.Resumo.de(p);
    }
    public Avaliacao aprovacao(Pedido p) {
        if(p.getStatus()!=StatusPedido.APROVADO || p.getAvaliacaoAtualId()==null) throw RegraException.conflito("Pedido precisa de aprovação financeira.");
        Avaliacao a=avaliacoes.findById(p.getAvaliacaoAtualId()).orElseThrow(RegraException::naoEncontrado);
        if(a.getDecisao()!=Decisao.APROVADO || a.getRevisaoPedido()!=p.getRevisao()) throw RegraException.conflito("O parecer financeiro está desatualizado.");
        return a;
    }
    public void invalidarOferta(Pedido p) {
        ofertas.findByPedidoIdAndStatus(p.getId(),StatusOferta.ATIVA).ifPresent(o -> o.setStatus(StatusOferta.INVALIDADA));
    }
    public void evento(Pedido p, StatusPedido anterior, String acao) {
        EventoPedido e=new EventoPedido(); e.setPedidoId(p.getId()); e.setAutorId(acesso.atual().getId()); e.setAcao(acao);
        e.setStatusAnterior(anterior); e.setStatusNovo(p.getStatus()); e.setRevisao(p.getRevisao()); e.setCriadoEm(clock.instant()); eventos.save(e);
    }
    private void preencher(Pedido p, PedidoDto.Dados dto) {
        Veiculo v=veiculos.bloquear(dto.veiculoId()); veiculos.disponivel(v,dto.inicio(),dto.fim());
        p.setVeiculoId(v.getId()); p.setInicio(dto.inicio()); p.setFim(dto.fim()); p.setDiaria(v.getDiaria());
        p.setTotal(Validacao.dinheiro(v.getDiaria().multiply(BigDecimal.valueOf(ChronoUnit.DAYS.between(dto.inicio(),dto.fim())))));
        p.setTipoContrato(dto.tipoContrato()); p.setAvaliacaoAtualId(null);
    }
}
