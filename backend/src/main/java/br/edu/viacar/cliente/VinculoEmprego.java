package br.edu.viacar.cliente;
import br.edu.viacar.shared.Entidade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity @Table(name="vinculo_emprego")
@Getter @Setter
public class VinculoEmprego extends Entidade {

    @Column(nullable=false) private UUID clienteId;
    @Column(nullable=false) private int posicao;
    @Column(nullable=false, length=150) private String empregador;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal rendaMensal;
}
