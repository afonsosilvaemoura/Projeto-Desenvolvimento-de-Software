// Define os dados de entrada para criar uma prescrição.

export interface CreatePrescricaoDto {
    id: number;
    utente_id: number;
    medico_nome: string;
    farmaco: string;
    dosagem: string;
    posologia: string;
}