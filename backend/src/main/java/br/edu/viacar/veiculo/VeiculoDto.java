package br.edu.viacar.veiculo;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public final class VeiculoDto {
    private VeiculoDto() {}
    public record Dados(@NotBlank @Size(max=40) String matricula, @NotNull @Min(1900) Integer ano,
        @NotBlank @Size(max=80) String marca, @NotBlank @Size(max=100) String modelo,
        @NotBlank String placa, @NotNull @Positive @Digits(integer=10,fraction=2) BigDecimal diaria, Long versao) {}
    public record Resumo(UUID id, String matricula, int ano, String marca, String modelo, String placa,
        String diaria, boolean ativo, long versao) {
        public static Resumo de(Veiculo v) { return new Resumo(v.getId(),v.getMatricula(),v.getAno(),v.getMarca(),v.getModelo(),v.getPlaca(),v.getDiaria().toPlainString(),v.isAtivo(),v.getVersao()); }
    }
}
