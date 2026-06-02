// Define os dados de entrada para autenticação.
// O utilizador seleciona o seu perfil e introduz a password.
 
export interface CreateLoginDto {
    perfil: 'UTENTE' | 'MEDICO' | 'ADMINISTRADOR';
    password: string;
}
 