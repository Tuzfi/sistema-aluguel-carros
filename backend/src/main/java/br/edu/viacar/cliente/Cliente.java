package br.edu.viacar.cliente;
import br.edu.viacar.shared.Entidade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity @Table(name="cliente")
@Getter @Setter
public class Cliente extends Entidade {

    @Column(nullable=false, unique=true) private UUID usuarioId;
    @Column(nullable=false, length=30) private String rg;
    @Column(nullable=false, unique=true, length=11) private String cpf;
    @Column(nullable=false, length=150) private String nome;
    @Column(nullable=false, length=300) private String endereco;
    @Column(nullable=false, length=100) private String profissao;
    @Version private long versao;
}
