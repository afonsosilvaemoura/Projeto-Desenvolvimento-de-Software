import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
@Entity()
export class Administrador {
 
    @PrimaryGeneratedColumn()
    id!: number;
 
    @Column()
    nome!: string;
 
    @Column({ unique: true })
    email!: string;
 
    @Column()
    password_hash!: string;
 
    @Column()
    dataCriacao!: Date;
}
 

