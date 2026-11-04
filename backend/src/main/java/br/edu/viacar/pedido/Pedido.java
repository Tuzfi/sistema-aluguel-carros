package br.edu.viacar.pedido;
import br.edu.viacar.shared.Entidade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity @Table(name="pedido")
@Getter @Setter
public class Pedido extends Entidade {

    @Column(nullable=false) private UUID clienteId;
    @Column(nullable=false) private UUID veiculoId;
    @Column(nullable=false) private LocalDate inicio;
    @Column(nullable=false) private LocalDate fim;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal diaria;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal total;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=40) private TipoContrato tipoContrato;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private StatusPedido status;
    @Column(nullable=false) private int revisao = 1;
    private UUID avaliacaoAtualId;
    @Version private long versao;
    @Column(nullable=false) private Instant criadoEm = Instant.now();
}
