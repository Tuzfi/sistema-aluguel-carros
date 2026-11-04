package br.edu.viacar;
import br.edu.viacar.shared.*;
import br.edu.viacar.auth.LimiteLogin;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.*;
import static org.assertj.core.api.Assertions.*;

class ValidacaoTest {
    @Test void normalizaCpfSemAceitarDigitosIncorretos() {
        assertThat(Validacao.cpf("111.444.777-35")).isEqualTo("11144477735");
        for(String cpf: new String[]{"11111111111","11144477734","abc11144477735","123"})
            assertThatThrownBy(() -> Validacao.cpf(cpf)).isInstanceOf(RegraException.class);
    }
    @Test void senhaUsaBytesSemTruncarUnicode() {
        Validacao.senha("a".repeat(72));
        assertThatThrownBy(() -> Validacao.senha("á".repeat(37))).isInstanceOf(RegraException.class);
        assertThatThrownBy(() -> Validacao.senha("curta")).isInstanceOf(RegraException.class);
    }
    @Test void dinheiroRejeitaArredondamentoSilencioso() {
        assertThat(Validacao.dinheiro(new BigDecimal("150"))).isEqualByComparingTo("150.00");
        for(String v:new String[]{"0","-1","1.001","10000000000.00"})
            assertThatThrownBy(() -> Validacao.dinheiro(new BigDecimal(v))).isInstanceOf(RegraException.class);
    }
    @Test void periodoPermiteHojeMasExigeDevolucaoPosterior() {
        var hoje=LocalDate.of(2026,12,10); Validacao.periodo(hoje,hoje.plusDays(1),hoje);
        assertThatThrownBy(() -> Validacao.periodo(hoje,hoje,hoje)).isInstanceOf(RegraException.class);
        assertThatThrownBy(() -> Validacao.periodo(hoje.minusDays(1),hoje.plusDays(1),hoje)).isInstanceOf(RegraException.class);
    }
    @Test void limitaLoginPorOrigemEUsuario() {
        var limite=new LimiteLogin(Clock.fixed(Instant.EPOCH,ZoneOffset.UTC),2);
        limite.verificar("local","teste"); limite.verificar("local","TESTE");
        assertThatThrownBy(() -> limite.verificar("local","teste")).isInstanceOf(RegraException.class);
        limite.verificar("outra","teste");
    }
}
