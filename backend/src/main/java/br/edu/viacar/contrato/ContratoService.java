package br.edu.viacar.contrato;
import br.edu.viacar.auth.*;
import br.edu.viacar.cliente.*;
import br.edu.viacar.pedido.*;
import br.edu.viacar.veiculo.*;
import br.edu.viacar.shared.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import tools.jackson.databind.ObjectMapper;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class ContratoService {
    private final ContratoRepository contratos;
    private final OfertaCreditoRepository ofertas;
    private final PedidoService pedidos;
    private final PedidoRepository pedidosRepo;
    private final VeiculoService veiculos;
    private final ClienteRepository clientes;
    private final AgenteRepository agentes;
    private final ClienteService perfis;
    private final Acesso acesso;
    private final ObjectMapper json;
    private final Clock clock;

    @Transactional
    public ContratoDto.Oferta oferecer(UUID id, ContratoDto.Credito dto) {
        Agente banco=acesso.banco(); Pedido p=pedidos.bloquear(id,dto.versaoPedido()); pedidos.aprovacao(p);
        if(ofertas.findByPedidoIdAndStatus(id,StatusOferta.ATIVA).isPresent()) throw RegraException.conflito("Já existe oferta ativa para este pedido.");
        OfertaCredito o=new OfertaCredito(); o.setPedidoId(id); o.setBancoId(banco.getId()); o.setRevisaoPedido(p.getRevisao()); o.setStatus(StatusOferta.ATIVA);
        preencher(o,dto,p); return ContratoDto.Oferta.de(ofertas.saveAndFlush(o));
    }
    @Transactional
    public ContratoDto.Oferta editarOferta(UUID id, ContratoDto.Credito dto) {
        Agente banco=acesso.banco(); UUID pedidoId=ofertas.pedidoId(id).orElseThrow(RegraException::naoEncontrado);
        Pedido p=pedidos.bloquear(pedidoId,dto.versaoPedido()); pedidos.aprovacao(p);
        OfertaCredito o=ofertas.findById(id).orElseThrow(RegraException::naoEncontrado);
        if(!o.getBancoId().equals(banco.getId())) throw new AccessDeniedException("Oferta de outro banco.");
        Validacao.versao(o.getVersao(),dto.versao());
        if(o.getStatus()!=StatusOferta.ATIVA || o.getRevisaoPedido()!=p.getRevisao()) throw RegraException.conflito("Oferta não pode ser alterada.");
        preencher(o,dto,p); ofertas.flush(); return ContratoDto.Oferta.de(o);
    }
    @Transactional
    public ContratoDto.Resumo emitir(UUID id, ContratoDto.Emissao dto) {
        Agente emissor=acesso.agente(); Pedido p=pedidos.bloquear(id,dto.versaoPedido()); Avaliacao parecer=pedidos.aprovacao(p);
        Veiculo v=veiculos.bloquear(p.getVeiculoId()); veiculos.dono(v); veiculos.disponivel(v,p.getInicio(),p.getFim());
        Cliente cliente=clientes.findById(p.getClienteId()).orElseThrow(RegraException::naoEncontrado);
        UUID donoAnterior=v.getProprietarioId();
        if(p.getTipoContrato()==TipoContrato.TRANSFERENCIA_AO_CLIENTE && pedidosRepo.temContratoFuturo(v.getId(),LocalDate.now(clock))) throw RegraException.conflito("Transferência impedida por outro contrato vigente ou futuro.");
        OfertaCredito oferta=null;
        if(dto.ofertaCreditoId()!=null) {
            oferta=ofertas.findById(dto.ofertaCreditoId()).orElseThrow(RegraException::naoEncontrado);
            if(!oferta.getPedidoId().equals(id) || oferta.getStatus()!=StatusOferta.ATIVA || oferta.getRevisaoPedido()!=p.getRevisao()) throw RegraException.conflito("Oferta de crédito inválida para este pedido.");
        }
        Map<String,Object> termos=new LinkedHashMap<>();
        termos.put("cliente",perfis.perfil(cliente)); termos.put("veiculo",VeiculoDto.Resumo.de(v));
        termos.put("inicio",p.getInicio()); termos.put("fim",p.getFim()); termos.put("diaria",p.getDiaria().toPlainString());
        termos.put("total",p.getTotal().toPlainString()); termos.put("tipoContrato",p.getTipoContrato());
        termos.put("emissor",Map.of("id",emissor.getId(),"razaoSocial",emissor.getRazaoSocial(),"documento",emissor.getDocumento()));
        if(oferta!=null) {
            oferta.setStatus(StatusOferta.CONTRATADA);
            termos.put("credito",ContratoDto.Oferta.de(oferta));
            Agente banco=agentes.findById(oferta.getBancoId()).orElseThrow(RegraException::naoEncontrado);
            termos.put("banco",Map.of("id",banco.getId(),"razaoSocial",banco.getRazaoSocial(),"documento",banco.getDocumento()));
        } else pedidos.invalidarOferta(p);
        if(p.getTipoContrato()==TipoContrato.TRANSFERENCIA_AO_CLIENTE) v.setProprietarioId(cliente.getUsuarioId());
        termos.put("proprietarioAnteriorId",donoAnterior); termos.put("proprietarioFinalId",v.getProprietarioId());
        Contrato contrato=new Contrato(); contrato.setPedidoId(id); contrato.setAvaliacaoId(parecer.getId()); contrato.setEmissorId(emissor.getId());
        contrato.setOfertaCreditoId(oferta==null ? null : oferta.getId()); contrato.setProprietarioAnteriorId(donoAnterior); contrato.setProprietarioFinalId(v.getProprietarioId());
        contrato.setTermos(json.writeValueAsString(termos)); contrato.setCriadoEm(clock.instant());
        p.setStatus(StatusPedido.CONTRATADO); pedidos.evento(p,StatusPedido.APROVADO,"CONTRATACAO");
        contratos.saveAndFlush(contrato); return resumo(contrato);
    }
    @Transactional(readOnly=true)
    public ContratoDto.Resumo consultar(UUID id) {
        Contrato c=contratos.findById(id).orElseThrow(RegraException::naoEncontrado); pedidos.consultar(c.getPedidoId()); return resumo(c);
    }
    private ContratoDto.Resumo resumo(Contrato c) {
        return new ContratoDto.Resumo(c.getId(),c.getPedidoId(),c.getAvaliacaoId(),c.getEmissorId(),c.getOfertaCreditoId(),c.getProprietarioAnteriorId(),c.getProprietarioFinalId(),json.readTree(c.getTermos()),c.getCriadoEm());
    }
    private void preencher(OfertaCredito o, ContratoDto.Credito dto, Pedido p) {
        if(dto.principal().compareTo(p.getTotal())>0) throw RegraException.invalido("O crédito não pode superar o total do pedido.");
        o.setPrincipal(Validacao.dinheiro(dto.principal())); o.setTaxaMensal(dto.taxaMensal()); o.setParcelas(dto.parcelas());
    }
}
