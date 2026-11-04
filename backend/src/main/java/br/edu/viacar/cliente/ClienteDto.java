package br.edu.viacar.cliente;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.*;

public final class ClienteDto {
    private ClienteDto() {}
    public record Emprego(@NotBlank @Size(max=150) String empregador, @NotNull @Positive @Digits(integer=10,fraction=2) BigDecimal rendaMensal) {}
    public record Cadastro(@NotBlank @Size(max=50) String usuario, @NotBlank String senha,
        @NotBlank @Size(min=2,max=150) String nome, @NotBlank String cpf,
        @NotBlank @Size(max=30) String rg, @NotBlank @Size(min=5,max=300) String endereco,
        @NotBlank @Size(min=2,max=100) String profissao, @NotNull @Size(max=3) List<@NotNull @Valid Emprego> empregos) {}
    public record Edicao(@NotBlank @Size(min=2,max=150) String nome, @NotBlank String cpf,
        @NotBlank @Size(max=30) String rg, @NotBlank @Size(min=5,max=300) String endereco,
        @NotBlank @Size(min=2,max=100) String profissao, @NotNull @Size(max=3) List<@NotNull @Valid Emprego> empregos,
        @NotNull @PositiveOrZero Long versao) {}
    public record Renda(String empregador, String rendaMensal) {}
    public record Perfil(UUID id, UUID usuarioId, String nome, String cpf, String rg, String endereco,
        String profissao, List<Renda> empregos, long versao) {}
}
