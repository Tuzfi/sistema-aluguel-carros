package br.edu.viacar.auth;
import br.edu.viacar.ViacarApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import java.util.Arrays;

public final class ProvisionarAgente {
    private ProvisionarAgente() {}
    public static void main(String[] args) {
        var console=System.console();
        if(console==null) throw new IllegalStateException("Execute em um terminal interativo para proteger a senha.");
        String login=console.readLine("Usuário: ");
        Papel papel=Papel.valueOf(console.readLine("Papel (EMPRESA/BANCO): ").strip().toUpperCase(java.util.Locale.ROOT));
        String razao=console.readLine("Razão social: ");
        String documento=console.readLine("Documento (somente dígitos): ");
        char[] senha=console.readPassword("Senha: ");
        try {
            var app=new SpringApplication(ViacarApplication.class);
            app.setWebApplicationType(WebApplicationType.NONE);
            try(var context=app.run(args)) {
                var agente=context.getBean(AgenteService.class).provisionar(login,new String(senha),papel,razao,documento);
                console.printf("Agente criado: %s%n",agente.getId());
            }
        } finally { Arrays.fill(senha,'\0'); }
    }
}
