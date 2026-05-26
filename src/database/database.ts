import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Utente } from '../models/utente.entity';
import { Medico } from '../models/medico.entity';
import { Administrador } from '../models/administrador.entity';
import { Alerta } from '../models/alerta.entity';
import { Medicacao } from '../models/medicacao.entity';
import { Prescricao } from '../models/prescricao.entity';
import { Exame } from '../models/exame.entity';
import { Auditoria } from '../models/auditoria.entity';
import { LimiarAlerta } from '../models/limiarAlerta.entity';
import { AvaliacaoCARAT } from '../models/carat.entity';
 
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
 

