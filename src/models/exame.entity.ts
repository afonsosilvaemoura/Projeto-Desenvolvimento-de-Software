import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
@Entity()
export class Exame {
 
    @PrimaryGeneratedColumn()
    id!: number;
 
    @Column()
    utente_id!: number;
 
    @Column()
    medico_nome!: string;
 
    @Column()
    tipo!: string;
 
    @Column()
    justificacao!: string;
 
    @Column()
    data_criacao!: string; // Data de criação do registro

    @Column()
    data_marcacao!: string; // Data em que o exame está marcado para acontecer
}