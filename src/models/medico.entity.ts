import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
@Entity()
export class Medico {
 
    @PrimaryGeneratedColumn()
    id!: number;
 
    @Column()
    nome!: string;
 
    @Column({ unique: true })
    email!: string;
 
    @Column()
    password_hash!: string;
 
    @Column()
    especialidade!: string;
 
    @Column()
    numero_cedula!: string;
 
    // Médico inativado pelo administrador mantém os dados mas perde acesso ao sistema
    @Column({ default: true })
    ativo!: boolean;
 
    @Column()
    dataCriacao!: Date;
 
    @Column()
    dataAtualizacao!: Date;
}