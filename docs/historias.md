# Histórias do usuário e critérios de aceite

Cada cenário será implementado em C2 (regra/API) e C3 (interface), salvo a modelagem de C1.

| ID | Como usuário, quero... | Critérios de aceite |
| --- | --- | --- |
| HU01 | Como visitante, cadastrar-me como cliente | Dados obrigatórios válidos criam usuário CLIENTE e perfil na mesma transação; usuário/CPF duplicados geram 409; papel enviado pelo visitante não concede acesso de agente; mais de três empregos gera 400 |
| HU02 | Como usuário, entrar e sair do sistema | Credenciais válidas criam sessão; inválidas retornam erro genérico; sem sessão a API protegida responde 401; logout revoga sessão; login não expõe hash de senha |
| HU03 | Como cliente, consultar e editar meu perfil | Leitura retorna somente meus dados; editar atualiza campos válidos; quarto vínculo ou renda negativa é rejeitado; versão antiga gera 409; outro cliente não acessa meus dados |
| HU04 | Como cliente, encerrar meu cadastro | Com pedidos ativos ou contrato vigente/futuro, retorna 409; sem impedimentos inativa conta e encerra sessão; login posterior falha; histórico é preservado |
| HU05 | Como usuário autenticado, consultar carros | Lista paginada e filtros de marca/modelo/período; exibe matrícula, ano, marca, modelo, placa e diária; não retorna dados pessoais do proprietário; período inválido é rejeitado |
| HU06 | Como cliente, solicitar aluguel | Carro ativo, disponível e datas válidas geram PENDENTE com diária e total calculados no servidor; pedido vinculado à sessão, nunca ao clienteId arbitrário; total enviado pelo navegador não prevalece |
| HU07 | Como cliente, acompanhar meu pedido | Listagem mostra somente meus pedidos; detalhe contém status, revisão, pareceres pertinentes, valores, período e contrato quando existir; pedido alheio retorna 404 |
| HU08 | Como cliente ou agente, alterar um pedido | Em estado elegível, alteração valida disponibilidade, incrementa revisão, recalcula total e devolve PENDENTE; invalida parecer/oferta corrente; CONTRATADO/CANCELADO gera 409; histórico identifica autor |
| HU09 | Como cliente, cancelar um pedido | Pedido próprio elegível muda para CANCELADO; oferta ativa é invalidada; cancelado não é contratado; contrato existente impede cancelamento |
| HU10 | Como agente, avaliar financeiramente | Consulta dados necessários e histórico; decisão exige justificativa e versão atual; registra retrato financeiro e autor; parecer positivo gera APROVADO; negativo gera REPROVADO; cliente recebe 403 |
| HU11 | Como agente proprietário, executar um contrato | Pedido APROVADO com parecer corrente e carro ativo gera um contrato; congela dados, vincula crédito opcional e muda para CONTRATADO; duas contratações conflitantes resultam em um sucesso e um 409 |
| HU12 | Como banco, oferecer crédito | Somente BANCO cria oferta; principal/taxa/parcelas válidos; oferta referencia banco da sessão; outro banco não a modifica; edição do pedido invalida oferta; contrato impede nova edição |
| HU13 | Como agente, manter minha frota | Cadastrar fixa proprietário na sessão; matrícula/placa únicas; apenas dono edita/inativa; contrato vigente/futuro impede inativação; transferência contratual atualiza proprietário sem apagar histórico |
| HU14 | Como equipe, demonstrar coerência do projeto | Cada requisito aponta modelos, operações e cenários de teste; mudanças produzem nova versão UML e notas; README distingue o que foi testado do que depende de Supabase ou publicação |

## Jornadas de apresentação

1. Cliente cadastra perfil com dois empregos, entra, consulta carro e cria pedido.
2. Empresa consulta fila e reprova com justificativa; cliente consulta o status.
3. Cliente modifica período; pedido volta a PENDENTE. Banco aprova e oferece crédito.
4. Empresa proprietária emite contrato com crédito; cliente visualiza termos e banco concedente.
5. Outro pedido no mesmo intervalo falha ao contratar; pedido sem contrato pode ser cancelado.
6. Novo pedido de transferência, para período livre, altera proprietário ao contratar.
7. Mostrar tentativas proibidas: acesso de outro cliente, quarto vínculo e avaliação por cliente.

Usar exclusivamente dados fictícios na demonstração e nos testes.
