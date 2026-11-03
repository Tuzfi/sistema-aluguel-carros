# Requisitos e regras

## Origem e interpretação

O PDF fornecido (páginas 1 a 3) define o domínio, a stack, a modelagem e a apresentação.
O README fornecido é uma referência de documentação: seus exemplos de mobile, cloud,
pagamentos, JWT e outros recursos não constituem requisitos deste laboratório.
A solicitação do usuário define o processo: projetar tudo, dividir em três commits, criar
em Documentos e parar após o primeiro para revisão, conforme confirmação no chat.

## Requisitos funcionais

| ID | Requisito | Origem | Entrega |
| --- | --- | --- | --- |
| RF01 | Cadastro prévio, login com usuário/senha e acesso autenticado | PDF p.1-2 | C2 + C3 |
| RF02 | CRUD de cliente: RG, CPF, nome, endereço e profissão | PDF p.1 e p.3 | C2 + C3 |
| RF03 | Registrar entidades empregadoras e rendimentos, máximo três | PDF p.1 | C2 + C3 |
| RF04 | Cliente cria, consulta, modifica e cancela seus pedidos | PDF p.1 | C2 + C3 |
| RF05 | Empresas e bancos modificam e avaliam pedidos | PDF p.1 | C2 + C3 |
| RF06 | Parecer financeiro positivo habilita execução de contrato | PDF p.1 | C2 + C3 |
| RF07 | Automóvel possui matrícula, ano, marca, modelo e placa | PDF p.2 | C2 + C3 |
| RF08 | Propriedade pode pertencer a cliente, empresa ou banco | PDF p.2 | C2 + C3 |
| RF09 | Aluguel pode ter crédito concedido por um banco agente | PDF p.2 | C2 + C3 |
| RF10 | Usuários criados conseguem visualizar status de pedido | PDF p.3 | C2 + C3 |

## Requisitos não funcionais e de entrega

| ID | Requisito | Verificação |
| --- | --- | --- |
| RNF01 | Java 25, Spring Boot 4.0.x, Maven | Manifest e build C2 |
| RNF02 | React + Vite | Manifest e build C3 |
| RNF03 | Supabase PostgreSQL | Configuração e integração C2/C3 |
| RNF04 | Arquitetura MVC e comunicação web | Pacotes, API e interface |
| RNF05 | Casos de uso, histórias, classes, pacotes e revisões de modelo | C1 e revisões C2/C3 |
| RNF06 | README adaptado ao template e apresentação modelo/código | C1 e conclusão C3 |
| RNF07 | Código e versões de modelos em GitHub | Preparar local; envio depende do destino |
| RNF08 | Autorização por objeto, senhas protegidas e segredos externos | Testes C2/C3; decisão técnica |
| RNF09 | Formulários utilizáveis por teclado e telas a partir de 360 px | Testes C3; decisão de qualidade |

## Decisões de domínio propostas

São escolhas para tornar o enunciado implementável; não são transcrições do PDF.

- **D01 - Identidade:** login por nome de usuário único normalizado. CPF normalizado e
  único para clientes; RG obrigatório, sem supor unicidade nacional isolada.
  Cadastro público cria somente CLIENTE. Agentes EMPRESA/BANCO são provisionados
  por comando operacional autenticado no ambiente, sem papel ADMIN na aplicação.
- **D02 - Escopo de acesso:** cliente vê apenas seu perfil, pedidos e contratos.
  Agentes ativos veem a fila de pedidos e seus dados financeiros para avaliação.
  Catálogo é visível a qualquer usuário autenticado. Dados financeiros não aparecem
  em listagens de catálogo e não serão registrados em logs.
- **D03 - Cliente:** de zero a três vínculos, cada um com empregador e renda mensal
  positiva em BRL, duas casas decimais. Zero vínculos é permitido; agente decide o parecer.
  O cliente gerencia apenas o próprio cadastro. Agente não tem CRUD geral de clientes.
- **D04 - Pedidos:** datas civis ISO, início inclusivo e fim exclusivo, pelo menos uma
  diária. Criação, alteração e contratação exigem início não passado, veículo ativo e
  disponível. Na contratação, revalidar início >= data atual e fim > início usando
  o fuso America/Sao_Paulo; datas vencidas exigem edição e novo parecer.
  Valor diário vem do veículo e é copiado ao pedido; total = diárias × diária.
