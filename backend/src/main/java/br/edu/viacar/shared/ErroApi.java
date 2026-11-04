package br.edu.viacar.shared;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.UUID;

public record ErroApi(String codigo, String mensagem, Map<String,String> campos, String correlacaoId) {
    public static ErroApi de(String codigo, String mensagem, Map<String,String> campos, HttpServletRequest request) {
        Object id = request.getAttribute("correlacaoId");
        return new ErroApi(codigo, mensagem, campos, id == null ? UUID.randomUUID().toString() : id.toString());
    }
}
