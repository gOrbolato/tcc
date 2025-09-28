import React from 'react';

const Perfil: React.FC = () => {
  return (
    <div>
      <h1>Perfil</h1>
      <form>
        <input type="password" placeholder="Nova Senha" />
        <input type="password" placeholder="Confirmar Nova Senha" />
        <input type="text" placeholder="Curso" />
        <input type="text" placeholder="Instituição" />
        <select>
          <option value="">Período</option>
          <option value="diurno">Diurno</option>
          <option value="noturno">Noturno</option>
          <option value="integral">Integral</option>
        </select>
        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
};

export default Perfil;
