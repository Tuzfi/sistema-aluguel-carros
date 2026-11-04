package br.edu.viacar.pedido;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import br.edu.viacar.contrato.ContratoDto;

public final class PedidoDto {
    private PedidoDto() {}
    public record Dados(@NotNull UUID veiculoId, @NotNull LocalDate inicio, @NotNull LocalDate fim, @NotNull TipoContrato tipoContrato, Long versao) {}
    public record Parecer(@NotNull @PositiveOrZero Long versao, @NotNull Decisao decisao, @NotBlank @Size(max=2000) String justificativa) {}
    public record Resumo(UUID id, UUID clienteId, UUID veiculoId, LocalDate inicio, LocalDate fim, String diaria, String total,
        TipoContrato tipoContrato, StatusPedido status, int revisao, long versao, Instant criadoEm) {
        public static Resumo de(Pedido p) { return new Resumo(p.getId(),p.getClienteId(),p.getVeiculoId(),p.getInicio(),p.getFim(),p.getDiaria().toPlainString(),p.getTotal().toPlainString(),p.getTipoContrato(),p.getStatus(),p.getRevisao(),p.getVersao(),p.getCriadoEm()); }
    }
    public record AvaliacaoResumo(UUID id, UUID agenteId, int revisaoPedido, Decisao decisao, String justificativa, Instant criadoEm) {
        public static AvaliacaoResumo de(Avaliacao a) { return new AvaliacaoResumo(a.getId(),a.getAgenteId(),a.getRevisaoPedido(),a.getDecisao(),a.getJustificativa(),a.getCriadoEm()); }
    }
    public record Evento(UUID id, UUID autorId, String acao, StatusPedido statusAnterior, StatusPedido statusNovo, int revisao, Instant criadoEm) {
        public static Evento de(EventoPedido e) { return new Evento(e.getId(),e.getAutorId(),e.getAcao(),e.getStatusAnterior(),e.getStatusNovo(),e.getRevisao(),e.getCriadoEm()); }
    }
    public record Detalhe(Resumo pedido, List<AvaliacaoResumo> avaliacoes, List<Evento> eventos, List<ContratoDto.Oferta> ofertas, UUID contratoId, boolean podeContratar, UUID agenteAtualId) {}
}
