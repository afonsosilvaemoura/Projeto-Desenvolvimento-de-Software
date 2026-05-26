import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Prescricao {

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
    data_criacao!: string;
}