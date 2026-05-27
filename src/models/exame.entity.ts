import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Exame {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    utente_id!: number;

    @Column()
    tipo_exame!: string;

    @Column()
    exame!: string;

    @Column()
    medico_nome!: string;

    @Column({ type: 'datetime' })
    data_marcacao!: Date;

    @Column({ type: 'datetime' })
    data_criacao!: Date;
}