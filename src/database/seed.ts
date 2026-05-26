// Cria utilizadores de teste na base de dados.
// Executar UMA VEZ com: npx ts-node src/database/seed.ts
 
import 'reflect-metadata';
import bcrypt from 'bcrypt';
import { AppDataSource } from './database';
import { Utente } from '../models/utente.entity';
import { Medico } from '../models/medico.entity';
import { Administrador } from '../models/administrador.entity';
import { LimiarAlerta } from '../models/limiar-alerta.entity';
 
async function seed() {
    await AppDataSource.initialize();
 
    const medicoRepo = AppDataSource.getRepository(Medico);
    const utenteRepo = AppDataSource.getRepository(Utente);
    const adminRepo = AppDataSource.getRepository(Administrador);
    const limiarRepo = AppDataSource.getRepository(LimiarAlerta);
 
    // Médico de teste
    const medicoExiste = await medicoRepo.findOneBy({ email: 'joaosilva@gmail.com' });
    if (!medicoExiste) {
        const medico = medicoRepo.create({
            nome: 'Dr. João Silva',
            email: 'joaosilva@gmail.com',
            password_hash: await bcrypt.hash('1234', 10),
            especialidade: 'Pneumologia',
            numero_cedula: 'C-12345',
            ativo: true,
            dataCriacao: new Date(),
            dataAtualizacao: new Date(),
        });
        await medicoRepo.save(medico);
        console.log('Médico criado → password: 1234');
    }
 
    // Utente de teste (associado ao médico id=1)
    const utenteExiste = await utenteRepo.findOneBy({ email: 'mariasantos@gmail.com' });
    if (!utenteExiste) {
        const utente = utenteRepo.create({
            nome: 'Maria Santos',
            email: 'mariasantos@gmail.com',
            password_hash: await bcrypt.hash('1234', 10),
            data_nascimento: '1985-03-15',
            nif: '123456789',
            telefone: '912345678',
            medico_id: 1,
            ativo: true,
            dataCriacao: new Date(),
            dataAtualizacao: new Date(),
        });
        await utenteRepo.save(utente);
        console.log('Utente criado → password: 1234');
    }
 
    // Administrador de teste
    const adminExiste = await adminRepo.findOneBy({ email: 'admin@gmail.com' });
    if (!adminExiste) {
        const admin = adminRepo.create({
            nome: 'Administrador',
            email: 'admin@gmail.com',
            password_hash: await bcrypt.hash('1234', 10),
            dataCriacao: new Date(),
        });
        await adminRepo.save(admin);
        console.log('Administrador criado → password: 1234');
    }
 
    // Limiares de alerta por defeito
    const limiarExiste = await limiarRepo.findOneBy({ id: 1 });
    if (!limiarExiste) {
        const limiar = limiarRepo.create({
            scoreMinimo: 24,
            deterioracaoPontos: 3,
            dataAtualizacao: new Date(),
        });
        await limiarRepo.save(limiar);
        console.log('Limiares de alerta criados');
    }
 
    console.log('\nSeed concluído!');
    await AppDataSource.destroy();
}
 
seed().catch(console.error);
 