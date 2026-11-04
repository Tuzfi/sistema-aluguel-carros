package br.edu.viacar.cliente;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
import java.time.LocalDate;

public interface VinculoEmpregoRepository extends JpaRepository<VinculoEmprego, UUID>, JpaSpecificationExecutor<VinculoEmprego> {

    List<VinculoEmprego> findByClienteIdOrderByPosicao(UUID clienteId);
    @Modifying @Query("delete from VinculoEmprego v where v.clienteId = :clienteId")
    void excluirDoCliente(UUID clienteId);
}
