package br.edu.viacar.pedido;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import java.time.LocalDate;

public interface EventoPedidoRepository extends JpaRepository<EventoPedido, UUID>, JpaSpecificationExecutor<EventoPedido> {
    List<EventoPedido> findByPedidoIdOrderByCriadoEmAsc(UUID pedidoId);
}
