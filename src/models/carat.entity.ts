import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Carat {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    perg1!: number;

    @Column()
    perg2!: number;

    @Column()
    perg3!: number;

    @Column()
    perg4!: number;

    @Column()
    perg5!: number;

    @Column()
    perg6!: number;

    @Column()
    perg7!: number;

    @Column()
    perg8!: number;

    @Column()
    perg9!: number;

    @Column()
    perg10!: number;

    @Column()
    codigo!: string;

    @Column()
    medico_nome!: string;

    @Column()
    dataCriacao!: Date;
}