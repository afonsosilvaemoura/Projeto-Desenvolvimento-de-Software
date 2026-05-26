import 'reflect-metadata';
import Database from 'better-sqlite3';
import { DataSource } from 'typeorm';
import { Prescricao } from '../models/prescricao.entity';
import { Exame } from '../models/exame.entity';
import { Carat } from '../models/carat.entity';
import { User } from '../models/user.entity';

const bcrypt = require("bcryptjs");

// "Tabela" de utilizadores
export const baseDeDadosUsers: User[] = [
    { id: 1, username: "medico", password: bcrypt.hashSync("1234", 1), role: "medico" },
    { id: 2, username: "admin", password: bcrypt.hashSync("admin1234", 1), role: "admin" },
    { id: 3, username: "utente", password: bcrypt.hashSync("utente1234", 1), role: "utente" }
];

// ── better-sqlite3 connection ──────────────────────────
let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database('data.db');
    db.pragma('journal_mode = WAL');
  }
  return db;
}

// ── TypeORM DataSource ─────────────────────────────────
export const AppDataSource = new DataSource({
    type: 'better-sqlite3',
    database: 'data.db',
    entities: [Prescricao, Exame, Carat],
    synchronize: true,
});

// ── Initialize TypeORM on startup ─────────────────────
export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('TypeORM database initialized');
    }
  } catch (error) {
    console.error('Erro ao inicializar TypeORM:', error);
  }
}
