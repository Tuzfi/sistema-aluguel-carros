# Revisão da entrega — 04/11/2026

Revisão do protótipo acadêmico conforme o enunciado do Laboratório 02.

| Requisito | Implementação e verificação |
| --- | --- |
| Java 25, Spring Boot 4, Maven, React e Vite | pom.xml, package.json; Maven verify e build do frontend |
| Supabase PostgreSQL | JDBC com SSL, schema viacar, migrações V1 e V2 aplicadas no projeto remoto |
| Login obrigatório | Sessão no servidor, CSRF, hash BCrypt e autorização por papel; testes de API e navegador |
| CRUD de cliente | Cadastro, consulta, edição e exclusão lógica do próprio perfil; testes de API e navegador |
| Identificação e até três rendas | DTOs e validações de serviço; teste aceita três vínculos e rejeita quatro |
| Criar, consultar, alterar e cancelar pedidos | PedidoController e PedidoService; testes de API e duas jornadas de navegador |
| Avaliação por empresas e bancos | Parecer com justificativa e histórico; revisão do código e testes |
| Contrato após aprovação | Validação do parecer corrente, disponibilidade e proprietário; testes de contratação |
| Crédito opcional de banco | Oferta vinculada ao pedido e ao banco concedente; jornada de contrato com crédito |
| Matrícula, ano, marca, modelo e placa | VeiculoDto, entidade e formulário de frota; três carros cadastrados pela API no Supabase |
| Propriedade de cliente, empresa ou banco | Proprietário referencia Usuario; transferência ao cliente testada na API |
| MVC e dois subsistemas | API Spring e interface React; diagrama de pacotes e módulos correspondentes |
| Modelagem e evolução | Casos de uso, histórias, classes, pacotes, estados e sequência; versões iniciais preservadas |

## Verificações executadas

- Maven verify: 24 testes aprovados, JAR gerado.
- Vitest: 7 testes aprovados.
- Build TypeScript/Vite: concluído.
- Playwright: 2 jornadas aprovadas, incluindo cliente, banco, empresa, contrato com crédito,
  edição de perfil, cancelamento e encerramento de conta; capturas atualizadas.
- Supabase: migrações, leitura, escrita com rollback, login dos agentes, cadastro e consulta da frota.
- Revisão das regras de autorização, transações, versões e correspondência com os modelos.
- Credenciais locais excluídas do versionamento pelo .gitignore.

## Correções desta revisão

Instruções de início da interface e cadastro da frota, documentação do Supabase,
limite configurável de conexões JDBC, datas iniciais calculadas uma vez no formulário
sem conversão indevida para UTC, remoção de indicação fictícia de proprietário e
sequência UML v3 com endpoint e assinatura reais. Comentários redundantes removidos.

## Limites conhecidos

O lint conclui sem erros, mas mantém avisos de hooks e organização do contexto React.
As jornadas completas usam PostgreSQL isolado; não foi executada toda a suíte no banco remoto.
As listagens da interface têm limites de página (catálogo 20, pedidos 50, frota 100),
sem controles para navegar nas páginas seguintes; a API oferece paginação.
Não há deploy público, pagamento, assinatura digital ou transferência jurídica de veículos.
As contas de demonstração configuradas pelo responsável não definem a política do cadastro público.
Os relatórios revisao-commit-1/2/3 preservam o estado histórico de suas etapas.

Aprovado para o protótipo acadêmico nos fluxos verificados, com os limites acima registrados.
A revisão não equivale a certificação de produção nem substitui a avaliação do docente.
