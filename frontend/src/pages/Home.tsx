import React from 'react';
import '../assets/styles/Home.css';

// Importe as imagens dos criadores
// import a from '../assets/images/a.jpg';


const creators = [
    { name: 'Nome do Criador 1', role: 'Cargo', image: a },
    { name: 'Nome do Criador 2', role: 'Cargo', image: a },
];

const Home: React.FC = () => {
    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>Bem-vindo ao Avaliação Educacional</h1>
                        <p>
                            Uma plataforma segura e anônima para você avaliar sua
                            instituição de ensino. Sua opinião é fundamental para a melhoria
                            contínua da educação.
                        </p>
                    </div>
                    <div className="search-box">
                        <h2>Pesquise por Instituição, Curso ou Cidade</h2>
                        <input type="text" placeholder="Digite sua pesquisa..." />
                        <button>Pesquisar</button>
                    </div>
                </div>
            </section>

            <section className="creators-section">
                <h2>Nossos Criadores</h2>
                <div className="creators-container">
                    {creators.map((creator, index) => (
                        <div key={index} className="creator-card">
                            <img src={creator.image} alt={creator.name} />
                            <h3>{creator.name}</h3>
                            <p>{creator.role}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;