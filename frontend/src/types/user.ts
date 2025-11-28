/**
 * @interface User
 * @description Define a estrutura de dados para um objeto de Usuário,
 * tanto para o usuário autenticado quanto para listas de usuários em painéis de admin.
 */
export interface User {
  id: number; // O identificador único do usuário.
  nome: string; // O nome completo do usuário.
  email: string; // O endereço de e-mail do usuário.
  ra: string | null; // O Registro Acadêmico do usuário.
  isAdmin: boolean; // Flag que indica se o usuário é um administrador.
  isActive: boolean; // Flag que indica se a conta do usuário está ativa.
  instituicao_id: number | null; // O ID da instituição do usuário.
  curso_id: number | null; // O ID do curso do usuário.
  
  // Campos opcionais que podem vir de joins no backend.
  anonymized_id?: string | null; // Um ID anônimo para exibição pública.
  instituicao_nome?: string | null; // O nome da instituição do usuário.
  curso_nome?: string | null; // O nome do curso do usuário.
  media_avaliacoes?: number | null; // A média das avaliações feitas pelo usuário.
}
