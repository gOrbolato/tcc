import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/Dashboard.css';

const Dashboard: React.FC = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [selectedAvaliacao, setSelectedAvaliacao] = useState<any>(null);

    const avaliacoes = [
        { id: 1, data: '20/04/2024', instituicao: 'Instituição A', media: 4.5, notas: { infra: 4, material: 5 } },
        { id: 2, data: '15/02/2024', instituicao: 'Instituição B', media: 3.8, notas: { infra: 3, material: 4.6 } },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Bem-vindo, Aluno(a)-{Math.floor(10000 + Math.random() * 90000)}</h1>
                <div className="menu-container">
                    <button className="menu-button" onClick={() => setShowMenu(!showMenu)}>
                        &#9776;
                    </button>
                    {showMenu && (
                        <div className="menu-dropdown">
                            <Link to="/perfil">Perfil</Link>
                            <Link to="/">Sair</Link>
                        </div>
                    )}
                </div>
            </div>

            <Link to="/avaliacao" className="avaliacao-button">
                Nova Avaliação
            </Link>

            <div className="avaliacoes-list">
                <h2>Últimas Avaliações</h2>
                {avaliacoes.map(avaliacao => (
                    <div key={avaliacao.id} className="avaliacao-item">
                        <span>{avaliacao.data}</span>
                        <a href="#" onClick={() => setSelectedAvaliacao(avaliacao)}>
                            {avaliacao.instituicao}
                        </a>
                        <span>Média: {avaliacao.media}</span>
                    </div>
                ))}
            </div>

            {selectedAvaliacao && (
                <div className="popup">
                    <div className="popup-content">
                        <span className="close-button" onClick={() => setSelectedAvaliacao(null)}>&times;</span>
                        <h2>Detalhes da Avaliação</h2>
                        <p><strong>Instituição:</strong> {selectedAvaliacao.instituicao}</p>
                        <p><strong>Data:</strong> {selectedAvaliacao.data}</p>
                        <p><strong>Nota Infraestrutura:</strong> {selectedAvaliacao.notas.infra}</p>
                        <p><strong>Nota Material Didático:</strong> {selectedAvaliacao.notas.material}</p>
                        <p><strong>Média Final:</strong> {selectedAvaliacao.media}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;