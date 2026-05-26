import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
// Soft delete: a medicação nunca é removida fisicamente da base de dados.
// Quando suspensa, o estado passa para INATIVA e o motivo é registado.
// Isto garante o histórico clínico do utente para fins de auditoria.
 
@Entity()
export class Medicacao {
 
    @PrimaryGeneratedColumn()
    id!: number;
 
    @Column()
    utente_id!: number;
 
    @Column()
    medico_nome!: string;
 
    @Column()
    farmaco!: string;
 
    @Column()
    dosagem!: string;
 
    @Column()
    posologia!: string;
 
    @Column()
    dataInicio!: string;
 
    @Column({ nullable: true })
    dataFim!: string | null;
 
    // 'ATIVA' | 'INATIVA'
    @Column({ default: 'ATIVA' })
    estado!: string;
 
    // Preenchido quando o médico suspende a medicação
    @Column({ nullable: true })
    motivoSuspensao!: string | null;
 
    @Column()
    dataCriacao!: Date;
 
    @Column()
    dataAtualizacao!: Date;
}