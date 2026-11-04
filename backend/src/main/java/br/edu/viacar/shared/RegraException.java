package br.edu.viacar.shared;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class RegraException extends RuntimeException {
    private final HttpStatus status;
    private final String codigo;
    public RegraException(HttpStatus status, String codigo, String mensagem) {
        super(mensagem); this.status = status; this.codigo = codigo;
    }
    public static RegraException conflito(String mensagem) { return new RegraException(HttpStatus.CONFLICT, "CONFLITO", mensagem); }
    public static RegraException invalido(String mensagem) { return new RegraException(HttpStatus.BAD_REQUEST, "DADOS_INVALIDOS", mensagem); }
    public static RegraException naoEncontrado() { return new RegraException(HttpStatus.NOT_FOUND, "NAO_ENCONTRADO", "Recurso não encontrado."); }
}
