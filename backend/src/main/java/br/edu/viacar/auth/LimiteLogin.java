package br.edu.viacar.auth;
import br.edu.viacar.shared.RegraException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Component
public class LimiteLogin {
    private record Janela(Instant inicio, int tentativas) {}
    private final Map<String,Janela> janelas = new LinkedHashMap<>();
    private final Clock clock;
    private final int limite;
    public LimiteLogin(Clock clock, @Value("${app.login-limit}") int limite) {
        if (limite < 1) throw new IllegalArgumentException("app.login-limit deve ser positivo");
        this.clock = clock; this.limite = limite;
    }
    public synchronized void verificar(String origem, String usuario) {
        Instant agora = clock.instant();
        janelas.entrySet().removeIf(e -> e.getValue().inicio().plus(Duration.ofMinutes(15)).isBefore(agora));
        String chave = origem + ":" + usuario.toLowerCase(Locale.ROOT);
        Janela janela = janelas.getOrDefault(chave, new Janela(agora, 0));
        if (janela.tentativas() >= limite) throw new RegraException(HttpStatus.TOO_MANY_REQUESTS, "LIMITE_LOGIN", "Aguarde 15 minutos antes de tentar novamente.");
        if (janelas.size() >= 10000 && !janelas.containsKey(chave)) janelas.remove(janelas.keySet().iterator().next());
        janelas.put(chave, new Janela(janela.inicio(), janela.tentativas() + 1));
    }
}
