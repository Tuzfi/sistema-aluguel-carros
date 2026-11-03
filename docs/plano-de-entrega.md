# Plano de entrega em três commits

Data do planejamento: 03/11/2026. Projeto: ViaCar.

## Sequência e pontos de revisão

Cada etapa termina com um commit local e uma revisão do solicitante. Não iniciar a etapa
seguinte antes da aprovação. Alterações solicitadas na revisão serão incorporadas à etapa
correspondente; não alterar commits já aprovados sem combinar a estratégia de histórico.

### Commit 1 - `docs: planeja sistema e modelagem UML do ViaCar`

- [x] Interpretar o PDF e adaptar o template de README.
- [x] Definir requisitos, escopo, decisões e regras de negócio.
- [x] Descrever histórias com critérios de aceite verificáveis.
- [x] Projetar arquitetura MVC, autorização, persistência e ambiente.
- [x] Definir entidades, relacionamentos, restrições e transições de pedido.
- [x] Projetar API, telas e plano de testes.
- [x] Produzir casos de uso, classes, pacotes, estados e sequência em UML.
- [x] Registrar a versão inicial dos modelos e preparar checklist de revisão.

Saída: documentação completa, diagramas editáveis e imagens, README e repositório local.
Aceite: requisitos rastreáveis; ausência de funcionalidades alegadas como prontas; diagramas
gerados sem erro; links internos válidos; decisões abertas visíveis. **Parar para revisão.**

### Commit 2 - `feat: implementa API de clientes pedidos e contratos`

1. Gerar Spring Boot 4.0.x com JDK 25, Maven Wrapper e dependências fixadas.
2. Configurar conexão PostgreSQL/Supabase via variáveis, perfis local/teste e Flyway.
3. Implementar entidades, repositórios, DTOs e validações conforme o modelo.
4. Implementar cadastro público de cliente, login/logout, sessão, CSRF e papéis.
5. Implementar o CRUD do próprio cliente com até três empregos/rendas.
6. Implementar consulta de frota, criação/edição/inativação da frota de agentes.
7. Implementar pedidos, histórico, filtros, propriedade e concorrência.
8. Implementar análise financeira, geração de contratos e crédito opcional por banco.
9. Criar comando operacional para provisionar agentes, sem cadastro público de papéis elevados.
10. Cobrir regras críticas e permissões com testes; validar migração em PostgreSQL.
11. Atualizar API, modelo v2 se necessário e README com execução comprovada.

Saída: API executável, persistência, testes e instruções reais de ambiente.
Aceite: autenticação obrigatória; isolamento de clientes; validação de renda; transições
corretas; contratos sem sobreposição; testes com PostgreSQL; segredos fora do Git.
Conexão real ao Supabase depende de credenciais do responsável; se indisponíveis, registrar
essa limitação e testar contra PostgreSQL local, sem declarar validação remota. **Parar para revisão.**

### Commit 3 - `feat: entrega interface integrada e validacao dos fluxos`

1. Criar React + Vite + TypeScript, lockfile e roteamento.
2. Implementar cadastro, login, sessão, navegação por perfil e logout.
3. Implementar perfil do cliente, até três vínculos, edição e encerramento de conta.
4. Implementar catálogo, período, criação/edição/cancelamento e detalhes de pedido.
5. Implementar fila de análise, parecer, frota, contratos e crédito por banco.
6. Integrar API com cookies/CSRF, erros por campo e prevenção de envio duplicado.
7. Implementar acessibilidade básica, responsividade e estados de interface.
8. Executar testes unitários, integração e E2E das jornadas e permissões.
9. Atualizar diagramas v2/v3 conforme diferenças reais, README e capturas da aplicação.
10. Preparar roteiro de apresentação comparando modelo inicial e implementação final.

Saída: aplicação integrada e documentação reproduzível.
Aceite: jornadas cliente/empresa/banco comprovadas, builds aprovados, modelo alinhado,
ausência de segredos e revisão final. GitHub/deploy dependem do destino e autorização.
**Parar para revisão final; não publicar automaticamente.**

## Dependências e limites

- O laboratório fornece a stack; exemplos do template não ampliam o escopo.
- Dados reais, serviços de pagamento, score externo, assinatura digital, recuperação de
  senha por e-mail e publicação não fazem parte deste protótipo.
- A avaliação financeira é uma decisão manual do agente; não haverá aprovação automática
  baseada em uma regra de renda inventada.
- Titularidade e crédito serão registros internos do protótipo, sem operações bancárias reais.
- Nome comercial ViaCar e regras adicionais descritas em requisitos são propostas revisáveis.
