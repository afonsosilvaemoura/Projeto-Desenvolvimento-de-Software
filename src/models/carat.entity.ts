import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AvaliacaoCARAT {

    @PrimaryGeneratedColumn()
    id!: number;

    // FIX: type explícito — TypeORM não resolve "number | null" sozinho
    @Column({ type: 'int', nullable: true, default: null })
    utente_id!: number | null;

    // FIX: type explícito — TypeORM não resolve "string | null" sozinho
    @Column({ type: 'text', nullable: true, default: null })
    medico_nome!: string | null;

    @Column()
    respostas!: string;

    @Column()
    scoreTotal!: number;

    @Column()
    scoreRinite!: number;

    @Column()
    scoreAsma!: number;

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