- **D05 - Estados:** criação gera PENDENTE. Cliente pode editar/cancelar PENDENTE,
  APROVADO e REPROVADO; agente pode editar e avaliar PENDENTE, APROVADO e REPROVADO.
  Toda edição de veículo, período ou tipo contratual devolve a PENDENTE e invalida o
  parecer corrente; pareceres anteriores permanecem no histórico.
  CANCELADO e CONTRATADO são terminais neste protótipo.
- **D06 - Parecer:** APROVADO ou REPROVADO, justificativa obrigatória e autor/data.
  Cada avaliação aponta a revisão exata do pedido e um retrato dos dados financeiros
  considerados. Alteração posterior no cadastro não reescreve esse retrato.
  Agente pode reavaliar antes da contratação; novo parecer substitui o corrente.
  Reprovação invalida qualquer oferta de crédito ativa.
- **D07 - Contrato:** somente agente pode emitir contrato de pedido APROVADO com
  parecer válido para a revisão corrente, cliente ativo e período ainda válido.
  Revalidar essas condições dentro da transação. Um contrato por pedido; execução atômica
  muda estado a CONTRATADO. Valores, partes e veículo ficam registrados em um retrato
  imutável. Não há assinatura eletrônica nem execução financeira real.
- **D08 - Titularidade:** tipos LOCACAO_SIMPLES (mantém proprietário) e
  TRANSFERENCIA_AO_CLIENTE (proprietário passa ao cliente na emissão) explicitam a
  variação citada no PDF. A transferência é apenas registro acadêmico e exige ausência de outros contratos
  vigentes/futuros desse veículo, mesmo sem sobreposição, para preservar os compromissos do dono. Somente agente
  que seja proprietário do carro pode emitir contrato; antes disso, outros agentes
  podem avaliar. Não há sublocação nem troca de proprietário por edição do veículo.
- **D09 - Crédito:** banco pode criar oferta ligada ao pedido aprovado, com principal,
  taxa mensal e número de parcelas. Apenas o banco concedente altera sua oferta
  antes do contrato. Há no máximo uma oferta ativa por pedido; edição de pedido
  invalida a oferta. Emissão inclui opcionalmente essa oferta, congelando seus termos; se não for
  selecionada, a oferta ativa existente é invalidada.
  Principal positivo e não superior ao total, taxa entre 0 e 100% ao mês e parcelas
  inteiras positivas. Não calcular amortização, cobrança ou score neste protótipo.
- **D10 - Disponibilidade:** PENDENTE/APROVADO não reservam carro. Contratação bloqueia
  intervalos sobrepostos no mesmo veículo. Verificação transacional sob bloqueio da
  linha do veículo; duas requisições simultâneas não podem gerar dois contratos conflitantes.
- **D11 - Exclusão:** exclusão de cliente é lógica, revoga acesso e preserva histórico.
  Bloquear enquanto houver pedido ativo (PENDENTE/APROVADO) ou contrato com fim futuro.
  Cliente cancela pedidos elegíveis antes de encerrar a conta. CPF e usuário ficam reservados.
  Pedidos REPROVADOS preservados após a inativação ficam disponíveis somente para consulta:
  agentes não podem editar, reavaliar, oferecer crédito ou contratar para cliente inativo.
  Essas tentativas retornam 409. A inativação e as mutações dos pedidos bloqueiam a mesma
  linha de usuário do cliente para impedir que aprovação e encerramento ocorram em paralelo.
- **D12 - Frota:** agente cadastra carro com propriedade atribuída a si próprio.
  Somente proprietário agente edita/inativa sua frota. Não excluir carros referenciados.
  Inativação impede novos pedidos/contratos, sem apagar registros existentes; não pode
  ocorrer com contrato vigente/futuro. Cliente proprietário só consulta o veículo neste MVP.
- **D13 - Concorrência:** revisões numéricas em cliente, veículo, pedido e oferta;
  atualização com versão antiga responde 409. Contrato único e alterações de titularidade
  ocorrem na mesma transação. Valores monetários usam decimal, nunca ponto flutuante binário.

## Fora do escopo

Pagamento real, assinatura digital, recuperação de senha, notificações externas, aplicativos
mobile, upload de documentos, multas, devolução antecipada, extensão de contrato firmado,
cancelamento de contrato, cálculo de amortização, administração multiorganização e score automático.

## Itens para revisão

Validar especialmente D02 (fila acessível aos agentes), D08 (tipos e efeito da titularidade),
D09 (oferta de crédito), D11 (exclusão lógica) e as restrições de alteração de pedidos.
Não há bloqueio para concluir a modelagem; são premissas explícitas da proposta.
