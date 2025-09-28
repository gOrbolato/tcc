import React from 'react';
import { Link } from 'react-router-dom';

const RecuperarSenha: React.FC = () => {
  return (
    <div>
      <div>
        <Link to="/">
          <h1>Avaliação Educacional</h1>
        </Link>
      </div>
      <div>
        <form>
          <input type="text" placeholder="CPF" required />
          <button type="submit">Enviar código</button>
        </form>
        <form>
          <input type="text" placeholder="Código de verificação" required />
          <input type="password" placeholder="Nova Senha" required />
          <input type="password" placeholder="Confirmar Nova Senha" required />
          <button type="submit">Alterar Senha</button>
        </form>
      </div>
    </div>
  );
};

export default RecuperarSenha;
