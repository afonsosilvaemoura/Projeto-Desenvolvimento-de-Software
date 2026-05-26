import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
// Guarda as respostas como JSON string para evitar 10 colunas separadas.
// O score e o nível de controlo são calculados pelo service no momento da criação.
 
@Entity()
export class AvaliacaoCARAT {
 
    @PrimaryGeneratedColumn()
    id!: number;
 
    // null se a avaliação for feita por utilizador anónimo
    @Column({ nullable: true })
    utente_id!: number | null;
 
    // null se a avaliação for feita pelo próprio utente
    @Column({ nullable: true })
    medico_nome!: string | null;
 
    // Array de 10 respostas (0-3 cada) guardado como JSON string
    @Column()
    respostas!: string;
 
    @Column()
    scoreTotal!: number;
 
    @Column()
    scoreRinite!: number;
 
    @Column()
    scoreAsma!: number;
 
    // 'CONTROLADA' | 'PARCIALMENTE_CONTROLADA' | 'NAO_CONTROLADA'
    @Column()
    nivelControlo!: string;
 
    @Column()
    recomendacao!: string;
 
    @Column()
    proximoPassoSemanas!: number;
 
    @Column({ default: false })
    anonima!: boolean;
 
    @Column()
    dataCriacao!: Date;
}
 