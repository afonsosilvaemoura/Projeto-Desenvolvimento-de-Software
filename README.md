# Projeto-Desenvolvimento-de-Software

Diagrama de Sequências
1 - Gestão de autenticação e perfis
<img width="1389" height="1372" alt="ds_autenticacao" src="https://github.com/user-attachments/assets/f56f8b0f-35b1-40d0-be34-7e3fe6e222e7" />
Autenticação Utilizador

2 - Gestão de utentes
Criar utentes, Consultar utentes e dados e Atualizar informação sobre utente
<img width="1354" height="2201" alt="ds_consultar_utentes" src="https://github.com/user-attachments/assets/20f2d35e-b034-49af-a009-4c2d9116e097" />







<img width="8192" height="7745" alt="DiagramadeClasses" src="https://github.com/user-attachments/assets/76056f40-1915-4ff0-892b-96f1092aca64" />
O Diagrama de Classes representa a vista lógica estática do sistema, fundamentada no paradigma de programação orientada a objetos (POO). O núcleo clínico do modelo gravita em torno da classe AvaliacaoCARAT, que processa a submissão de questionários e detém a lógica de cálculo de scores. O sistema apresenta uma elevada coesão através da interligação desta classe com as entidades de Alerta e Prescricao (que agrega Medicacao e Exame). De forma a mitigar ambiguidades e garantir a tipagem forte do domínio, o modelo faz um uso extensivo de enumerações (e.g., EstadoAlertaEnum, PrioridadeEnum, NivelControloEnum), restringindo os estados a domínios de valores clinicamente válidos. Importa ainda salientar a presença das classes Auditoria e TokenSessao, que atestam a conformidade com os requisitos não funcionais de segurança e rastreabilidade (accountability), essenciais no tratamento de dados sensíveis de saúde.


<img width="5878" height="8192" alt="modelo_ER" src="https://github.com/user-attachments/assets/88911ee0-9dff-4e0b-89ac-d60386059521" />
O Modelo Entidade-Relacionamento (ER) materializa a vista física dos dados, traduzindo o modelo de classes para um esquema de base de dados relacional normalizado. Este diagrama define de forma estrita as tabelas, os tipos de dados e os mecanismos de integridade referencial, suportados por chaves primárias (PK) e estrangeiras (FK).
Observam-se relações inequívocas de um-para-muitos (1:N) entre a tabela UTENTE e os seus registos clínicos (AVALIACAO_CARAT, SINTOMA, PRESCRICAO), garantindo que a informação médica é rastreável e não sofre sobreposições. A complexidade do ciclo de vida dos alertas é assegurada pela tabela ALERTA_ACAO, que atua como um registo de log imutável, mapeando o histórico de transições de estado e as notas clínicas associadas. Adicionalmente, a tabela de AUDITORIA centraliza o registo de todas as transações, cumprindo as diretrizes de rastreabilidade do Regulamento Geral sobre a Proteção de Dados (RGPD).


