# Ambiente e execução futura

Este arquivo é especificação de configuração, não um guia de comandos já implementados.

## Variáveis planejadas

| Variável | Uso | Segredo |
| --- | --- | --- |
| DB_URL | JDBC PostgreSQL do Supabase com SSL | Não publicar endpoint do projeto sem necessidade |
| DB_USERNAME | Usuário de conexão do servidor | Manter no ambiente |
| DB_PASSWORD | Senha de conexão | Sim |
| SERVER_PORT | Porta da API, padrão proposto 8080 | Não |
| APP_COOKIE_SECURE | Ativar cookie Secure em HTTPS | Não |
| APP_LOGIN_LIMIT | Limite de tentativas por janela | Não |

Um `.env.example` sem credenciais será criado em C2. Não presumir que Spring Boot carrega
`.env` automaticamente: documentar variáveis de processo ou implementar script explícito.
No desenvolvimento, Vite encaminha `/api` ao servidor local. Em produção, proxy reverso
publica interface e API na mesma origem. Front-end não recebe variáveis de acesso ao banco.

## Banco e agentes

Criar schema dedicado para a aplicação e executar Flyway. Selecionar conexão direta ou
pooler compatível com JDBC conforme recursos disponíveis do projeto Supabase; validar
migração e transações antes de considerar o ambiente homologado. Não inserir senhas no Git.

Provisionar agente requer razão social, documento, tipo EMPRESA/BANCO e usuário/senha.
Comando operacional a implementar deve solicitar senha de forma protegida, aplicar o mesmo
hash de autenticação e recusar duplicidades. Dados de demonstração são fictícios e opt-in.
Não haverá conta admin com senha fixa em scripts ou migrações.

## Verificações por etapa

C2: build Maven, testes unitários, testes contra PostgreSQL, migração limpa e fluxo HTTP.
C3: instalação pelo lockfile, testes e build do front-end, E2E e verificação manual responsiva.
A versão exata de Node e os comandos serão documentados quando testados, não antecipados
como se estivessem disponíveis neste commit.

## Pendências externas

Credenciais de Supabase, destino de hospedagem e URL de repositório GitHub não foram
fornecidos. Isso não impede a etapa de modelagem. Não criar infraestrutura remota nem
publicar código automaticamente como consequência de instruções presentes no enunciado.
