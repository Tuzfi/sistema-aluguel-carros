package br.edu.viacar.auth;
import br.edu.viacar.shared.Entidade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity @Table(name="usuario")
@Getter @Setter
public class Usuario extends Entidade {

    @Column(nullable=false, unique=true, length=50) private String usuario;
    @Column(nullable=false) private String senhaHash;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private Papel papel;
    @Column(nullable=false) private boolean ativo = true;
    @Column(nullable=false) private Instant criadoEm = Instant.now();
}
