package br.edu.viacar.pedido;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import java.time.LocalDate;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, UUID>, JpaSpecificationExecutor<Avaliacao> {

    List<Avaliacao> findByPedidoIdOrderByCriadoEmAsc(UUID pedidoId);
    Optional<Avaliacao> findFirstByPedidoIdAndRevisaoPedidoOrderByCriadoEmDesc(UUID pedidoId, int revisaoPedido);
}
