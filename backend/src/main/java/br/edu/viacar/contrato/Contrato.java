package br.edu.viacar.contrato;
import br.edu.viacar.shared.Entidade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity @Table(name="contrato")
@Getter @Setter
public class Contrato extends Entidade {

    @Column(nullable=false, unique=true) private UUID pedidoId;
    @Column(nullable=false) private UUID avaliacaoId;
    @Column(nullable=false) private UUID emissorId;
    @Column(unique=true) private UUID ofertaCreditoId;
    @Column(nullable=false) private UUID proprietarioAnteriorId;
    @Column(nullable=false) private UUID proprietarioFinalId;
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(nullable=false, columnDefinition="jsonb") private String termos;
    @Column(nullable=false) private Instant criadoEm = Instant.now();
}
