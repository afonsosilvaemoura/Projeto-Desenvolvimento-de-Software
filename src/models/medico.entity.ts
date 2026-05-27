import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRole } from './user.entities';
 
@Entity()
export class Medico {
    role: UserRole = UserRole.MEDICO;
 
    @PrimaryGeneratedColumn()
    id!: number;
 
    @Column()
    nome!: string;
 
    @Column({ unique: true })
    username!: string;
 
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