import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Exame {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int' })
    utente_id!: number;

    @Column({ type: 'varchar' })
    tipo_exame!: string;

    @Column({ type: 'varchar' })
    exame!: string;

    @Column({ type: 'int', nullable: true })
    medico_id!: number | null;

    @Column({ type: 'datetime' })
    data_marcacao!: Date;

    @Column({ type: 'datetime' })
    data_criacao!: Date;
}