import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
@Entity()
export class Utente {
 
    @PrimaryGeneratedColumn()
    id!: number;
 
    @Column()
    nome!: string;
 
    @Column({ unique: true })
    email!: string;
 
    @Column()
    password_hash!: string;
 
    @Column()
    data_nascimento!: string;
 
    @Column()
    nif!: string;
 
    @Column()
    telefone!: string;
 
    // Chave estrangeira para o médico responsável (relação 1:N — um médico, vários utentes)
    @Column()
    medico_nome!: string;
 
    @Column({ default: true })
    ativo!: boolean;
 
    @Column()
    dataCriacao!: Date;
 
    @Column()
    dataAtualizacao!: Date;
}