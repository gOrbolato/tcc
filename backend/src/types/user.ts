import { RowDataPacket } from 'mysql2';

export interface UsuarioRow extends RowDataPacket {
  id: number;
  nome: string;
  cpf: string | null;
  ra: string;
  email: string;
  senha: string;
  instituicao_id: number | null;
  curso_id: number | null;
  periodo: string | null;
  semestre: string | null;
  previsao_termino: string | null;
  anonymized_id: string;
  is_trancado: boolean;
  reset_token: string | null;
  reset_token_expires_at: Date | null;
  desbloqueio_aprovado_em: Date | null;
  is_active: boolean;
  criado_em: Date;
}
