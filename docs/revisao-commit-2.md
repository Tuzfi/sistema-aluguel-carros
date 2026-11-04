# Revisão do commit 2

## O que revisar

1. Back-end implementado em Java 25 e Spring Boot 4.0.9 com Maven Wrapper em `backend/`.
2. Persistência relacional PostgreSQL com Flyway (`V1__dominio.sql` e `V2__parecer_atual.sql`).
3. Segurança e sessão:
   - Autenticação baseada em sessão com cookies HTTP (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`).
   - Proteção CSRF obrigatória para mutações (`/api/auth/csrf` e cabeçalho `X-CSRF-TOKEN`).
   - Hash seguro de senhas com BCrypt (`SenhaConfig`).
   - Rate limit contra ataques de força bruta no login (`LimiteLogin`).
   - Isolamento estrito entre perfis: clientes não acessam dados de terceiros nem dados financeiros de outros usuários.
4. Módulos de domínio:
   - **Clientes:** cadastro público exclusivo para `CLIENTE`, até 3 vínculos de emprego/renda e exclusão lógica com integridade referencial.
   - **Veículos:** catálogo público para usuários autenticados; criação, edição e inativação restritas aos agentes proprietários.
   - **Pedidos:** criação, cálculo de diárias no servidor, cancelamento pelo cliente, alteração com devolução a `PENDENTE` e controle de concorrência por versão.
   - **Avaliações:** parecer financeiro (APROVADO/REPROVADO) por agentes `EMPRESA` e `BANCO` com justificativa e snapshot imutável da situação financeira avaliada.
   - **Crédito:** oferta opcional concedida exclusivamente por agentes `BANCO`, com congelamento de termos na emissão do contrato.
   - **Contratos:** emissão atômica pelo agente proprietário do veículo, validação temporal em horário de Brasília (`America/Sao_Paulo`), bloqueio contra sobreposição de datas e suporte às modalidades `LOCACAO_SIMPLES` e `TRANSFERENCIA_AO_CLIENTE`.
5. Provisionamento operacional:
   - CLI `br.edu.viacar.auth.ProvisionarAgente` para cadastrar agentes `EMPRESA` e `BANCO` de forma administrativa, mantendo o cadastro público fechado a papéis privilegiados.
6. Especificação OpenAPI disponível em `/api/openapi` (protegida para usuários autenticados).

## Estado da entrega

- A API de back-end está 100% funcional, empacotada no JAR executável (`viacar-0.2.0.jar`) e testada.
- O front-end React com Vite e TypeScript será desenvolvido na Etapa 3 conforme o plano.
- Testado e validado localmente com PostgreSQL embarcado (isolado, sem requisições externas).
- Configuração para banco Supabase remoto preparada via variáveis de ambiente (`backend/.env.example` e `application.properties`); aguardará credenciais reais do projeto no momento oportuno de publicação.

## Verificação e testes automatizados

Verificações executadas em 03/11/2026 com JDK 25 e Maven 3.9.11:

- **Compilação e build:** `.\mvnw.cmd package -DskipTests` gerou com sucesso `target/viacar-0.2.0.jar`.
- **Suíte de testes completa:** `.\mvnw.cmd test` executou **24 testes**, com **0 falhas** e **0 erros** (tempo: 01:25 min):
  - `ValidacaoTest` (5 testes unitários): validação estrita de CPF com dígitos verificadores, tamanho de senhas em bytes, precisão monetária decimal sem truncamento, consistência de datas e limitação de login por IP/usuário.
  - `ApiTest` (19 testes de integração ponta a ponta com PostgreSQL real):
    1. `migracaoRodaEmPostgresEOpenapiExigeLogin`: aplicação de migrações Flyway e segurança do OpenAPI.
    2. `loginCsrfLogoutEHashNaoVazam`: autenticação, proteção CSRF e garantia de não vazamento de hashes de senhas.
    3. `cadastroRecusaPapelDuplicidadeECpfInvalido`: rejeição de elevação de privilégio, unicidade e CPF inválido.
    4. `perfilPermiteTresEmpregosRejeitaQuatroEConflito`: teto de 3 vínculos empregatícios e concorrência otimista.
    5. `clienteNaoConsultaNemModificaPedidoAlheio`: isolamento multi-tenant e proteção de dados financeiros.
    6. `pedidoCalculaPrecoNoServidorEValidaPeriodo`: cálculo imutável de diárias e datas inválidas/passadas.
    7. `edicaoInvalidaParecerCreditoEPreservaHistorico`: devolução a `PENDENTE`, invalidação de ofertas e retenção de eventos.
    8. `reavaliacaoMesmoStatusConsomeVersao`: versionamento estrito na reanálise financeira.
    9. `contratoOpcionalComCreditoCongelaTermos`: contratação atômica, congelamento de termos de crédito e imunidade a cancelamento.
    10. `creditoRecusaEmpresaOutroBancoEPrincipalExcessivo`: permissões bancárias e teto do valor financiado.
    11. `exclusaoDeClienteReprovadoBloqueiaMutacoesDoAgente`: bloqueio de pedidos de clientes inativados.
    12. `pedidoAtivoImpedeExclusaoECancelamentoLibera`: impedimento de encerramento de conta com pedidos abertos.
    13. `contratacaoRevalidaDataEmSaoPaulo`: validação temporal estrita no fuso de São Paulo.
    14. `transferenciaBloqueiaContratoFuturoSemSobreposicao`: salvaguarda de contratos futuros ao mudar titularidade.
    15. `transferenciaSemCompromissosMudaDono`: mutação efetiva de titularidade do veículo para o cliente.
    16. `somenteProprietarioEmiteContrato`: garantia de que apenas o proprietário do automóvel pode firmar a locação.
    17. `inativacaoDeVeiculoRespeitaDonoEContrato`: proteção contra inativação indevida ou com contratos vigentes.
    18. `doisContratosConcorrentesNaoReservamMesmoCarro`: teste com threads concorrentes comprovando que duas requisições simultâneas não conseguem reservar o mesmo veículo no mesmo período.
    19. `devolucaoExclusivaPermiteProximoContratoNoMesmoDia`: consistência do fim exclusivo permitindo locação consecutiva no mesmo dia.
