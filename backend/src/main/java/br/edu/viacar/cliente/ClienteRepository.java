package br.edu.viacar.cliente;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import java.time.LocalDate;

public interface ClienteRepository extends JpaRepository<Cliente, UUID>, JpaSpecificationExecutor<Cliente> {

    Optional<Cliente> findByUsuarioId(UUID usuarioId);
    @Query("select c.usuarioId from Cliente c where c.id = :id")
    Optional<UUID> usuarioId(UUID id);
}
