// Define os dados de entrada para criar um exame..
export interface CreateExameDto {
    utente_id: number;
    tipo_exame: string;
    exame: string;
    
    data_marcacao: string; }