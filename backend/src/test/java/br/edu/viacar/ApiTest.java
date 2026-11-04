package br.edu.viacar;

import br.edu.viacar.auth.*;
import br.edu.viacar.pedido.*;
import br.edu.viacar.contrato.*;
import br.edu.viacar.cliente.*;
import br.edu.viacar.veiculo.*;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.*;
import java.net.*;
import java.net.http.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties={"server.servlet.session.cookie.secure=false","app.login-limit=1000"})
@Import(ApiTest.RelogioConfig.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ApiTest {
    static final EmbeddedPostgres PG;
    static {
        try {
            PG=EmbeddedPostgres.builder().setDataDirectory("target/postgres-"+UUID.randomUUID()).setCleanDataDirectory(true).start();
        } catch(Exception e) { throw new ExceptionInInitializerError(e); }
    }
    @DynamicPropertySource static void banco(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url",() -> PG.getJdbcUrl("postgres","postgres"));
        r.add("spring.datasource.username",() -> "postgres"); r.add("spring.datasource.password",() -> "");
    }
    static class Relogio extends Clock {
        private volatile Instant agora=Instant.parse("2026-12-01T12:00:00Z");
        public ZoneId getZone() { return ZoneId.of("America/Sao_Paulo"); }
        public Clock withZone(ZoneId zone) { return Clock.fixed(agora,zone); }
        public Instant instant() { return agora; }
    }
    @TestConfiguration static class RelogioConfig { @Bean @Primary Relogio relogio() { return new Relogio(); } }
    @Autowired Relogio relogio;
    @Autowired ObjectMapper json;
    @Autowired AgenteService agentes;
    @Autowired JdbcTemplate jdbc;
    @Autowired UsuarioRepository usuarios;
    @Autowired ClienteRepository clientes;
    @Autowired AvaliacaoRepository avaliacoes;
    @LocalServerPort int port;
    private final AtomicInteger numeros=new AtomicInteger(100);
    private Sessao empresa, banco, outraEmpresa, outroBanco;
    private static final String SENHA="SenhaFicticia123!";

    @BeforeAll void preparar() {
        agentes.provisionar("empresa",SENHA,Papel.EMPRESA,"Empresa Teste","10000000000100");
        agentes.provisionar("banco",SENHA,Papel.BANCO,"Banco Teste","20000000000100");
        agentes.provisionar("outraempresa",SENHA,Papel.EMPRESA,"Outra Empresa","30000000000100");
        agentes.provisionar("outrobanco",SENHA,Papel.BANCO,"Outro Banco","40000000000100");
        empresa=entrar("empresa"); banco=entrar("banco"); outraEmpresa=entrar("outraempresa"); outroBanco=entrar("outrobanco");
    }
    @BeforeEach void resetClock() { relogio.agora=Instant.parse("2026-12-01T12:00:00Z"); }
    @AfterAll void fechar() throws Exception { PG.close(); }

    class Sessao {
        final HttpClient http=HttpClient.newBuilder().cookieHandler(new CookieManager(null,CookiePolicy.ACCEPT_ALL)).build();
        String csrf;
        Sessao() { renovarCsrf(); }
        void renovarCsrf() { csrf=call("GET","/api/auth/csrf",null,false).body.path("token").asText(); }
        Resposta call(String method,String path,Object body) { return call(method,path,body,true); }
        Resposta call(String method,String path,Object body,boolean token) {
            try {
                var builder=HttpRequest.newBuilder(URI.create("http://localhost:"+port+path)).timeout(Duration.ofSeconds(30));
                if(token && csrf!=null) builder.header("X-CSRF-TOKEN",csrf);
                if(body!=null) builder.header("Content-Type","application/json");
                builder.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));
                var res=http.send(builder.build(),HttpResponse.BodyHandlers.ofString());
                return new Resposta(res.statusCode(),res.body().isBlank()?json.createObjectNode():json.readTree(res.body()),res);
            } catch(Exception e) { throw new AssertionError(e); }
        }
    }
    record Resposta(int status,JsonNode body,HttpResponse<String> raw) {
        JsonNode ok(int esperado) { assertThat(status).withFailMessage("HTTP %s, esperado %s: %s",status,esperado,body).isEqualTo(esperado); return body; }
    }
    Sessao entrar(String usuario) {
        var s=new Sessao(); s.call("POST","/api/auth/login",Map.of("usuario",usuario,"senha",SENHA)).ok(200); s.renovarCsrf(); return s;
    }
    Map<String,Object> cadastro(String login,String cpf,List<?> empregos) {
        return new LinkedHashMap<>(Map.of("usuario",login,"senha",SENHA,"nome","Cliente de Teste","cpf",cpf,"rg","MG123456","endereco","Rua de Teste 100","profissao","Engenheiro","empregos",empregos));
    }
    String cpf() {
        String base=String.format("%09d",numeros.incrementAndGet()+123456000);
        for(int n=9;n<=10;n++) {
            int soma=0; for(int i=0;i<n;i++) soma+=(base.charAt(i)-'0')*(n+1-i);
            int d=11-soma%11; base+=(d>=10?0:d);
        }
        return base;
    }
    Sessao cliente() {
        String login="cliente"+numeros.incrementAndGet(); var anon=new Sessao();
        anon.call("POST","/api/auth/cadastro",cadastro(login,cpf(),List.of())).ok(201); return entrar(login);
    }
    JsonNode carro() {
        int n=numeros.incrementAndGet();
        return empresa.call("POST","/api/veiculos",Map.of("matricula","V"+n,"ano",2026,"marca","Fiat","modelo","Argo","placa","ABC"+String.format("%04d",n),"diaria","150.00")).ok(201);
    }
    Map<String,Object> dadosPedido(String carro,String inicio,String fim,String tipo) {
        return new LinkedHashMap<>(Map.of("veiculoId",carro,"inicio",inicio,"fim",fim,"tipoContrato",tipo));
    }
    JsonNode pedido(Sessao c,JsonNode v) { return pedido(c,v,"2026-12-10","2026-12-13","LOCACAO_SIMPLES"); }
    JsonNode pedido(Sessao c,JsonNode v,String inicio,String fim,String tipo) {
        return c.call("POST","/api/pedidos",dadosPedido(v.path("id").asText(),inicio,fim,tipo)).ok(201);
    }
    JsonNode avaliar(JsonNode p,String decisao) {
        return banco.call("POST","/api/pedidos/"+p.path("id").asText()+"/avaliacoes",Map.of("versao",p.path("versao").asLong(),"decisao",decisao,"justificativa","Análise financeira de teste.")).ok(201);
    }
    Resposta emitir(JsonNode p) { return empresa.call("POST","/api/pedidos/"+p.path("id").asText()+"/contrato",Map.of("versaoPedido",p.path("versao").asLong())); }
    JsonNode oferta(JsonNode p) {
        return banco.call("POST","/api/pedidos/"+p.path("id").asText()+"/ofertas-credito",Map.of("versaoPedido",p.path("versao").asLong(),"principal","300.00","taxaMensal","1.5","parcelas",3)).ok(201);
    }

    @Test void migracaoRodaEmPostgresEOpenapiExigeLogin() {
        assertThat(jdbc.queryForObject("select version()",String.class)).contains("PostgreSQL");
        assertThat(jdbc.queryForObject("select count(*) from viacar.flyway_schema_history where success",Integer.class)).isGreaterThanOrEqualTo(2);
        new Sessao().call("GET","/api/openapi",null).ok(401);
        var spec=empresa.call("GET","/api/openapi",null).ok(200);
        assertThat(spec.path("paths").has("/api/pedidos/{id}/contrato")).isTrue();
    }
    @Test void loginCsrfLogoutEHashNaoVazam() {
        Sessao anon=new Sessao(); anon.call("GET","/api/veiculos",null).ok(401);
        anon.call("POST","/api/auth/login",Map.of("usuario","empresa","senha",SENHA),false).ok(403);
        anon.call("POST","/api/auth/login",Map.of("usuario","empresa","senha","senhaerrada")).ok(401);
        var s=cliente(); String me=s.call("GET","/api/auth/me",null).ok(200).toString();
        assertThat(me).doesNotContain("senha","hash");
        s.call("POST","/api/auth/logout",null).ok(204); s.call("GET","/api/auth/me",null).ok(401);
    }
    @Test void cadastroRecusaPapelDuplicidadeECpfInvalido() {
        var s=new Sessao(); var d=cadastro("cadastro"+numeros.incrementAndGet(),cpf(),List.of());
        d.put("papel","BANCO"); s.call("POST","/api/auth/cadastro",d).ok(400); d.remove("papel");
        s.call("POST","/api/auth/cadastro",d).ok(201); s.call("POST","/api/auth/cadastro",d).ok(409);
        d.put("usuario","outro"+numeros.incrementAndGet()); d.put("cpf","11111111111"); s.call("POST","/api/auth/cadastro",d).ok(400);
    }
    @Test void perfilPermiteTresEmpregosRejeitaQuatroEConflito() {
        Sessao c=cliente(); var perfil=c.call("GET","/api/clientes/me",null).ok(200);
        Map<String,Object> dados=new LinkedHashMap<>();
        for(String k:List.of("nome","cpf","rg","endereco","profissao")) dados.put(k,perfil.path(k).asText());
        var emprego=Map.of("empregador","Empresa Teste","rendaMensal","1000.00");
        dados.put("empregos",List.of(emprego,emprego,emprego,emprego)); dados.put("versao",perfil.path("versao").asLong());
        c.call("PUT","/api/clientes/me",dados).ok(400);
        dados.put("empregos",List.of(emprego,emprego,emprego));
        JsonNode atualizado=c.call("PUT","/api/clientes/me",dados).ok(200);
        assertThat(atualizado.path("empregos").size()).isEqualTo(3);
        assertThat(atualizado.path("versao").asLong()).isGreaterThan(perfil.path("versao").asLong());
        c.call("PUT","/api/clientes/me",dados).ok(409);
        dados.put("versao",atualizado.path("versao").asLong()); dados.put("empregos",List.of());
        assertThat(c.call("PUT","/api/clientes/me",dados).ok(200).path("empregos").size()).isZero();
    }
    @Test void clienteNaoConsultaNemModificaPedidoAlheio() {
        Sessao a=cliente(),b=cliente(); JsonNode p=pedido(a,carro()); String path="/api/pedidos/"+p.path("id").asText();
        b.call("GET",path,null).ok(404); b.call("POST",path+"/cancelamento",Map.of("versao",0)).ok(404);
        assertThat(b.call("GET","/api/pedidos",null).ok(200).path("totalElements").asInt()).isZero();
        a.call("POST",path+"/avaliacoes",Map.of("versao",0,"decisao","APROVADO","justificativa","teste")).ok(403);
        a.call("GET",path+"/dados-financeiros",null).ok(403);
    }
    @Test void pedidoCalculaPrecoNoServidorEValidaPeriodo() {
        Sessao c=cliente(); JsonNode v=carro(); JsonNode p=pedido(c,v);
        assertThat(p.path("total").asText()).isEqualTo("450.00");
        var d=dadosPedido(v.path("id").asText(),"2026-12-10","2026-12-13","LOCACAO_SIMPLES");
        d.put("total","0.01"); c.call("POST","/api/pedidos",d).ok(400); d.remove("total");
        d.put("inicio","2026-11-30"); c.call("POST","/api/pedidos",d).ok(409);
        d.put("inicio","2026-12-13"); c.call("POST","/api/pedidos",d).ok(409);
    }
    @Test void edicaoInvalidaParecerCreditoEPreservaHistorico() {
        Sessao c=cliente(); JsonNode v=carro(); JsonNode p=avaliar(pedido(c,v),"APROVADO"); oferta(p);
        var d=dadosPedido(v.path("id").asText(),"2026-12-14","2026-12-17","LOCACAO_SIMPLES"); d.put("versao",p.path("versao").asLong());
        JsonNode editado=c.call("PUT","/api/pedidos/"+p.path("id").asText(),d).ok(200);
        assertThat(editado.path("status").asText()).isEqualTo("PENDENTE"); emitir(editado).ok(409);
        JsonNode detalhe=c.call("GET","/api/pedidos/"+p.path("id").asText(),null).ok(200);
        assertThat(detalhe.path("avaliacoes").size()).isEqualTo(1);
        assertThat(detalhe.path("ofertas").get(0).path("status").asText()).isEqualTo("INVALIDADA");
        assertThat(detalhe.path("eventos").size()).isEqualTo(3);
    }
    @Test void reavaliacaoMesmoStatusConsomeVersao() {
        JsonNode p=avaliar(pedido(cliente(),carro()),"APROVADO");
        JsonNode novo=avaliar(p,"APROVADO"); assertThat(novo.path("versao").asLong()).isGreaterThan(p.path("versao").asLong());
        emitir(p).ok(409); emitir(novo).ok(201);
    }
    @Test void contratoOpcionalComCreditoCongelaTermos() {
        Sessao c=cliente(); JsonNode p=avaliar(pedido(c,carro()),"APROVADO"); JsonNode o=oferta(p);
        JsonNode contrato=empresa.call("POST","/api/pedidos/"+p.path("id").asText()+"/contrato",Map.of("versaoPedido",p.path("versao").asLong(),"ofertaCreditoId",o.path("id").asText())).ok(201);
        assertThat(contrato.path("termos").path("credito").path("status").asText()).isEqualTo("CONTRATADA");
        assertThat(contrato.path("termos").path("total").asText()).isEqualTo("450.00");
        c.call("GET","/api/contratos/"+contrato.path("id").asText(),null).ok(200);
        cliente().call("GET","/api/contratos/"+contrato.path("id").asText(),null).ok(404);
        emitir(p).ok(409);
        c.call("POST","/api/pedidos/"+p.path("id").asText()+"/cancelamento",Map.of("versao",p.path("versao").asLong())).ok(409);
    }
    @Test void creditoRecusaEmpresaOutroBancoEPrincipalExcessivo() {
        JsonNode p=avaliar(pedido(cliente(),carro()),"APROVADO"); String path="/api/pedidos/"+p.path("id").asText()+"/ofertas-credito";
        var d=new LinkedHashMap<String,Object>(Map.of("versaoPedido",p.path("versao").asLong(),"principal","999.00","taxaMensal","1.5","parcelas",3));
        empresa.call("POST",path,d).ok(403); banco.call("POST",path,d).ok(400); d.put("principal","300.00");
        JsonNode o=banco.call("POST",path,d).ok(201); d.put("versao",o.path("versao").asLong());
        outroBanco.call("PUT","/api/ofertas-credito/"+o.path("id").asText(),d).ok(403);
        banco.call("POST",path,d).ok(409);
    }
    @Test void exclusaoDeClienteReprovadoBloqueiaMutacoesDoAgente() {
        Sessao c=cliente(); JsonNode p=avaliar(pedido(c,carro()),"REPROVADO");
        long versao=c.call("GET","/api/clientes/me",null).ok(200).path("versao").asLong();
        c.call("DELETE","/api/clientes/me?versao="+versao,null).ok(204);
        c.call("GET","/api/auth/me",null).ok(401);
        banco.call("POST","/api/pedidos/"+p.path("id").asText()+"/avaliacoes",Map.of("versao",p.path("versao").asLong(),"decisao","APROVADO","justificativa","Novo parecer")).ok(409);
        emitir(p).ok(409);
    }
    @Test void pedidoAtivoImpedeExclusaoECancelamentoLibera() {
        Sessao c=cliente(); JsonNode p=pedido(c,carro());
        c.call("DELETE","/api/clientes/me?versao=0",null).ok(409);
        c.call("POST","/api/pedidos/"+p.path("id").asText()+"/cancelamento",Map.of("versao",0)).ok(200);
        emitir(p).ok(409); c.call("DELETE","/api/clientes/me?versao=0",null).ok(204);
    }
    @Test void contratacaoRevalidaDataEmSaoPaulo() {
        JsonNode p=avaliar(pedido(cliente(),carro(),"2026-12-10","2026-12-13","LOCACAO_SIMPLES"),"APROVADO");
        relogio.agora=Instant.parse("2026-12-11T03:00:00Z"); emitir(p).ok(409);
        relogio.agora=Instant.parse("2026-12-11T02:59:59Z"); emitir(p).ok(201);
    }
    @Test void transferenciaBloqueiaContratoFuturoSemSobreposicao() {
        JsonNode v=carro(); JsonNode futuro=avaliar(pedido(cliente(),v,"2026-12-20","2026-12-22","LOCACAO_SIMPLES"),"APROVADO"); emitir(futuro).ok(201);
        JsonNode transferencia=avaliar(pedido(cliente(),v,"2026-12-10","2026-12-12","TRANSFERENCIA_AO_CLIENTE"),"APROVADO"); emitir(transferencia).ok(409);
        JsonNode simples=avaliar(pedido(cliente(),v,"2026-12-10","2026-12-12","LOCACAO_SIMPLES"),"APROVADO"); emitir(simples).ok(201);
    }
    @Test void transferenciaSemCompromissosMudaDono() {
        Sessao c=cliente(); JsonNode p=avaliar(pedido(c,carro(),"2026-12-10","2026-12-12","TRANSFERENCIA_AO_CLIENTE"),"APROVADO");
        JsonNode contrato=emitir(p).ok(201);
        assertThat(contrato.path("proprietarioFinalId").asText()).isEqualTo(c.call("GET","/api/auth/me",null).ok(200).path("id").asText());
        assertThat(contrato.path("proprietarioAnteriorId").asText()).isNotEqualTo(contrato.path("proprietarioFinalId").asText());
    }
    @Test void somenteProprietarioEmiteContrato() {
        JsonNode p=avaliar(pedido(cliente(),carro()),"APROVADO");
        outraEmpresa.call("POST","/api/pedidos/"+p.path("id").asText()+"/contrato",Map.of("versaoPedido",p.path("versao").asLong())).ok(403);
        emitir(p).ok(201);
    }
    @Test void inativacaoDeVeiculoRespeitaDonoEContrato() {
        JsonNode v=carro(); outraEmpresa.call("POST","/api/veiculos/"+v.path("id").asText()+"/inativacao",Map.of("versao",0)).ok(403);
        JsonNode p=avaliar(pedido(cliente(),v),"APROVADO"); emitir(p).ok(201);
        empresa.call("POST","/api/veiculos/"+v.path("id").asText()+"/inativacao",Map.of("versao",0)).ok(409);
    }
    @Test void doisContratosConcorrentesNaoReservamMesmoCarro() throws Exception {
        JsonNode v=carro(); JsonNode a=avaliar(pedido(cliente(),v),"APROVADO"),b=avaliar(pedido(cliente(),v),"APROVADO");
        try(var pool=Executors.newVirtualThreadPerTaskExecutor()) {
            var inicio=new CountDownLatch(1);
            var fa=pool.submit(() -> { inicio.await(); return emitir(a).status; });
            var fb=pool.submit(() -> { inicio.await(); return emitir(b).status; }); inicio.countDown();
            assertThat(List.of(fa.get(30,TimeUnit.SECONDS),fb.get(30,TimeUnit.SECONDS))).containsExactlyInAnyOrder(201,409);
        }
        assertThat(jdbc.queryForObject("select count(*) from viacar.contrato c join viacar.pedido p on p.id=c.pedido_id where p.veiculo_id=?",Integer.class,UUID.fromString(v.path("id").asText()))).isEqualTo(1);
    }
    @Test void devolucaoExclusivaPermiteProximoContratoNoMesmoDia() {
        JsonNode v=carro(); emitir(avaliar(pedido(cliente(),v),"APROVADO")).ok(201);
        emitir(avaliar(pedido(cliente(),v,"2026-12-13","2026-12-15","LOCACAO_SIMPLES"),"APROVADO")).ok(201);
    }
}
