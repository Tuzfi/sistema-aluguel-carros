# Ambiente

O [README](../README.md#instalação-e-execução) contém os comandos reproduzíveis.

| Variável | Uso |
| --- | --- |
| DB_URL | JDBC PostgreSQL, com `sslmode=require` para Supabase |
| DB_USERNAME / DB_PASSWORD | Credenciais do servidor, nunca do front-end |
| DB_POOL_SIZE | Máximo de conexões JDBC, padrão 3; respeitar o limite do pooler |
| SERVER_PORT | Porta da API, padrão 8080 |
| APP_COOKIE_SECURE | true por padrão; perfil local permite HTTP |
| APP_LOGIN_LIMIT | Tentativas por origem/usuário em janela de 15 minutos; padrão 10 |
| VIACAR_DEMO_PASSWORD | Senha dos agentes fictícios no servidor temporário de demonstração |
| VIACAR_API_PROXY | Destino de `/api` no Vite de desenvolvimento; padrão localhost:8080 |

A aplicação carrega `backend/.env` quando iniciada pela raiz, ou `.env` quando iniciada
pela pasta backend. Use o formato CHAVE=valor, sem aspas. Variáveis do processo têm prioridade.
O perfil `local` fornece valores padrão para o PostgreSQL do Docker Compose.
Se o `.env` contiver credenciais do Supabase, elas têm precedência sobre esses padrões;
para usar o Compose, defina DB_URL, DB_USERNAME e DB_PASSWORD locais no terminal. Sem esse
perfil, informe DB_URL, DB_USERNAME e DB_PASSWORD.

Supabase: schema `viacar`, migrações Flyway e `ddl-auto=validate`. Não expor o schema na
Data API; a aplicação autoriza as operações pelo Spring Security. Usar conexão direta ou Session pooler na porta 5432, com SSL.
Copie host e usuário do painel Connect do Supabase. Conexão remota validada em 04/11/2026: migrações V1 e V2, leitura, escrita com rollback, login dos agentes e cadastro de veículos.

Produção: API e interface na mesma origem HTTPS, proxy para `/api`, fallback de SPA e
APP_COOKIE_SECURE=true. Não usar servidor de desenvolvimento como hospedagem de produção.

O provisionador de agentes é interativo, solicita senha oculta e não disponibiliza rota
pública para criação de EMPRESA/BANCO. O servidor de demonstração pertence ao classpath
de teste, usa dados fictícios, escuta apenas loopback e não integra o JAR de produção.
