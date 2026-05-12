<img width="8192" height="7772" alt="Desenvolvimento de software-2026-05-12-120501" src="https://github.com/user-attachments/assets/109e0e17-0692-4cc5-85b7-58ed9acbf741" />
<h1>Gestão de Prevenção e Acompanhamento de doenças crónicas</h1>

Projeto desenvolvido no âmbito da disciplina de Desenvolvimento de Software da Licenciatura em Saúde Digital e Inovação Biomédica - FMUP.

Implementação de uma API REST seguindo o padrão MVC (Model-View-Controller) com Node.js, Express e TypeScript, utilizando armazenamento local em memória.
# Projeto-Desenvolvimento-de-Software


<h2>Estrutura do Projeto</h2>
<br><br>


<h2>Pré-requisitos</h2>

Node.js (verificar com node -v)<br>
npm (verificar com npm -v)<br>

<h2>Instalação</h2>
# Clonar o repositório<br>
git clone https://github.com/afonsosilvaemoura/Projeto-Desenvolvimento-de-Software.git<br>
cd !!!!!

# Instalar dependências
npm install

<h2>Como Correr</h2><br>
<h3>Modo de desenvolvimento (com auto-reload)</h3>
npx nodemon src/app.ts<br>
O servidor arranca em http://localhost:3000<br>


<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>

Diagrama de Sequências
<br>1 - Gestão de autenticação e perfis
<br>Autenticação Utilizador

<img width="1389" height="1372" alt="ds_autenticacao" src="https://github.com/user-attachments/assets/f56f8b0f-35b1-40d0-be34-7e3fe6e222e7" />

<br><br><br><br><br>


2 - Gestão de utentes
<br>Criar utentes, Consultar utentes e dados

<img width="1354" height="2201" alt="ds_consultar_utentes" src="https://github.com/user-attachments/assets/20f2d35e-b034-49af-a009-4c2d9116e097" />

<br><br><br><br><br>

Atualizar e remover informação sobre utente

<img width="1327" height="1436" alt="ds_atualizar_remover" src="https://github.com/user-attachments/assets/556f33d7-904e-4864-a3cb-e1247e3fee94" />

<br><br><br><br><br>



3 - Gestão de Médicos
<br>Criação, gestão e atualização de dados do médico

<img width="1408" height="2035" alt="ds_gestaomedico" src="https://github.com/user-attachments/assets/99a151ca-2f01-45bc-a55e-af6a275d41d4" />


<br><br><br><br><br>


Inativação do médico

<img width="1477" height="1376" alt="ds_inativamedico" src="https://github.com/user-attachments/assets/61f86faa-0796-47c4-9460-427acfa9ffb0" />

<br><br><br><br><br>

4 - Consultar dashboard do Utente

<img width="1708" height="1348" alt="ds_dashboard" src="https://github.com/user-attachments/assets/69352a16-7395-4043-929a-b36e3e87f92e" />



<br><br><br><br><br>


5 - Módulo CARAT
<br>Responder CARAT
<img width="1761" height="1673" alt="ds_carat" src="https://github.com/user-attachments/assets/f867d6c9-8669-49f6-ad06-a720c2b9a898" />

<br><br><br><br><br>


Consultar histórico CARAT
<img width="1478" height="1405" alt="ds_historico" src="https://github.com/user-attachments/assets/7536aead-1e0f-4f1c-8ec7-c9913660bf2e" />

<br><br><br><br><br>


6 - Sistema de Alertas
<br>Definição do limiar 

<img width="1546" height="1135" alt="ds_limiar" src="https://github.com/user-attachments/assets/d4ea1cae-b9db-4173-bcdf-76292bc23a36" />


<br><br><br><br><br>

Consultar e gerir alertas clínicos

<img width="1555" height="2075" alt="ds_alertas" src="https://github.com/user-attachments/assets/c44fb83a-c0c6-43d7-9d20-b4b85f1ebe35" />

<br><br><br><br><br>


7 - Consulta Médica
<br>Consulta de lista de utentes e dados associados

<img width="1532" height="1385" alt="ds_consulta" src="https://github.com/user-attachments/assets/7927a07b-1367-4de0-b80d-59e7ea82123c" />

<br><br><br><br><br>


Prescrição de Medicação

<img width="1527" height="1608" alt="ds_prescricao" src="https://github.com/user-attachments/assets/d996d2bc-d821-47c6-854e-1cba676bdc11" />

<br><br><br><br><br>


8 - Gestão de Medicação
<br>Consulta e gestão da medicação

<img width="1316" height="2155" alt="ds_medicacao" src="https://github.com/user-attachments/assets/ae178573-5f7b-4f2a-9ae2-69afdaffc238" />

<br><br><br><br><br>
<br><br><br><br><br>


<img width="8192" height="7772" alt="Desenvolvimento de software-2026-05-12-120501" src="https://github.com/user-attachments/assets/ce4d2b47-ed44-46ef-b8c7-4fd78f4f70fa" />

O Diagrama de Classes representa a vista lógica estática do sistema, fundamentada no paradigma de programação orientada a objetos (POO). O núcleo clínico do modelo gravita em torno da classe AvaliacaoCARAT, que processa a submissão de questionários e detém a lógica de cálculo de scores. O sistema apresenta uma elevada coesão através da interligação desta classe com as entidades de Alerta e Prescricao (que agrega Medicacao e Exame). De forma a mitigar ambiguidades e garantir a tipagem forte do domínio, o modelo faz um uso extensivo de enumerações (e.g., EstadoAlertaEnum, PrioridadeEnum, NivelControloEnum), restringindo os estados a domínios de valores clinicamente válidos. Importa ainda salientar a presença das classes Auditoria e TokenSessao, que atestam a conformidade com os requisitos não funcionais de segurança e rastreabilidade (accountability), essenciais no tratamento de dados sensíveis de saúde.


<img width="5878" height="8192" alt="modelo_ER" src="https://github.com/user-attachments/assets/88911ee0-9dff-4e0b-89ac-d60386059521" />
O Modelo Entidade-Relacionamento materializa a vista física dos dados, traduzindo o modelo de classes para um esquema de base de dados relacional normalizado. Este diagrama define de forma estrita as tabelas, os tipos de dados e os mecanismos de integridade referencial, suportados por chaves primárias (PK) e estrangeiras (FK).
Observam-se relações inequívocas de um-para-muitos (1:N) entre a tabela UTENTE e os seus registos clínicos (AVALIACAO_CARAT, SINTOMA, PRESCRICAO), garantindo que a informação médica é rastreável e não sofre sobreposições. A complexidade do ciclo de vida dos alertas é assegurada pela tabela ALERTA_ACAO, que atua como um registo de log imutável, mapeando o histórico de transições de estado e as notas clínicas associadas. Adicionalmente, a tabela de AUDITORIA centraliza o registo de todas as transações, cumprindo as diretrizes de rastreabilidade do Regulamento Geral sobre a Proteção de Dados (RGPD).


