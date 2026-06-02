
// Define os dados de entrada para criar um médico.
export interface CreateMedicoDto {
    nome: string;
    email: string;
    password: string;
    telefone?: string | null;
    especialidade: string;
    cedula_profissional: string;
}