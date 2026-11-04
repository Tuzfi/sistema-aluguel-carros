package br.edu.viacar.pedido;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import java.time.LocalDate;

public interface PedidoRepository extends JpaRepository<Pedido, UUID>, JpaSpecificationExecutor<Pedido> {

    @Query("select p.clienteId from Pedido p where p.id = :id")
    Optional<UUID> clienteId(UUID id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pedido p where p.id = :id")
    Optional<Pedido> bloquear(UUID id);
    boolean existsByClienteIdAndStatusIn(UUID clienteId, Collection<StatusPedido> status);
    @Query("select count(p) > 0 from Pedido p where p.veiculoId = :veiculoId and p.status = br.edu.viacar.pedido.StatusPedido.CONTRATADO and p.inicio < :fim and p.fim > :inicio")
    boolean sobrepoe(UUID veiculoId, LocalDate inicio, LocalDate fim);
    @Query("select count(p) > 0 from Pedido p where p.veiculoId = :veiculoId and p.status = br.edu.viacar.pedido.StatusPedido.CONTRATADO and p.fim > :hoje")
    boolean temContratoFuturo(UUID veiculoId, LocalDate hoje);
    @Query("select count(p) > 0 from Pedido p where p.clienteId = :clienteId and p.status = br.edu.viacar.pedido.StatusPedido.CONTRATADO and p.fim > :hoje")
    boolean clienteTemContratoFuturo(UUID clienteId, LocalDate hoje);
}
