import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div>
      <header>
        <span>Aluno(a)-12345</span>
        <nav>
          <ul>
            <li>
              <Link to="/perfil">Perfil</Link>
            </li>
            <li>
              <Link to="/">Sair</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <Link to="/avaliacao">
          <button>Fazer Avaliação</button>
        </Link>
        <section>
          <h2>Últimas Avaliações</h2>
          <div>
            <p>Data: 28/09/2025</p>
            <p>Instituição: Nome da Instituição</p>
            <p>Média Final: 4.5</p>
            <button>Ver Detalhes</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
