package br.edu.viacar.shared;
import jakarta.validation.constraints.*;
public record VersaoDto(@NotNull @PositiveOrZero Long versao) {}
