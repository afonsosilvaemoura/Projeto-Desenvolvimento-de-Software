import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
// Ciclo de vida: NOVO → VISTO (automático ao abrir) → EM_SEGUIMENTO (manual) → FECHADO (manual)
// Cada transição requer uma nota obrigatória registada em AlertaAcao.
 
@Entity()
export class Alerta {
 
    @PrimaryGeneratedColumn()
    id!: number;
 
    @Column()
    utente_id!: number;
 
    @Column()
    medico_nome!: string;
 
    // null se o alerta não for gerado por uma avaliação CARAT
    @Column({ nullable: true })
    avaliacao_id!: number | null;
 
    // 'SCORE_BAIXO' | 'DETERIORACAO'
    @Column()
    tipo!: string;
 
    // 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'
    @Column()
    prioridade!: string;
 
    @Column()
    motivo!: string;
 
    // 'NOVO' | 'VISTO' | 'EM_SEGUIMENTO' | 'FECHADO'
    @Column({ default: 'NOVO' })
    estado!: string;
 
    @Column()
    dataCriacao!: Date;
 
    @Column()
    dataAtualizacao!: Date;
}
