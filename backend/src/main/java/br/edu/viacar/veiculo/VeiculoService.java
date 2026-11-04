package br.edu.viacar.veiculo;
import br.edu.viacar.auth.*;
import br.edu.viacar.pedido.*;
import br.edu.viacar.shared.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class VeiculoService {
    private final VeiculoRepository veiculos;
    private final PedidoRepository pedidos;
    private final Acesso acesso;
    private final Clock clock;
    @Transactional(readOnly=true)
    public Pagina<VeiculoDto.Resumo> listar(String marca, String modelo, LocalDate inicio, LocalDate fim, boolean meus, int page, int size) {
        Usuario usuario=acesso.atual();
        if(meus) acesso.agente();
        if(inicio!=null || fim!=null) Validacao.periodo(inicio,fim,LocalDate.now(clock));
        Specification<Veiculo> spec=(root,query,cb) -> {
            var filtros=new ArrayList<jakarta.persistence.criteria.Predicate>();
            if(meus) filtros.add(cb.equal(root.get("proprietarioId"),usuario.getId()));
            else filtros.add(cb.isTrue(root.get("ativo")));
            if(marca!=null && !marca.isBlank()) filtros.add(cb.equal(cb.lower(root.get("marca")),marca.toLowerCase(Locale.ROOT)));
            if(modelo!=null && !modelo.isBlank()) filtros.add(cb.equal(cb.lower(root.get("modelo")),modelo.toLowerCase(Locale.ROOT)));
            if(inicio!=null) {
                var sub=query.subquery(UUID.class); var p=sub.from(Pedido.class);
                sub.select(p.get("id")).where(cb.equal(p.get("veiculoId"),root.get("id")),cb.equal(p.get("status"),StatusPedido.CONTRATADO),cb.lessThan(p.get("inicio"),fim),cb.greaterThan(p.get("fim"),inicio));
                filtros.add(cb.not(cb.exists(sub)));
            }
            return cb.and(filtros.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
        return Pagina.de(veiculos.findAll(spec,Pagina.pedido(page,size,"marca")),VeiculoDto.Resumo::de);
    }
    @Transactional(readOnly=true)
    public VeiculoDto.Resumo consultar(UUID id) { acesso.atual(); return VeiculoDto.Resumo.de(buscar(id)); }
    public Veiculo buscar(UUID id) { return veiculos.findById(id).orElseThrow(RegraException::naoEncontrado); }
    public Veiculo bloquear(UUID id) { return veiculos.bloquear(id).orElseThrow(RegraException::naoEncontrado); }
    public void disponivel(Veiculo v, LocalDate inicio, LocalDate fim) {
        Validacao.periodo(inicio,fim,LocalDate.now(clock));
        if(!v.isAtivo()) throw RegraException.conflito("Veículo inativo.");
        if(pedidos.sobrepoe(v.getId(),inicio,fim)) throw RegraException.conflito("Veículo indisponível no período.");
    }
    @Transactional
    public VeiculoDto.Resumo criar(VeiculoDto.Dados dto) {
        acesso.agente(); Veiculo v=new Veiculo(); v.setProprietarioId(acesso.atual().getId());
        preencher(v,dto); return VeiculoDto.Resumo.de(veiculos.saveAndFlush(v));
    }
    @Transactional
    public VeiculoDto.Resumo editar(UUID id, VeiculoDto.Dados dto) {
        acesso.agente(); Veiculo v=bloquear(id); dono(v); Validacao.versao(v.getVersao(),dto.versao());
        preencher(v,dto); veiculos.flush(); return VeiculoDto.Resumo.de(v);
    }
    @Transactional
    public VeiculoDto.Resumo inativar(UUID id, Long versao) {
        acesso.agente(); Veiculo v=bloquear(id); dono(v); Validacao.versao(v.getVersao(),versao);
        if(pedidos.temContratoFuturo(id,LocalDate.now(clock))) throw RegraException.conflito("Veículo possui contrato vigente ou futuro.");
        v.setAtivo(false); veiculos.flush(); return VeiculoDto.Resumo.de(v);
    }
    public void dono(Veiculo v) {
        if(!v.getProprietarioId().equals(acesso.atual().getId())) throw new AccessDeniedException("Veículo de outro proprietário.");
    }
    private void preencher(Veiculo v, VeiculoDto.Dados dto) {
        if(dto.ano()>LocalDate.now(clock).getYear()+1) throw RegraException.invalido("Ano do veículo inválido.");
        String placa=dto.placa().replace("-","").toUpperCase(Locale.ROOT);
        if(!placa.matches("[A-Z]{3}[0-9][A-Z0-9][0-9]{2}")) throw RegraException.invalido("Placa inválida.");
        v.setMatricula(dto.matricula().strip()); v.setAno(dto.ano()); v.setMarca(dto.marca().strip()); v.setModelo(dto.modelo().strip());
        v.setPlaca(placa); v.setDiaria(Validacao.dinheiro(dto.diaria()));
        v.setFotoUrl(dto.fotoUrl() != null && !dto.fotoUrl().isBlank() ? dto.fotoUrl().trim() : null);
    }
}
