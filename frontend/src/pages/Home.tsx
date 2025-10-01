import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Home.css';
import { useAuth } from '../contexts/AuthContext';
import guilhermeOrbolatoFoto from '../assets/images/guilhermeOrbolato.jpg'; 

const Home: React.FC = () => {
  const { user } = useAuth();
  return (
    <main>
      <section className="hero">
        <h1>Consulte e Transforme a Educação</h1>
        <p>Pesquise por instituição, curso ou cidade para ver avaliações. Se é aluno, contribua de forma anônima para a melhoria do seu ensino.</p>
        
        <div className="search-container">
          <form className="search-form">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Digite o nome da instituição, curso ou cidade..." 
            />
            <button type="submit" className="search-button">
              Pesquisar
            </button>
          </form>
        </div>

        {!user && (
          <div className="actions-container">
            <Link to="/login" className="cta-button">
              Começar a Avaliar
            </Link>
          </div>
        )}
      </section>

      <section className="home-section how-it-works">
        <div className="section-content">
          <h2>Como Funciona?</h2>
          <div className="steps">
            <div className="step">
              <h3>1. Pesquisa Aberta</h3>
              <p>Utilize nossa barra de pesquisa para encontrar avaliações sobre instituições, cursos e localidades de forma livre e gratuita.</p>
            </div>
            <div className="step">
              <h3>2. Avaliação Anônima</h3>
              <p>Para contribuir, crie sua conta e responda aos questionários. Sua identidade é sempre preservada para que você se expresse livremente.</p>
            </div>
            <div className="step">
              <h3>3. Análise e Melhorias</h3>
              <p>As avaliações são compiladas e analisadas pela administração para identificar pontos de melhoria e implementar mudanças efetivas.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section about-platform">
        <div className="section-content">
          <div className="about-content">
            <div className="about-image">
              <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop" alt="Estudantes colaborando" />
            </div>
            <div className="about-text">
              <h2>Sobre a Plataforma</h2>
              <p>
                O Sistema de Avaliação Educacional é uma ferramenta desenvolvida para fortalecer a comunicação entre alunos e instituições de ensino. 
                Acreditamos que o feedback construtivo é a chave para aprimorar a qualidade da infraestrutura, do material didático e da experiência acadêmica como um todo. 
                Nossa plataforma garante um processo de avaliação seguro, anônimo e eficiente.
              </p>
            </div>
          </div>
        </div>
      </section>

        <section className="home-section developers">
        <div className="section-content">
          <h2>Desenvolvedores</h2>
          <div className="developer-card">
            {/* 2. Use a variável da foto importada aqui */}
            <img 
              src={guilhermeOrbolatoFoto} 
              alt="Foto de Guilherme Orbolato" 
              className="developer-photo" 
            />
            <div className="developer-info">
              <h3>Guilherme Orbolato</h3>
              <span>Desenvolvedor Full Stack</span>
              <p>
                Responsável pela concepção, desenvolvimento e implementação de todas as funcionalidades do sistema, 
                desde o backend e banco de dados até a interface do usuário no frontend.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section project-presentation">
        <div className="section-content">
          <h2>Apresentação do Projeto</h2>
          <p>
            Este sistema é o resultado de um Trabalho de Conclusão de Curso (TCC) dedicado a aprimorar a comunicação e o feedback no ambiente educacional.
            O objetivo foi desenvolver uma ferramenta robusta, segura e de fácil utilização para alunos e administradores, 
            promovendo um ciclo de melhoria contínua nas instituições de ensino.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Home;