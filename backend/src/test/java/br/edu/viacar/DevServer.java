package br.edu.viacar;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.math.BigDecimal;
import java.util.UUID;

public class DevServer {
    public static void main(String[] args) throws Exception {
        String senha = System.getenv("VIACAR_DEMO_PASSWORD");
        if (senha == null || senha.length() < 10) throw new IllegalArgumentException("Defina VIACAR_DEMO_PASSWORD com ao menos 10 caracteres.");
        System.setProperty("server.address", "127.0.0.1");
        System.out.println("Iniciando PostgreSQL temporário para demonstração local...");
        EmbeddedPostgres pg = EmbeddedPostgres.builder()
            .setDataDirectory("target/postgres-dev-" + UUID.randomUUID())
            .setCleanDataDirectory(true)
            .start();

        System.setProperty("DB_URL", pg.getJdbcUrl("postgres", "postgres"));
        System.setProperty("DB_USERNAME", "postgres");
        System.setProperty("DB_PASSWORD", "");
        System.setProperty("APP_COOKIE_SECURE", "false");
        System.setProperty("SERVER_PORT", System.getenv().getOrDefault("SERVER_PORT", "8080"));

        ConfigurableApplicationContext ctx = SpringApplication.run(ViacarApplication.class, args);

        try {
            var agentes = ctx.getBean(br.edu.viacar.auth.AgenteService.class);
            var veiculoRepo = ctx.getBean(br.edu.viacar.veiculo.VeiculoRepository.class);
            var usuarioRepo = ctx.getBean(br.edu.viacar.auth.UsuarioRepository.class);

            agentes.provisionar("empresa", senha, br.edu.viacar.auth.Papel.EMPRESA, "Locadora Demonstração", "12345678000199");
            agentes.provisionar("banco", senha, br.edu.viacar.auth.Papel.BANCO, "Banco Demonstração", "98765432000188");

            var userEmpresa = usuarioRepo.findByUsuario("empresa").orElseThrow();

            var v1 = new br.edu.viacar.veiculo.Veiculo();
            v1.setMatricula("V101");
            v1.setAno(2025);
            v1.setMarca("Fiat");
            v1.setModelo("Pulse Audace 1.0 Turbo");
            v1.setPlaca("VIA2026");
            v1.setDiaria(new BigDecimal("165.00"));
            v1.setProprietarioId(userEmpresa.getId());
            v1.setAtivo(true);
            v1.setVersao(0L);
            veiculoRepo.save(v1);

            var v2 = new br.edu.viacar.veiculo.Veiculo();
            v2.setMatricula("V102");
            v2.setAno(2026);
            v2.setMarca("Toyota");
            v2.setModelo("Corolla Cross XRE");
            v2.setPlaca("CAR2026");
            v2.setDiaria(new BigDecimal("240.00"));
            v2.setProprietarioId(userEmpresa.getId());
            v2.setAtivo(true);
            v2.setVersao(0L);
            veiculoRepo.save(v2);

            var v3 = new br.edu.viacar.veiculo.Veiculo();
            v3.setMatricula("V103");
            v3.setAno(2024);
            v3.setMarca("Hyundai");
            v3.setModelo("HB20 Comfort Plus");
            v3.setPlaca("ALU2026");
            v3.setDiaria(new BigDecimal("120.00"));
            v3.setProprietarioId(userEmpresa.getId());
            v3.setAtivo(true);
            v3.setVersao(0L);
            veiculoRepo.save(v3);

            System.out.println("==================================================================");
            System.out.println(">>> SERVIDOR VIACAR PRONTO: http://localhost:8080 <<<");
            System.out.println(">>> Agentes: empresa e banco; senha definida no ambiente. <<<");

            System.out.println("==================================================================");
        } catch (Exception e) {
            e.printStackTrace();
        }

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try { pg.close(); } catch (Exception ignored) {}
        }));
    }
}
