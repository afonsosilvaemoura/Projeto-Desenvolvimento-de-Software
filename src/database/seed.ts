/**
 * Popular a base de dados com dados de teste.
 * Executar: npx ts-node src/database/seed.ts
 */
import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './database';
import { Utente }        from '../models/utente.entity';
import { Medico }        from '../models/medico.entity';
import { Administrador } from '../models/administrador.entity';
import { AvaliacaoCARAT } from '../models/carat.entity';
import { LimiarAlerta }  from '../models/limiarAlerta.entity';

async function seed() {
  await AppDataSource.initialize();
  console.log('BD ligada. A popular...');



  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminRepo = AppDataSource.getRepository(Administrador);
  await adminRepo.save(adminRepo.create({
    nome: 'Administrador SAUDINOB',
    username: 'admin',
    password_hash: bcrypt.hashSync('1234.', 10),
    dataCriacao: new Date()
  }));
  console.log('✓ Admin criado (admin / 1234.)');

  // ── Médicos ────────────────────────────────────────────────────────────────
  const medicosRepo = AppDataSource.getRepository(Medico);
  const medicosData = [
    { nome: 'Dr. Carlos Silva',   username: 'medico1', especialidade: 'Pneumologia',       numero_cedula: 'OM-12345' },
    { nome: 'Dr.ª Ana Ferreira',  username: 'medico2', especialidade: 'Alergologia',        numero_cedula: 'OM-23456' },
    { nome: 'Dr. Rui Costa',      username: 'medico3', especialidade: 'Medicina Interna',   numero_cedula: 'OM-34567' },
  ];
  const medicos = [];
  for (const m of medicosData) {
    const med = await medicosRepo.save(medicosRepo.create({
      ...m, email: `${m.username}@saudinob.pt`,
      password_hash: bcrypt.hashSync('1234.', 10),
      ativo: true, dataCriacao: new Date(), dataAtualizacao: new Date()
    }));
    medicos.push(med);
    console.log(`✓ Médico: ${m.nome} (${m.username} / 1234.)`);
  }

  // ── Utentes (5 por médico) ─────────────────────────────────────────────────
  const utenteRepo = AppDataSource.getRepository(Utente);
  const utentesData = [
    // Médico 1 - Dr. Carlos Silva
    { nome:'João Silva',       username:'joao',      sexo:'M', idade:45, asma:true,  consulta:'2020-03-15', midx:0 },
    { nome:'Maria Santos',     username:'maria',     sexo:'F', idade:32, asma:false, consulta:'2021-06-10', midx:0 },
    { nome:'Pedro Oliveira',   username:'pedro',     sexo:'M', idade:58, asma:true,  consulta:'2019-11-20', midx:0 },
    { nome:'Ana Costa',        username:'ana',       sexo:'F', idade:27, asma:true,  consulta:'2022-01-08', midx:0 },
    { nome:'Rui Fernandes',    username:'rui',       sexo:'M', idade:63, asma:false, consulta:'2018-09-14', midx:0 },
    // Médico 2 - Dr.ª Ana Ferreira
    { nome:'Sofia Martins',    username:'sofia',     sexo:'F', idade:41, asma:true,  consulta:'2021-02-25', midx:1 },
    { nome:'Miguel Pereira',   username:'miguel',    sexo:'M', idade:35, asma:false, consulta:'2022-07-19', midx:1 },
    { nome:'Catarina Lopes',   username:'catarina',  sexo:'F', idade:52, asma:true,  consulta:'2020-05-03', midx:1 },
    { nome:'Diogo Alves',      username:'diogo',     sexo:'M', idade:29, asma:true,  consulta:'2023-03-12', midx:1 },
    { nome:'Helena Rodrigues', username:'helena',    sexo:'F', idade:67, asma:false, consulta:'2017-12-01', midx:1 },
    // Médico 3 - Dr. Rui Costa
    { nome:'António Gomes',    username:'antonio',   sexo:'M', idade:48, asma:true,  consulta:'2019-08-22', midx:2 },
    { nome:'Margarida Sousa',  username:'margarida', sexo:'F', idade:38, asma:true,  consulta:'2021-04-17', midx:2 },
    { nome:'Tiago Mendes',     username:'tiago',     sexo:'M', idade:55, asma:false, consulta:'2020-10-30', midx:2 },
    { nome:'Inês Carvalho',    username:'ines',      sexo:'F', idade:31, asma:true,  consulta:'2022-09-05', midx:2 },
    { nome:'Bruno Pinto',      username:'bruno',     sexo:'M', idade:72, asma:false, consulta:'2016-06-18', midx:2 },
  ];

  const utentes = [];
  for (const u of utentesData) {
    const medico = medicos[u.midx];
    const utente = await utenteRepo.save(utenteRepo.create({
      nome: u.nome, username: u.username,
      email: `${u.username}@email.pt`,
      password_hash: bcrypt.hashSync('1234', 10),
      sexo: u.sexo, idade: u.idade,
      diagnostico_asma: u.asma,
      data_primeira_consulta: u.consulta,
      medico_id: medico.id,
      nif: null, telefone: null, data_nascimento: null,
      ativo: true, dataCriacao: new Date(), dataAtualizacao: new Date()
    }));
    utentes.push(utente);
  }
  console.log(`✓ ${utentes.length} utentes criados (password: 1234)`);

  // ── CARAT (2 avaliações por utente, espaçadas 30 dias) ────────────────────
  const caratRepo = AppDataSource.getRepository(AvaliacaoCARAT);
  const baseScores = [
    [3,3,3,3,3,3,3,3,3,3], // controlado
    [2,2,2,2,2,2,2,2,2,2], // médio
    [3,3,2,3,3,3,3,3,2,3], // controlado
    [1,1,2,1,2,2,1,1,2,1], // não controlado
    [2,3,3,2,3,2,3,2,3,2], // controlado
    [0,1,1,0,1,0,1,0,1,0], // critico
    [3,2,3,3,3,3,2,3,3,3], // controlado
    [2,2,3,2,3,3,2,3,2,2], // controlado
    [1,2,1,1,2,1,2,1,2,1], // baixo
    [3,3,3,2,3,3,3,3,3,2], // controlado
    [2,3,2,3,2,3,2,3,2,3], // controlado
    [1,1,1,2,1,2,1,2,1,1], // não controlado
    [3,3,3,3,2,3,3,2,3,3], // controlado
    [0,1,0,1,1,1,0,1,0,1], // critico
    [2,2,2,3,2,2,3,2,2,2], // médio
  ];

  for (let i = 0; i < utentes.length; i++) {
    for (let j = 0; j < 2; j++) {
      const res = baseScores[i].map(v => Math.max(0, Math.min(3, v - j)));
      const scoreTotal  = res.reduce((a, v) => a + v, 0);
      const scoreRinite = res.slice(0,4).reduce((a, v) => a + v, 0);
      const scoreAsma   = res.slice(4).reduce((a, v) => a + v, 0);
      const controlada  = scoreTotal > 24;
      await caratRepo.save(caratRepo.create({
        utente_id: utentes[i].id,
        medico_nome: null,
        respostas: JSON.stringify(res),
        scoreTotal, scoreRinite, scoreAsma,
        nivelControlo: controlada ? 'CONTROLADA' : 'NAO_CONTROLADA',
        recomendacao:  controlada ? 'Controlado — próxima avaliação em 12 semanas.' : 'Consultar médico com brevidade.',
        proximoPassoSemanas: controlada ? 12 : 4,
        anonima: false,
        dataCriacao: new Date(Date.now() - j * 30 * 24 * 60 * 60 * 1000)
      }));
    }
  }
  console.log(`✓ ${utentes.length * 2} avaliações CARAT criadas`);

  // ── LimiarAlerta ──────────────────────────────────────────────────────────
  const limiarRepo = AppDataSource.getRepository(LimiarAlerta);
  const existing = await limiarRepo.findOne({ where: {} as any });
  if (!existing) {
    await limiarRepo.save(limiarRepo.create({ scoreMinimo: 24, deterioracaoPontos: 3, dataAtualizacao: new Date() }));
    console.log('✓ LimiarAlerta criado (scoreMinimo=24, deterioracaoPontos=3)');
  }

  console.log('\nSeed concluído! Resumo de logins:');
  console.log('   admin    / 1234  (administrador)');
  console.log('   medico1  / 1234  (Dr. Carlos Silva)');
  console.log('   medico2  / 1234  (Dr.ª Ana Ferreira)');
  console.log('   medico3  / 1234  (Dr. Rui Costa)');
  console.log('   joao     / 1234   (e mais 14 utentes com password 1234)');
  process.exit(0);
}

seed().catch(err => { console.error('Erro no seed:', err); process.exit(1); });