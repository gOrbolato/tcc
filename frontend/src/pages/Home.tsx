import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CookieConsent from '../components/CookieConsent';
import '../styles/Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <CookieConsent />
      <Header />
      <main className="home-main">
        <section className="home-intro-section">
          <div className="intro-text">
            <h1>Avaliação Educacional</h1>
            <p>
              Nosso sistema permite que você avalie sua instituição de ensino, curso e professores de forma anônima e segura. Suas respostas nos ajudam a criar um panorama sobre a qualidade do ensino.
            </p>
          </div>
          <div className="search-box">
            <h2>Pesquise por uma instituição, curso ou cidade</h2>
            <input type="text" placeholder="Pesquisar..." />
            <button>Pesquisar</button>
          </div>
        </section>
        <section className="creators-section">
          <h2>Criadores</h2>
          <div className="creators-container">
            <div className="creator-card">
              <img src="https://via.placeholder.com/120" alt="Foto do criador" />
              <h3>Guilherme Orbolato</h3>
              <p>Desenvolvedor</p>
            </div>
            {/* Adicione mais cards de criadores aqui */}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
