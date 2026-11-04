package br.edu.viacar.pedido;
import br.edu.viacar.shared.Entidade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity @Table(name="avaliacao")
@Getter @Setter
public class Avaliacao extends Entidade {

    @Column(nullable=false) private UUID pedidoId;
    @Column(nullable=false) private UUID agenteId;
    @Column(nullable=false) private int revisaoPedido;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private Decisao decisao;
    @Column(nullable=false, length=2000) private String justificativa;
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(nullable=false, columnDefinition="jsonb") private String dadosFinanceiros;
    @Column(nullable=false) private Instant criadoEm = Instant.now();
}
