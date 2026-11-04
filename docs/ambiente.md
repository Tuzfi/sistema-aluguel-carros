# Ambiente

O [README](../README.md#instalação-e-execução) contém os comandos reproduzíveis.

| Variável | Uso |
| --- | --- |
| DB_URL | JDBC PostgreSQL, com `sslmode=require` para Supabase |
| DB_USERNAME / DB_PASSWORD | Credenciais do servidor, nunca do front-end |
| SERVER_PORT | Porta da API, padrão 8080 |
| APP_COOKIE_SECURE | true por padrão; perfil local permite HTTP |
| APP_LOGIN_LIMIT | Tentativas por origem/usuário em janela de 15 minutos; padrão 10 |
| VIACAR_DEMO_PASSWORD | Senha dos agentes fictícios no servidor temporário de demonstração |
| VIACAR_API_PROXY | Destino de `/api` no Vite de desenvolvimento; padrão localhost:8080 |

Spring não carrega `.env` automaticamente. Exporte as variáveis no terminal antes de iniciar.
O perfil `local` fornece defaults exclusivos do PostgreSQL do Docker Compose. Sem esse
perfil, informe DB_URL, DB_USERNAME e DB_PASSWORD.

Supabase: schema `viacar`, migrações Flyway e `ddl-auto=validate`. Não expor o schema na
Data API; a aplicação autoriza as operações pelo Spring Security. Selecionar conexão
compatível com sessões JDBC e transações. A homologação remota depende das credenciais
do responsável e não foi realizada nesta entrega.

Produção: API e interface na mesma origem HTTPS, proxy para `/api`, fallback de SPA e
APP_COOKIE_SECURE=true. Não usar servidor de desenvolvimento como hospedagem de produção.

O provisionador de agentes é interativo, solicita senha oculta e não disponibiliza rota
pública para criação de EMPRESA/BANCO. O servidor de demonstração pertence ao classpath
de teste, usa dados fictícios, escuta apenas loopback e não integra o JAR de produção.
