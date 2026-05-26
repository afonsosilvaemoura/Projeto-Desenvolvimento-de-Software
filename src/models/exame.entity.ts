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
 
    // Resultado pode ser preenchido posteriormente
    @Column({ nullable: true })
    resultado!: string | null;
 
    @Column()
    dataCriacao!: Date;
}