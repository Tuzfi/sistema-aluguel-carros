package br.edu.viacar.shared;
import jakarta.persistence.*;
import lombok.Getter;
import java.util.UUID;

@Getter
@MappedSuperclass
public abstract class Entidade {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
}
