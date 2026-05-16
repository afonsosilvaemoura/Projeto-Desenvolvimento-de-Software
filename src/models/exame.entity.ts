// @ts-ignore: typeorm module may not be resolved in this environment
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Exame {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    tipo_exame!: string;

    @Column()
    exame!: string;

    @Column()
    medico_nome!: string;

    @Column()
    dataCriacao!: Date;
}