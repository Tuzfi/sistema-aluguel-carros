# ViaCar | Sistema de Aluguel de Carros

<img src="docs/assets/logo.svg" alt="ViaCar" width="240">

Projeto acadêmico do Laboratório 02 de Desenvolvimento e Integração de Aplicações Web.
A proposta é reunir clientes, empresas e bancos em um fluxo de pedidos de aluguel,
análise financeira e contratos pela Internet.

## Status

**Etapa 2 de 3: API, persistência e regras de negócio implementadas para revisão.** O back-end
está implementado em Java 25 / Spring Boot 4.0.9 e coberto por 24 testes automatizados com
PostgreSQL. A interface gráfica (React + Vite + TypeScript) será construída na etapa 3 após aprovação desta etapa.

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades implementadas](#funcionalidades-implementadas)
- [Tecnologias](#tecnologias)
- [Arquitetura e modelos](#arquitetura-e-modelos)
- [Instalação e execução](#instalação-e-execução)
- [Estrutura](#estrutura)
- [Demonstração e testes](#demonstração-e-testes)
- [Autores e referências](#autores-e-referências)

## Sobre o projeto

Clientes cadastrados podem solicitar um automóvel, consultar o andamento, modificar ou
cancelar pedidos elegíveis. Agentes avaliam pedidos financeiramente e preparam contratos.
O sistema registra os dados pessoais e até três vínculos de emprego/renda por cliente,
os automóveis, seus proprietários e o crédito opcional concedido por um banco agente.

## Funcionalidades implementadas

- **Autenticação e Sessão:** cadastro público de clientes, login, logout, cookies de sessão, CSRF e rate limiting.
- **Clientes:** gestão do perfil próprio com até três fontes de rendimento e exclusão lógica.
- **Frota:** catálogo para autenticados; cadastro, edição e inativação restritos aos proprietários.
- **Pedidos:** criação, cálculo de diárias no servidor, cancelamento, controle de versão e eventos.
- **Avaliação Financeira:** parecer por agentes (EMPRESA e BANCO) com justificativa e histórico preservado.
- **Crédito:** proposta de financiamento opcional formulada por BANCO vinculada ao pedido.
- **Contratos:** emissão atômica com validação de datas (horário de Brasília), bloqueio de sobreposição de reservas e suporte a locação simples e transferência de propriedade.
- **Operação:** provisionamento administrativo de agentes via CLI (`ProvisionarAgente`).

## Tecnologias

| Camada | Tecnologia planejada | Motivo |
| --- | --- | --- |
| Back-end | Java JDK 25 e Spring Boot 4.0.x | Exigência do enunciado |
| Build | Apache Maven com Wrapper | Exigência; execução reproduzível |
| Web/API | Spring MVC, Validation e Security | MVC, validação e autenticação |
| Persistência | Spring Data JPA, Flyway | Persistência e migrações versionadas |
| Banco | Supabase PostgreSQL | Exigência do enunciado |
| Front-end | React, TypeScript e Vite | React + Vite exigidos; tipagem escolhida |
| Testes | JUnit, Spring Test, PostgreSQL de teste; Vitest e Playwright | Regras, integração e jornadas |
| Modelagem | PlantUML, fontes e SVG versionados | UML revisável e imagens locais |

As versões exatas de bibliotecas serão fixadas nos manifests e lockfiles das etapas de
implementação. O uso de TypeScript, Flyway e das ferramentas de teste é uma decisão de projeto.

## Arquitetura e modelos

Monólito modular MVC com API JSON e interface React. O navegador conversa apenas com a API;
o back-end concentra autorização e regras de negócio e acessa o PostgreSQL.

- [Requisitos e decisões](docs/requisitos.md)
- [Histórias e critérios de aceite](docs/historias.md)
- [Arquitetura](docs/arquitetura.md)
- [Modelo de dados](docs/modelo-de-dados.md)
- [Contrato da API](docs/api.md)
- [Fluxos de telas](docs/interface.md)
- [Modelos UML e versões](docs/uml/README.md)
- [Plano de testes e rastreabilidade](docs/testes.md)
- [Checklist de revisão do commit 1](docs/revisao-commit-1.md)
- [Checklist de revisão do commit 2](docs/revisao-commit-2.md)

![Visão lógica](docs/uml/v1/pacotes.svg)

## Instalação e execução

### Pré-requisitos
- Java Development Kit (JDK) 25 instalado
- Git instalado

### Execução dos testes automatizados
Dentro da pasta `backend/`:
```bash
# Windows (PowerShell / CMD)
.\mvnw.cmd test

# Linux / macOS
./mvnw test
```
*O teste de integração inicializa um PostgreSQL embarcado em runtime para validação local completa sem depender de Docker ou serviços externos.*

### Construção do pacote (JAR)
```bash
.\mvnw.cmd package -DskipTests
```
O artefato executável é gerado em `backend/target/viacar-0.2.0.jar`.

### Execução da aplicação
Configure as variáveis em `backend/.env` (use `backend/.env.example` como base) e execute:
```bash
.\mvnw.cmd spring-boot:run
```
A API estará acessível em `http://localhost:8080` e a especificação OpenAPI protegida em `http://localhost:8080/api/openapi`.

### Provisionamento operacional de agentes
Para cadastrar agentes empresariais ou bancários:
```bash
java -cp target/viacar-0.2.0.jar br.edu.viacar.auth.ProvisionarAgente <usuario> <senha> <EMPRESA|BANCO> <nome> <cnpj>
```

### Deploy

Não há ambiente publicado nem repositório remoto público configurado. A entrega da Etapa 2 é local e validada. A publicação acadêmica e configuração de instâncias do Supabase serão executadas quando houver credenciais e autorização.

## Estrutura

```text
README.md
CONTRIBUTING.md
backend/
  pom.xml
  mvnw / mvnw.cmd
  src/main/java/br/edu/viacar/   (auth, cliente, veiculo, pedido, contrato, shared)
  src/main/resources/db/migration/ (Flyway V1, V2)
  src/test/java/br/edu/viacar/   (ApiTest, ValidacaoTest)
docs/
  requisitos.md
  historias.md
  arquitetura.md
  modelo-de-dados.md
  api.md
  interface.md
  ambiente.md
  testes.md
  revisao-commit-1.md
  revisao-commit-2.md
  assets/logo.svg
  uml/
```

`frontend/` será criado no commit 3.

## Demonstração e testes

Nesta etapa, o back-end foi validado com **24 testes automatizados** cobrindo:
1. Validações de CPF, regras de senhas, precisão de decimais e horário.
2. Migrações Flyway e schemas em PostgreSQL.
3. Fluxo de sessão, CSRF e isolamento de dados de clientes.
4. Regras de negócios de pedidos, cálculo de diárias e concorrência na locação.
5. Emissão de contratos atômica com bloqueio de concorrência via virtual threads.

Consulte o [checklist de revisão do commit 2](docs/revisao-commit-2.md) para os detalhes de validação.

## Autores e referências

Os dados dos integrantes da equipe acadêmica serão informados pelo responsável antes da entrega.
Projeto desenvolvido como parte das atividades práticas da disciplina.

- Enunciado fornecido: DIAW, Laboratório 02, Sistema de Aluguel de Carros, 3 páginas.
- Modelo de README fornecido, atribuído ao Prof. Dr. João Paulo Carneiro Aramuni;
  seções adaptadas ao escopo e ao estágio real do projeto.
- [Referência de uso do PlantUML](https://plantuml.com/starting), utilizada para gerar os diagramas.

## Contribuição

Consulte [CONTRIBUTING.md](CONTRIBUTING.md). Alterações no modelo e no código devem manter
os requisitos e diagramas alinhados. A revisão ocorre ao final de cada um dos três commits.

## Licença

Licença de distribuição a definir pelo responsável. O exemplo MIT do template não foi
adotado automaticamente. Os materiais acadêmicos de referência mantêm sua autoria original.
