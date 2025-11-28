// Importa o tipo RowDataPacket do mysql2 para estender a interface.
import { RowDataPacket } from 'mysql2';

/**
 * @interface UsuarioRow
 * @description Define a estrutura de um registro da tabela 'Usuarios' do banco de dados.
 * Herda de RowDataPacket para ser compatível com os resultados do mysql2.
 */
export interface UsuarioRow extends RowDataPacket {
  id: number;
  nome: string;
  cpf: string | null;
  ra: string;
  email: string;
  senha: string; // Hash da senha
  instituicao_id: number | null;
  curso_id: number | null;
  periodo: string | null;
  semestre: string | null;
  previsao_termino: string | null;
  anonymized_id: string; // ID anônimo para uso público
  is_trancado: boolean; // Indica se a matrícula do usuário está trancada
  reset_token: string | null; // Token para redefinição de senha
  reset_token_expires_at: Date | null; // Data de expiração do token de redefinição
  desbloqueio_aprovado_em: Date | null; // Data em que o desbloqueio de conta foi aprovado
  is_active: boolean; // Indica se o usuário está ativo no sistema
  criado_em: Date; // Data de criação do registro
}
