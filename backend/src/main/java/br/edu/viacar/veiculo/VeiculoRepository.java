package br.edu.viacar.veiculo;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import java.time.LocalDate;

public interface VeiculoRepository extends JpaRepository<Veiculo, UUID>, JpaSpecificationExecutor<Veiculo> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Veiculo v where v.id = :id")
    Optional<Veiculo> bloquear(UUID id);
}
