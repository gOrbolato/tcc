import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Sair</Link>
        </nav>
      </header>
      <main>
        <h1>Dashboard do Administrador</h1>
        <input type="text" placeholder="Pesquisar por instituição ou curso" />
        <button>Baixar Relatórios</button>
        <section>
          <h2>Análises</h2>
          {/* Aqui entrariam os gráficos e análises gerados pela IA */}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
