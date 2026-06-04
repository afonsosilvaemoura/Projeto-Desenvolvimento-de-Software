// Representa os dados devolvidos após autenticação bem-sucedida.
export interface LoginResponseDto {
  token:  string;
  role:   string;
  userId: number;
  nome:   string;
}
