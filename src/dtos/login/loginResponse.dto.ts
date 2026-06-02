// Define os dados devolvidos ao cliente após autenticação bem-sucedida.
// A password nunca é incluída na resposta.
 
export interface LoginResponseDto {
    token: string;
    perfil: string;
    id: number;
    nome: string;
    email: string;
}
