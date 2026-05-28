import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Medico {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome!: string;

    @Column({ unique: true })
    username!: string;

    @Column()
    password_hash!: string;

    @Column()
    especialidade!: string;

    @Column({ nullable: true })
    numero_cedula!: string | null;

    @Column({ default: true })
    ativo!: boolean;

    @Column()
    dataCriacao!: Date;

    @Column()
    dataAtualizacao!: Date;
}