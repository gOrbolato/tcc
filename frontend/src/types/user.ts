export interface User {
  id: number;
  nome: string;
  email: string;
  ra: string | null;
  isAdmin: boolean;
  isActive: boolean;
  instituicao_id: number | null;
  curso_id: number | null;
  anonymized_id?: string | null;
  instituicao_nome?: string | null;
  curso_nome?: string | null;
  media_avaliacoes?: number | null;
}
