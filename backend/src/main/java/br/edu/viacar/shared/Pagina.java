package br.edu.viacar.shared;
import org.springframework.data.domain.*;
import java.util.List;
import java.util.function.Function;
public record Pagina<T>(List<T> items, int page, int size, long totalElements, int totalPages) {
    public static Pageable pedido(int page, int size, String campo) {
        if (page < 0 || size < 1 || size > 100) throw RegraException.invalido("Paginação inválida; size deve estar entre 1 e 100.");
        return PageRequest.of(page, size, Sort.by(campo).descending().and(Sort.by("id")));
    }
    public static <E,T> Pagina<T> de(Page<E> page, Function<E,T> mapper) {
        return new Pagina<>(page.getContent().stream().map(mapper).toList(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }
}
