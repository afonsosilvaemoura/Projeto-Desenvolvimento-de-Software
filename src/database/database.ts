import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Utente } from '../models/utente.entity';
import { Medico } from '../models/medico.entity';
import { Administrador } from '../models/administrador.entity';
import { Prescricao } from '../models/prescricao.entity';
import { Exame } from '../models/exame.entity';
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
        Prescricao,
        Exame,
    ],
    synchronize: true,
});
 

export const baseDeDadosUsers = [
    {
        id: "1",
        username: "joao",
        password: "1234", 
        role: "utente"
    },
    {
        id: "2",
        username: "admin",
        password: "1234", 
        role: "administrador"
    },
    {
        id: "3",
        username: "medico1",
        password: "1234.", 
        role: "medico"
    }
]