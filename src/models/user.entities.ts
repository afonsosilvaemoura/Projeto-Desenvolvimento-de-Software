// src/models/usuario.entity.ts
export enum UserRole {
  ADMIN = 'admin',
  MEDICO = 'medico',
  UTENTE = 'utente'
}

// Interface que todas as entidades de utilizador devem implementar
export interface IAuthUser {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
}