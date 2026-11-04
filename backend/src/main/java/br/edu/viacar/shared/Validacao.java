package br.edu.viacar.shared;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Locale;

public final class Validacao {
    private Validacao() {}
    public static String usuario(String valor) {
        if (valor == null || !valor.matches("[a-zA-Z0-9._-]{3,50}")) throw RegraException.invalido("Usuário deve ter de 3 a 50 letras, números, pontos, hífens ou sublinhados.");
        return valor.toLowerCase(Locale.ROOT);
    }
    public static void senha(String valor) {
        int tamanho = valor == null ? 0 : valor.getBytes(StandardCharsets.UTF_8).length;
        if (tamanho < 10 || tamanho > 72) throw RegraException.invalido("Senha deve ter de 10 a 72 bytes UTF-8.");
    }
    public static String cpf(String valor) {
        if (valor == null || !valor.matches("[0-9. -]+")) throw RegraException.invalido("CPF inválido.");
        String cpf = valor.replaceAll("[. -]", "");
        if (!cpf.matches("[0-9]{11}") || cpf.chars().distinct().count() == 1) throw RegraException.invalido("CPF inválido.");
        for (int n = 9; n <= 10; n++) {
            int soma = 0;
            for (int i = 0; i < n; i++) soma += (cpf.charAt(i) - '0') * (n + 1 - i);
            int digito = 11 - soma % 11;
            if (digito >= 10) digito = 0;
            if (digito != cpf.charAt(n) - '0') throw RegraException.invalido("CPF inválido.");
        }
        return cpf;
    }
    public static void versao(long atual, Long recebida) {
        if (recebida == null) throw RegraException.invalido("Informe a versão do recurso.");
        if (atual != recebida) throw RegraException.conflito("O recurso foi alterado. Atualize os dados.");
    }
    public static void periodo(LocalDate inicio, LocalDate fim, LocalDate hoje) {
        if (inicio == null || fim == null || inicio.isBefore(hoje) || !fim.isAfter(inicio)) throw RegraException.conflito("Informe um período futuro válido, com ao menos uma diária.");
    }
    public static BigDecimal dinheiro(BigDecimal valor) {
        if (valor == null || valor.signum() <= 0 || valor.scale() > 2 || valor.compareTo(new BigDecimal("9999999999.99")) > 0) throw RegraException.invalido("Valor monetário inválido.");
        return valor.setScale(2);
    }
}
