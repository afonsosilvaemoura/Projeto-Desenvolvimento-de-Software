import Database from 'better-sqlite3';
import path from 'path';

interface Medicacao {
  id?: number;
  nome: string;
  codigo: string;
  medico_nome: string;
  dataCriacao?: Date;
}

export class MedicacaoService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, '../database/data.db');
    this.db = new Database(dbPath);
  }

  async listarMedicacoes(): Promise<Medicacao[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, nome, codigo, medico_nome, dataCriacao 
        FROM medicacoes 
        ORDER BY dataCriacao DESC
      `);
      const medicacoes = stmt.all() as Medicacao[];
      return medicacoes;
    } catch (error) {
      throw new Error(`Erro ao listar medicações: ${error}`);
    }
  }

  async criarMedicacao(dados: { nome: string; codigo: string; medico_nome: string }): Promise<Medicacao> {
    try {
      const { nome, codigo, medico_nome } = dados;
      const dataCriacao = new Date().toISOString();

      const stmt = this.db.prepare(`
        INSERT INTO medicacoes (nome, codigo, medico_nome, dataCriacao)
        VALUES (?, ?, ?, ?)
      `);

      const result = stmt.run(nome, codigo, medico_nome, dataCriacao);

      return {
        id: result.lastInsertRowid as number,
        nome,
        codigo,
        medico_nome,
        dataCriacao: new Date(dataCriacao),
      };
    } catch (error) {
      throw new Error(`Erro ao criar medicação: ${error}`);
    }
  }

  async atualizarMedicacao(id: number, dados: Partial<Medicacao>): Promise<Medicacao> {
    try {
      const { nome, codigo, medico_nome } = dados;

      const stmt = this.db.prepare(`
        UPDATE medicacoes 
        SET nome = ?, codigo = ?, medico_nome = ?
        WHERE id = ?
      `);

      stmt.run(nome || '', codigo || '', medico_nome || '', id);

      const medicacao = this.db.prepare(`
        SELECT id, nome, codigo, medico_nome, dataCriacao 
        FROM medicacoes 
        WHERE id = ?
      `).get(id) as Medicacao;

      if (!medicacao) {
        throw new Error('Medicação não encontrada');
      }

      return medicacao;
    } catch (error) {
      throw new Error(`Erro ao atualizar medicação: ${error}`);
    }
  }

  async deletarMedicacao(id: number): Promise<void> {
    try {
      const stmt = this.db.prepare('DELETE FROM medicacoes WHERE id = ?');
      stmt.run(id);
    } catch (error) {
      throw new Error(`Erro ao deletar medicação: ${error}`);
    }
  }
}
