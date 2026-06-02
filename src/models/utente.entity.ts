import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Utente {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome!: string;

    @Column({ unique: true })
    username!: string;

    @Column({ type: 'varchar', nullable: true })
    email!: string | null;

    @Column()
    password_hash!: string;

    @Column({ type: 'varchar', nullable: true })
    data_nascimento!: string | null;

    @Column({ type: 'varchar', nullable: true })
    nif!: string | null;

    @Column({ type: 'varchar', nullable: true })
    telefone!: string | null;

    // Campos clínicos
    @Column({ type: 'varchar', nullable: true })
    sexo!: string | null;           // 'M' | 'F'

    @Column({ type: 'int', nullable: true })
    idade!: number | null;

    @Column({ default: false })
    diagnostico_asma!: boolean;

    @Column({ type: 'varchar', nullable: true })
    data_primeira_consulta!: string | null;

    @Column({ type: 'int', nullable: true })
    medico_id!: number | null;


    @Column({ default: true })
    ativo!: boolean;

    @Column()
    dataCriacao!: Date;

    @Column()
    dataAtualizacao!: Date;
}