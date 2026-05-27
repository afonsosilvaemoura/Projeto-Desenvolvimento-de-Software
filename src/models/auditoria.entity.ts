import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
// Regista todas as ações relevantes do sistema para rastreabilidade (RGPD).
// utilizador_id pode ser null em ações do sistema (ex: geração automática de alertas).
 
@Entity()
export class Auditoria {
 
    @PrimaryGeneratedColumn()
    id!: number;
 
    // null se a ação for gerada automaticamente pelo sistema
    @Column({ type: 'int', nullable: true, default: null })
    utilizador_id!: number | null;
 
    // Perfil do utilizador que executou a ação: 'UTENTE' | 'MEDICO' | 'ADMINISTRADOR'
    @Column({ type: 'varchar', nullable: true, default: null })
    perfil!: string | null;
 
    // Descrição da ação: ex. 'CRIAR_UTENTE', 'VER_DASHBOARD', 'SUBMETER_CARAT'
    @Column()
    acao!: string;
 
    // Nome da entidade afetada: ex. 'Utente', 'AvaliacaoCARAT', 'Alerta'
    @Column()
    entidade!: string;
 
    // ID do registo afetado
    @Column({ type: 'int', nullable: true, default: null })
    entidade_id!: number | null;
 
    @Column()
    dataCriacao!: Date;
}



