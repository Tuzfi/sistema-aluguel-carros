package br.edu.viacar.contrato;
import br.edu.viacar.shared.Entidade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity @Table(name="oferta_credito")
@Getter @Setter
public class OfertaCredito extends Entidade {

    @Column(nullable=false) private UUID pedidoId;
    @Column(nullable=false) private UUID bancoId;
    @Column(nullable=false) private int revisaoPedido;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal principal;
    @Column(nullable=false, precision=7, scale=4) private BigDecimal taxaMensal;
    @Column(nullable=false) private int parcelas;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private StatusOferta status;
    @Version private long versao;
}
