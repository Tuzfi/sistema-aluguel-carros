package br.edu.viacar.contrato;
import jakarta.validation.constraints.*;
import tools.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public final class ContratoDto {
    private ContratoDto() {}
    public record Credito(@NotNull @Positive @Digits(integer=10,fraction=2) BigDecimal principal,
        @NotNull @DecimalMin("0") @DecimalMax("100") @Digits(integer=3,fraction=4) BigDecimal taxaMensal,
        @NotNull @Positive Integer parcelas, @NotNull @PositiveOrZero Long versaoPedido, Long versao) {}
    public record Emissao(@NotNull @PositiveOrZero Long versaoPedido, UUID ofertaCreditoId) {}
    public record Oferta(UUID id, UUID pedidoId, UUID bancoId, int revisaoPedido, String principal, String taxaMensal, int parcelas, StatusOferta status, long versao) {
        public static Oferta de(OfertaCredito o) { return new Oferta(o.getId(),o.getPedidoId(),o.getBancoId(),o.getRevisaoPedido(),o.getPrincipal().toPlainString(),o.getTaxaMensal().toPlainString(),o.getParcelas(),o.getStatus(),o.getVersao()); }
    }
    public record Resumo(UUID id, UUID pedidoId, UUID avaliacaoId, UUID emissorId, UUID ofertaCreditoId,
        UUID proprietarioAnteriorId, UUID proprietarioFinalId, JsonNode termos, Instant criadoEm) {}
}
