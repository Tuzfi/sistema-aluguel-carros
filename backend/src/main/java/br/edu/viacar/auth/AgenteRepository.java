package br.edu.viacar.auth;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import java.time.LocalDate;

public interface AgenteRepository extends JpaRepository<Agente, UUID>, JpaSpecificationExecutor<Agente> {
    Optional<Agente> findByUsuarioId(UUID usuarioId);
}
