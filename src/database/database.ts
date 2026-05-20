import 'reflect-metadata';
import Database from 'better-sqlite3';
import { DataSource } from 'typeorm';
import { Prescricao } from '../models/prescricao.entity';
import { Exame } from '../models/exame.entity';
import { Carat } from '../models/carat.entity';

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
      console.log('✓ TypeORM database initialized');
    }
  } catch (error) {
    console.error('Erro ao inicializar TypeORM:', error);
  }
}