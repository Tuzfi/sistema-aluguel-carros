package br.edu.viacar.contrato;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import java.time.LocalDate;

public interface OfertaCreditoRepository extends JpaRepository<OfertaCredito, UUID>, JpaSpecificationExecutor<OfertaCredito> {

    List<OfertaCredito> findByPedidoId(UUID pedidoId);
    Optional<OfertaCredito> findByPedidoIdAndStatus(UUID pedidoId, StatusOferta status);
    @Query("select o.pedidoId from OfertaCredito o where o.id = :id")
    Optional<UUID> pedidoId(UUID id);
}
