import { getDb } from './db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const db = getDb();
  const now = new Date().toISOString();

  console.log('🌱 A popular a base de dados...');

  // --- ADMINISTRADOR ---
  const adminId = 'admin-001';
  const adminHash = await bcrypt.hash('admin123', 10);
  db.prepare(`INSERT OR IGNORE INTO utilizadores (id,nome,email,password_hash,perfil,ativo,criado_em,atualizado_em)
    VALUES (?,?,?,?,?,1,?,?)`).run(adminId, 'Administrador Sistema', 'admin@saudinob.pt', adminHash, 'ADMINISTRADOR', now, now);

  // --- MÉDICOS ---
  const medico1Id = 'medico-001';
  const medico2Id = 'medico-002';
  const medicoHash = await bcrypt.hash('medico123', 10);

  db.prepare(`INSERT OR IGNORE INTO utilizadores (id,nome,email,password_hash,perfil,ativo,criado_em,atualizado_em)
    VALUES (?,?,?,?,?,1,?,?)`).run(medico1Id, 'Dra. Ana Ferreira', 'ana.ferreira@saudinob.pt', medicoHash, 'MEDICO', now, now);
  db.prepare(`INSERT OR IGNORE INTO medicos (id,numero_cedula,especialidade)
    VALUES (?,?,?)`).run(medico1Id, 'C-12345', 'Pneumologia');

  db.prepare(`INSERT OR IGNORE INTO utilizadores (id,nome,email,password_hash,perfil,ativo,criado_em,atualizado_em)
    VALUES (?,?,?,?,?,1,?,?)`).run(medico2Id, 'Dr. Carlos Mendes', 'carlos.mendes@saudinob.pt', medicoHash, 'MEDICO', now, now);
  db.prepare(`INSERT OR IGNORE INTO medicos (id,numero_cedula,especialidade)
    VALUES (?,?,?)`).run(medico2Id, 'C-67890', 'Alergologia');

  // --- UTENTES ---
  const utente1Id = 'utente-001';
  const utente2Id = 'utente-002';
  const utenteHash = await bcrypt.hash('utente123', 10);

  db.prepare(`INSERT OR IGNORE INTO utilizadores (id,nome,email,password_hash,perfil,ativo,criado_em,atualizado_em)
    VALUES (?,?,?,?,?,1,?,?)`).run(utente1Id, 'João Silva', 'joao.silva@email.pt', utenteHash, 'UTENTE', now, now);
  db.prepare(`INSERT OR IGNORE INTO utentes (id,data_nascimento,nif,telefone,medico_id)
    VALUES (?,?,?,?,?)`).run(utente1Id, '1985-03-15', '123456789', '912345678', medico1Id);

  db.prepare(`INSERT OR IGNORE INTO utilizadores (id,nome,email,password_hash,perfil,ativo,criado_em,atualizado_em)
    VALUES (?,?,?,?,?,1,?,?)`).run(utente2Id, 'Maria Costa', 'maria.costa@email.pt', utenteHash, 'UTENTE', now, now);
  db.prepare(`INSERT OR IGNORE INTO utentes (id,data_nascimento,nif,telefone,medico_id)
    VALUES (?,?,?,?,?)`).run(utente2Id, '1972-07-22', '987654321', '923456789', medico1Id);

  // --- AVALIAÇÕES CARAT (historial) ---
  // João - 3 avaliações (piorando ao longo do tempo)
  const aval1Id = uuidv4();
  const aval2Id = uuidv4();
  const aval3Id = uuidv4();

  db.prepare(`INSERT OR IGNORE INTO avaliacoes_carat
    (id,utente_id,medico_id,data,respostas,score,nivel_controlo,recomendacoes,proximo_passo_semanas,anonima,criado_em)
    VALUES (?,?,?,?,?,?,?,?,?,0,?)`).run(
    aval1Id, utente1Id, medico1Id, '2026-01-15',
    JSON.stringify([3,3,3,3,3,3,3,3,3,3]), 30,
    'CONTROLADA', 'Doença bem controlada. Manter medicação atual.', 12, now
  );
  db.prepare(`INSERT OR IGNORE INTO avaliacoes_carat
    (id,utente_id,medico_id,data,respostas,score,nivel_controlo,recomendacoes,proximo_passo_semanas,anonima,criado_em)
    VALUES (?,?,?,?,?,?,?,?,?,0,?)`).run(
    aval2Id, utente1Id, medico1Id, '2026-02-20',
    JSON.stringify([2,2,2,2,2,2,2,2,2,2]), 20,
    'PARCIALMENTE_CONTROLADA', 'Doença parcialmente controlada. Reavaliar medicação.', 4, now
  );
  db.prepare(`INSERT OR IGNORE INTO avaliacoes_carat
    (id,utente_id,medico_id,data,respostas,score,nivel_controlo,recomendacoes,proximo_passo_semanas,anonima,criado_em)
    VALUES (?,?,?,?,?,?,?,?,?,0,?)`).run(
    aval3Id, utente1Id, medico1Id, '2026-03-25',
    JSON.stringify([1,1,1,1,1,1,1,1,1,1]), 10,
    'NAO_CONTROLADA', 'Doença não controlada. Consulta urgente necessária.', 2, now
  );

  // --- ALERTAS ---
  const alerta1Id = uuidv4();
  db.prepare(`INSERT OR IGNORE INTO alertas
    (id,utente_id,medico_id,avaliacao_id,tipo,prioridade,motivo,estado,criado_em,atualizado_em)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    alerta1Id, utente1Id, medico1Id, aval3Id,
    'SCORE_BAIXO', 'ALTA',
    'Score CARAT de 10, abaixo do limiar de 16 pontos.',
    'NOVO', now, now
  );
  const alerta2Id = uuidv4();
  db.prepare(`INSERT OR IGNORE INTO alertas
    (id,utente_id,medico_id,avaliacao_id,tipo,prioridade,motivo,estado,criado_em,atualizado_em)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    alerta2Id, utente1Id, medico1Id, aval3Id,
    'DETERIORACAO', 'CRITICA',
    'Deterioração de 10 pontos face à avaliação anterior (20 → 10).',
    'NOVO', now, now
  );

  // --- MEDICAÇÃO ---
  const med1Id = uuidv4();
  db.prepare(`INSERT OR IGNORE INTO medicacao
    (id,utente_id,medico_id,farmaco,dosagem,posologia,data_inicio,estado,criado_em,atualizado_em)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    med1Id, utente1Id, medico1Id,
    'Fluticasona + Salmeterol', '250/25mcg', '1 inalação 2x/dia',
    '2026-01-15', 'ATIVA', now, now
  );

  // --- EXAMES ---
  const exame1Id = uuidv4();
  db.prepare(`INSERT OR IGNORE INTO exames
    (id,utente_id,medico_id,tipo,justificacao,data,resultado,criado_em)
    VALUES (?,?,?,?,?,?,?,?)`).run(
    exame1Id, utente1Id, medico1Id,
    'Espirometria', 'Controlo da função respiratória',
    '2026-01-15', 'FEV1: 78% do previsto. Padrão obstrutivo ligeiro.', now
  );

  console.log('✅ Seed concluído!\n');
  console.log('Credenciais de teste:');
  console.log('  Admin:  admin@saudinob.pt / admin123');
  console.log('  Médico: ana.ferreira@saudinob.pt / medico123');
  console.log('  Utente: joao.silva@email.pt / utente123');
}

seed().catch(console.error);