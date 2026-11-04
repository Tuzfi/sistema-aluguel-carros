package br.edu.viacar.veiculo;
import br.edu.viacar.shared.Entidade;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity @Table(name="veiculo")
@Getter @Setter
public class Veiculo extends Entidade {

    @Column(nullable=false, unique=true, length=40) private String matricula;
    @Column(nullable=false) private int ano;
    @Column(nullable=false, length=80) private String marca;
    @Column(nullable=false, length=100) private String modelo;
    @Column(nullable=false, unique=true, length=7) private String placa;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal diaria;
    @Column(name="foto_url", columnDefinition="TEXT") private String fotoUrl;
    @Column(nullable=false) private UUID proprietarioId;
    @Column(nullable=false) private boolean ativo = true;
    @Version private long versao;
}
