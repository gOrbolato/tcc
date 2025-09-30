import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/Dashboard.css';

const AdminDashboard: React.FC = () => {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Painel do Administrador</h1>
                <div className="menu-container">
                    <Link to="/" className="nav-link">Sair</Link>
                </div>
            </div>

            <div className="admin-actions">
                <input type="text" placeholder="Pesquisar instituição ou curso..." />
                <button>Pesquisar</button>
                <button>Baixar Relatórios</button>
            </div>

            <div className="analises-container">
                <h2>Análises</h2>
                <div className="analise-item">
                    <h3>Instituição X - Média Geral: 4.2</h3>
                    <p>Gráficos e análises de IA sobre a instituição...</p>
                    {/* Gráficos podem ser inseridos aqui */}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;