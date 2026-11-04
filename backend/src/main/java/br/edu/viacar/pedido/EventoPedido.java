package br.edu.viacar.pedido;
import br.edu.viacar.shared.Entidade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity @Table(name="evento_pedido")
@Getter @Setter
public class EventoPedido extends Entidade {

    @Column(nullable=false) private UUID pedidoId;
    @Column(nullable=false) private UUID autorId;
    @Column(nullable=false, length=40) private String acao;
    @Enumerated(EnumType.STRING) @Column(length=20) private StatusPedido statusAnterior;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private StatusPedido statusNovo;
    @Column(nullable=false) private int revisao;
    @Column(nullable=false) private Instant criadoEm = Instant.now();
}
