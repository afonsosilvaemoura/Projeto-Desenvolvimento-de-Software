import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Utente } from '../models/utente.entity';
import { Medico } from '../models/medico.entity';
import { Administrador } from '../models/administrador.entity';
import { AvaliacaoCARAT } from '../models/carat.entity';
import { Alerta } from '../models/alerta.entity';
import { Medicacao } from '../models/medicacao.entity';
import { Prescricao } from '../models/prescricao.entity';
import { Exame } from '../models/exame.entity';
import { Auditoria } from '../models/auditoria.entity';
import { LimiarAlerta } from '../models/limiarAlerta.entity';
 

// Esta lista simula a nossa tabela na base de dados
export const baseDeDadosLocalPrescricao: Prescricao[] = [
    { id: 1, utente_id: 1, medico_nome: "Dr. House", farmaco: "Aspirina", dosagem: "500mg", posologia: "1 vez ao dia", data_criacao: new Date().toISOString() },
    { id: 2, utente_id: 2, medico_nome: "Dr. Who", farmaco: "Paracetamol", dosagem: "650mg", posologia: "2 vezes ao dia", data_criacao: new Date().toISOString() },
];

export const baseDeDadosLocalExames: Exame[] = [
    { id: 1, utente_id: 1, medico_nome: "Dr. House", tipo: "Sangue", justificacao: "Rotina", data_criacao: new Date().toISOString(), data_marcacao: new Date().toISOString() },
    { id: 2, utente_id: 2, medico_nome: "Dr. Who", tipo: "Urina", justificacao: "Dor abdominal", data_criacao: new Date().toISOString(), data_marcacao: new Date().toISOString() },
];

/*
// ── TypeORM DataSource ─────────────────────────────────
export const AppDataSource = new DataSource({
    type: 'better-sqlite3',
    database: 'data.db',
    entities: [
        Utente,
        Medico,
        Administrador,
        AvaliacaoCARAT,
        Alerta,
        Medicacao,
        Prescricao,
        Exame,
        Auditoria,
        LimiarAlerta,
    ],
    synchronize: true,
});
 

// ── Initialize TypeORM on startup ─────────────────────
export async function initializeDatabase() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Base de dados inicializada');
        }
    } catch (error) {
        console.error('Erro ao inicializar a base de dados:', error);
    }
}
    */