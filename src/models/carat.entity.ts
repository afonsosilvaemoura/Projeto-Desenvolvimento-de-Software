import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Carat {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome!: string;

    @Column()
    codigo!: string;

    @Column()
    medico_nome!: string;

    @Column()
    dataCriacao!: Date;
}