export interface CreateCaratDto {
  perg1: 'Nas últimas 4 semanas, quantas vezes teve o nariz entupido?';
  perg2: 'Nas últimas 4 semanas, quantas vezes teve espirros?',
  perg3: 'Nas últimas 4 semanas, quantas vezes teve comichão no nariz?',
  perg4: 'Nas últimas 4 semanas, quantas vezes teve corrimento/pingo do nariz?',
  perg5: 'Nas últimas 4 semanas, quantas vezes teve falta de ar/dispeneia?',
  perg6: 'Nas últimas 4 semanas, quantas vezes teve chiadeira no peito/pieira?',
  perg7: 'Nas últimas 4 semanas, quantas vezes teve aperto no peito com esforço físico?',
  perg8: 'Nas últimas 4 semanas, quantas vezes sentiu cansaço/dificuldade em fazer tarefas do dia-a-dia?',
  perg9: 'Nas últimas 4 semanas, quantas vezes acordou durante a noite devido a sintomas?',
  perg10: 'Nas últimas 4 semanas, teve de aumentar a utilização dos seus medicamentos, por causa das suas doenças alérgicas/rinite/asma?',
  medico_nome: string;
}

export interface CaratResponseDto {
  id: number;
  scoreTotal: number;
  scoreRinite: number;
  scoreAsma: number;
  dataCriacao: Date;
}