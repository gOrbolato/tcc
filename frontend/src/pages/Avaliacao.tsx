import React from 'react';

const Avaliacao: React.FC = () => {
  return (
    <div>
      <h1>Avaliação</h1>
      <form>
        <h2>Instituição</h2>
        <label>Infraestrutura</label>
        <input type="number" min="1" max="5" required />
        <textarea placeholder="Observações"></textarea>

        <h2>Curso</h2>
        <label>Material Didático</label>
        <input type="number" min="1" max="5" required />
        <textarea placeholder="Observações"></textarea>

        <button type="submit">Salvar Avaliação</button>
      </form>
    </div>
  );
};

export default Avaliacao;
