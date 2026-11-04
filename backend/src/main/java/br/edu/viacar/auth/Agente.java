package br.edu.viacar.auth;
import br.edu.viacar.shared.Entidade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity @Table(name="agente")
@Getter @Setter
public class Agente extends Entidade {

    @Column(nullable=false, unique=true) private UUID usuarioId;
    @Column(nullable=false, length=150) private String razaoSocial;
    @Column(nullable=false, unique=true, length=30) private String documento;
}
