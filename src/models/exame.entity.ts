import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
@Entity()
export class Exame {
 
    @PrimaryGeneratedColumn()
    utente_id!: number;
 
    @Column()
    tipo_exame!: string;
 
    @Column()
    exame!: string;
 
    @Column()
    medico_nome!: string;
 
    @Column()
    data_marcacao!: Date;

    @Column()
    data_criacao!: Date;

}