package br.edu.viacar.shared;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.*;
import org.springframework.dao.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class ErrosController {
    private static final Logger log = LoggerFactory.getLogger(ErrosController.class);
    @ExceptionHandler(RegraException.class)
    ResponseEntity<ErroApi> regra(RegraException e, HttpServletRequest req) {
        return ResponseEntity.status(e.getStatus()).body(ErroApi.de(e.getCodigo(), e.getMessage(), Map.of(), req));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErroApi> campos(MethodArgumentNotValidException e, HttpServletRequest req) {
        Map<String,String> campos = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(erro -> campos.putIfAbsent(erro.getField(), erro.getDefaultMessage()));
        return ResponseEntity.badRequest().body(ErroApi.de("DADOS_INVALIDOS", "Confira os campos informados.", campos, req));
    }
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class, MissingServletRequestParameterException.class})
    ResponseEntity<ErroApi> entrada(Exception e, HttpServletRequest req) {
        return ResponseEntity.badRequest().body(ErroApi.de("DADOS_INVALIDOS", "Requisição inválida ou campo desconhecido.", Map.of(), req));
    }
    @ExceptionHandler({DataIntegrityViolationException.class, OptimisticLockingFailureException.class, PessimisticLockingFailureException.class})
    ResponseEntity<ErroApi> conflito(Exception e, HttpServletRequest req) {
        return ResponseEntity.status(409).body(ErroApi.de("CONFLITO", "Dados duplicados ou alterados por outra operação.", Map.of(), req));
    }
    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ErroApi> proibido(AccessDeniedException e, HttpServletRequest req) {
        return ResponseEntity.status(403).body(ErroApi.de("ACESSO_NEGADO", "Acesso não permitido.", Map.of(), req));
    }
    @ExceptionHandler(Exception.class)
    ResponseEntity<ErroApi> inesperado(Exception e, HttpServletRequest req) {
        ErroApi erro = ErroApi.de("ERRO_INTERNO", "Não foi possível concluir a operação.", Map.of(), req);
        log.error("Falha {} na requisição {}", e.getClass().getSimpleName(), erro.correlacaoId());
        return ResponseEntity.internalServerError().body(erro);
    }
}
