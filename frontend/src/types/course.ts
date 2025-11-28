/**
 * @interface Course
 * @description Define a estrutura de dados para um objeto de Curso.
 */
export interface Course {
  id: number; // O identificador único do curso.
  nome: string; // O nome do curso.
  instituicao_id: number; // O ID da instituição à qual o curso pertence.
}
